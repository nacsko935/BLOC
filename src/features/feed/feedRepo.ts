import { getDb } from "../../core/data/db";

export type PostInteraction = {
  liked: boolean;
  saved: boolean;
  commentsCount: number;
  likesCount: number;
  savesCount: number;
};

export type PostComment = {
  id: string;
  text: string;
  createdAt: number;
};

type InteractionRow = {
  liked: number | null;
  saved: number | null;
};

type MetaRow = {
  comments_count: number | null;
  likes_count: number | null;
  saves_count: number | null;
};

type CountRow = { c: number };

export async function getPostInteraction(postId: string, base?: { likes: number; saves: number; comments: number }): Promise<PostInteraction> {
  const db = await getDb();
  const row = await db.getFirstAsync<InteractionRow>(`SELECT liked, saved FROM post_interactions WHERE post_id = ?`, [postId]);
  const meta = await db.getFirstAsync<MetaRow>(`SELECT comments_count, likes_count, saves_count FROM post_meta WHERE post_id = ?`, [postId]);
  const baseLikes = base?.likes ?? 0;
  const baseSaves = base?.saves ?? 0;
  const baseComments = base?.comments ?? 0;

  return {
    liked: !!row?.liked,
    saved: !!row?.saved,
    commentsCount: meta?.comments_count ?? baseComments,
    likesCount: meta?.likes_count ?? baseLikes,
    savesCount: meta?.saves_count ?? baseSaves,
  };
}

async function upsertInteraction(postId: string, patch: Partial<PostInteraction>) {
  const db = await getDb();
  const now = Date.now();
  const current = await getPostInteraction(postId);
  await db.runAsync(
    `INSERT OR REPLACE INTO post_interactions (post_id, liked, saved, comments_count, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      postId,
      patch.liked ?? current.liked ? 1 : 0,
      patch.saved ?? current.saved ? 1 : 0,
      patch.commentsCount ?? current.commentsCount,
      now,
    ]
  );
}

async function upsertMeta(postId: string, patch: Partial<PostInteraction>) {
  const db = await getDb();
  const now = Date.now();
  const current = await getPostInteraction(postId);
  await db.runAsync(
    `INSERT OR REPLACE INTO post_meta (post_id, likes_count, saves_count, comments_count, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      postId,
      patch.likesCount ?? current.likesCount,
      patch.savesCount ?? current.savesCount,
      patch.commentsCount ?? current.commentsCount,
      now,
    ]
  );
}

export async function toggleLike(postId: string, base?: { likes: number; saves: number; comments: number }) {
  const current = await getPostInteraction(postId, base);
  const nextLiked = !current.liked;
  await upsertInteraction(postId, { liked: nextLiked });
  await upsertMeta(postId, {
    likesCount: nextLiked ? current.likesCount + 1 : Math.max(0, current.likesCount - 1),
  });
  return nextLiked;
}

export async function toggleSave(postId: string, base?: { likes: number; saves: number; comments: number }) {
  const current = await getPostInteraction(postId, base);
  const nextSaved = !current.saved;
  await upsertInteraction(postId, { saved: nextSaved });
  await upsertMeta(postId, {
    savesCount: nextSaved ? current.savesCount + 1 : Math.max(0, current.savesCount - 1),
  });
  return nextSaved;
}

export async function addComment(postId: string, text: string) {
  const db = await getDb();
  const now = Date.now();
  const id = `${now}-${Math.random().toString(16).slice(2)}`;
  await db.runAsync(
    `INSERT INTO post_comments (id, post_id, text, created_at) VALUES (?, ?, ?, ?)`,
    [id, postId, text, now]
  );
  const countRow = await db.getFirstAsync<CountRow>(`SELECT COUNT(*) AS c FROM post_comments WHERE post_id = ?`, [postId]);
  const count = countRow?.c ?? 0;
  await upsertInteraction(postId, { commentsCount: count });
  await upsertMeta(postId, { commentsCount: count });
  return { id, text, createdAt: now };
}

export async function listComments(postId: string, limit = 5, offset = 0): Promise<PostComment[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT id, text, created_at FROM post_comments WHERE post_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [postId, limit, offset]
  );
  return rows.map((r: any) => ({ id: r.id, text: r.text, createdAt: r.created_at }));
}

export async function countComments(postId: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<CountRow>(`SELECT COUNT(*) AS c FROM post_comments WHERE post_id = ?`, [postId]);
  return row?.c ?? 0;
}

export async function deleteComment(id: string, postId: string) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM post_comments WHERE id = ?`, [id]);
  const count = await countComments(postId);
  await upsertInteraction(postId, { commentsCount: count });
  await upsertMeta(postId, { commentsCount: count });
}
