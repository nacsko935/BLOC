import { getSupabaseOrThrow } from "../supabase";
import { FeedComment, FeedPost, Post, PostType, Profile } from "../../types/db";
import { fetchBlockedUserIds, fetchHiddenPostIds } from "./moderationService";

type FetchFeedParams = {
  filiere?: string;
  limit?: number;
  cursor?: string;
};

type FetchFeedResult = {
  posts: FeedPost[];
  nextCursor: string | null;
};

type RawPostRow = {
  id: string | number;
  author_id?: string | null;
  filiere?: string | null;
  title?: string | null;
  content?: string | null;
  type?: string | null;
  attachment_url?: string | null;
  created_at?: string;
};

/**
 * IMPORTANT:
 * On standardise sur posts.author_id (pas de user_id).
 * Si tu vois encore "Utilisateur 239026", ça voudra dire:
 * - soit profiles n'existe pas pour author_id
 * - soit RLS bloque la lecture de profiles
 */
function normalizePostRow(row: RawPostRow): Post | null {
  const authorId = row.author_id ?? undefined;
  if (!authorId) return null;

  return {
    id: String(row.id),
    author_id: authorId,
    user_id: null, // legacy, gardé pour compat types, mais non utilisé
    filiere: (row.filiere as string | null | undefined) ?? null,
    title: (row.title as string | null | undefined) ?? null,
    content: String(row.content ?? ""),
    type: (row.type as PostType | undefined) ?? "text",
    attachment_url: (row.attachment_url as string | null | undefined) ?? null,
    created_at: (row.created_at as string | undefined) ?? new Date().toISOString(),
  };
}

function mapCountRows(rows: { post_id: string }[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.post_id] = (acc[row.post_id] ?? 0) + 1;
    return acc;
  }, {});
}

async function requireUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Session introuvable");
  return userId;
}

export async function fetchFeed(params: FetchFeedParams = {}): Promise<FetchFeedResult> {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();
  const pageSize = params.limit ?? 10;

  // Pattern standard: pagination par curseur + limit+1 pour savoir s'il reste des pages.
  let query = supabase
    .from("posts")
    .select("id,author_id,filiere,title,content,type,attachment_url,created_at")
    .order("created_at", { ascending: false })
    .limit(pageSize + 1);

  if (params.filiere) query = query.eq("filiere", params.filiere);
  if (params.cursor) query = query.lt("created_at", params.cursor);

  const { data, error } = await query;
  if (error) throw error;

  const normalizedRows = ((data ?? []) as RawPostRow[])
    .map((row) => normalizePostRow(row))
    .filter((row): row is Post => Boolean(row));

  const hasMore = normalizedRows.length > pageSize;
  const rawPosts = hasMore ? normalizedRows.slice(0, pageSize) : normalizedRows;

  if (rawPosts.length === 0) {
    return { posts: [], nextCursor: null };
  }

  const [blockedUserIds, hiddenPostIds] = await Promise.all([
    fetchBlockedUserIds(),
    fetchHiddenPostIds(),
  ]);

  const blockedSet = new Set(blockedUserIds);
  const hiddenSet = new Set(hiddenPostIds);

  const posts = rawPosts.filter(
    (post) => !blockedSet.has(post.author_id) && !hiddenSet.has(post.id)
  );

  // Si la page est filtr�e c�t� mod�ration, on garde le curseur pour charger la suite.
  if (posts.length === 0) {
    return {
      posts: [],
      nextCursor: hasMore ? rawPosts[rawPosts.length - 1].created_at : null,
    };
  }

  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(new Set(posts.map((post) => post.author_id)));

  const [profilesRes, likesRes, savesRes, commentsRes, myLikesRes, mySavesRes] =
    await Promise.all([
      supabase.from("profiles").select("*").in("id", authorIds),
      supabase.from("post_likes").select("post_id").in("post_id", postIds),
      supabase.from("post_saves").select("post_id").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
      supabase.from("post_likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
      supabase.from("post_saves").select("post_id").eq("user_id", userId).in("post_id", postIds),
    ]);

  if (profilesRes.error) throw profilesRes.error;
  if (likesRes.error) throw likesRes.error;
  if (savesRes.error) throw savesRes.error;
  if (commentsRes.error) throw commentsRes.error;
  if (myLikesRes.error) throw myLikesRes.error;
  if (mySavesRes.error) throw mySavesRes.error;

  const profileMap = new Map<string, Profile>(
    (profilesRes.data ?? []).map((p) => [p.id, p as Profile])
  );

  const likesCountMap = mapCountRows((likesRes.data ?? []) as { post_id: string }[]);
  const savesCountMap = mapCountRows((savesRes.data ?? []) as { post_id: string }[]);
  const commentsCountMap = mapCountRows((commentsRes.data ?? []) as { post_id: string }[]);

  const myLikes = new Set((myLikesRes.data ?? []).map((row) => row.post_id));
  const mySaves = new Set((mySavesRes.data ?? []).map((row) => row.post_id));

  const feedPosts: FeedPost[] = posts.map((post) => ({
    ...post,
    author: profileMap.get(post.author_id) ?? null,
    likesCount: likesCountMap[post.id] ?? 0,
    commentsCount: commentsCountMap[post.id] ?? 0,
    savesCount: savesCountMap[post.id] ?? 0,
    likedByMe: myLikes.has(post.id),
    savedByMe: mySaves.has(post.id),
  }));

  return {
    posts: feedPosts,
    nextCursor: hasMore ? rawPosts[rawPosts.length - 1].created_at : null,
  };
}
export async function createPost(input: {
  title?: string;
  content: string;
  filiere: string;
  type?: PostType;
  attachment_url?: string | null;
}) {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();

  // ✅ Plus de fallback user_id : ta DB n'a pas cette colonne
  const payload = {
    author_id: userId,
    title: input.title?.trim() || null,
    content: input.content.trim(),
    filiere: input.filiere.trim(),
    type: input.type ?? "text",
    attachment_url: input.attachment_url ?? null,
  };

  const insertRes = await supabase.from("posts").insert(payload).select("*").single();
  if (insertRes.error) throw insertRes.error;

  const profileRes = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (profileRes.error) throw profileRes.error;

  const post = normalizePostRow(insertRes.data as RawPostRow);
  if (!post) throw new Error("Post créé invalide.");

  return {
    ...post,
    author: (profileRes.data as Profile | null) ?? null,
    likesCount: 0,
    commentsCount: 0,
    savesCount: 0,
    likedByMe: false,
    savedByMe: false,
  } as FeedPost;
}

// Fire-and-forget: send a notification to a post's author (skip if self)
async function notifyPostAuthor(opts: {
  postId: string;
  fromUserId: string;
  type: "like" | "comment" | "repost";
}) {
  try {
    const supabase = getSupabaseOrThrow();
    const [postRes, profileRes] = await Promise.all([
      supabase.from("posts").select("author_id").eq("id", opts.postId).maybeSingle(),
      supabase.from("profiles").select("display_name,full_name,username").eq("id", opts.fromUserId).maybeSingle(),
    ]);
    const authorId = postRes.data?.author_id as string | undefined;
    if (!authorId || authorId === opts.fromUserId) return; // don't self-notify
    const p = profileRes.data as { display_name?: string; full_name?: string; username?: string } | null;
    const name = p?.display_name || p?.full_name || p?.username || "Quelqu'un";
    const messages = {
      like:    { title: `${name} a aimé ta publication`, body: "Votre publication a reçu un nouveau like." },
      comment: { title: `${name} a commenté ta publication`, body: "Quelqu'un a laissé un commentaire." },
      repost:  { title: `${name} a reposté ta publication`, body: "Votre publication a été partagée." },
    };
    const msg = messages[opts.type];
    await supabase.from("notifications").insert({
      user_id: authorId,
      from_user_id: opts.fromUserId,
      type: opts.type,
      title: msg.title,
      body: msg.body,
      target_id: opts.postId,
      read: false,
    });
  } catch { /* best-effort */ }
}

export async function toggleLike(postId: string) {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();

  const existing = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data) {
    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
  if (error) throw error;
  notifyPostAuthor({ postId, fromUserId: userId, type: "like" });
  return true;
}

export async function toggleSave(postId: string) {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();

  const existing = await supabase
    .from("post_saves")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data) {
    const { error } = await supabase.from("post_saves").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from("post_saves").insert({ post_id: postId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function fetchComments(postId: string) {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("comments")
    .select("id,post_id,user_id,content,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const comments = (data ?? []) as FeedComment[];
  const authorIds = Array.from(new Set(comments.map((comment) => comment.user_id)));

  if (authorIds.length === 0) return [] as FeedComment[];

  const profilesRes = await supabase.from("profiles").select("*").in("id", authorIds);
  if (profilesRes.error) throw profilesRes.error;

  const profileMap = new Map<string, Profile>(
    (profilesRes.data ?? []).map((p) => [p.id, p as Profile])
  );

  return comments.map((comment) => ({
    ...comment,
    author: profileMap.get(comment.user_id) ?? null,
  }));
}

export async function addComment(postId: string, content: string) {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: userId,
    content: content.trim(),
  });

  if (error) throw error;
  notifyPostAuthor({ postId, fromUserId: userId, type: "comment" });
  return fetchComments(postId);
}


export async function toggleRepost(postId: string): Promise<boolean> {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();
  try {
    const existing = await supabase.from("post_reposts").select("id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
    if (existing.data) {
      await supabase.from("post_reposts").delete().eq("post_id", postId).eq("user_id", userId);
      return false;
    }
    await supabase.from("post_reposts").insert({ post_id: postId, user_id: userId });
    notifyPostAuthor({ postId, fromUserId: userId, type: "repost" });
    return true;
  } catch {
    return true;
  }
}

export async function fetchSavedPosts(): Promise<FeedPost[]> {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();
  try {
    const { data, error } = await supabase
      .from("post_saves")
      .select("post_id, posts(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    // Map to FeedPost format
    return ((data ?? []) as any[]).map((row: any) => {
      const p = row.posts ?? {};
      return {
        ...p,
        author: null,
        likesCount: 0, commentsCount: 0, savesCount: 0,
        likedByMe: false, savedByMe: true, repostedByMe: false, repostsCount: 0,
      } as FeedPost;
    });
  } catch {
    return [];
  }
}

export async function fetchRepostedPosts(): Promise<FeedPost[]> {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();
  try {
    const { data, error } = await supabase
      .from("post_reposts")
      .select("post_id, posts(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as any[]).map((row: any) => {
      const p = row.posts ?? {};
      return {
        ...p,
        author: null,
        likesCount: 0, commentsCount: 0, savesCount: 0,
        likedByMe: false, savedByMe: false, repostedByMe: true, repostsCount: 0,
        isRepost: true,
      } as FeedPost;
    });
  } catch {
    return [];
  }
}
