import { getSupabaseOrThrow } from "../supabase";
import { FeedComment, FeedPost, Post, PostType, Profile } from "../../types/db";

type FetchFeedParams = {
  filiere?: string;
  limit?: number;
  cursor?: string;
};

type FetchFeedResult = {
  posts: FeedPost[];
  nextCursor: string | null;
};

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
  const limit = params.limit ?? 10;

  let query = supabase
    .from("posts")
    .select("id,author_id,filiere,title,content,type,attachment_url,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (params.filiere) query = query.eq("filiere", params.filiere);
  if (params.cursor) query = query.lt("created_at", params.cursor);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data as Post[]) ?? [];
  if (posts.length === 0) return { posts: [], nextCursor: null };

  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(new Set(posts.map((post) => post.author_id)));

  const [profilesRes, likesRes, savesRes, commentsRes, myLikesRes, mySavesRes] = await Promise.all([
    supabase.from("profiles").select("id,username,full_name,bio,filiere,niveau,avatar_url").in("id", authorIds),
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

  const profileMap = new Map<string, Profile>((profilesRes.data ?? []).map((p) => [p.id, p as Profile]));
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
    nextCursor: posts.length === limit ? posts[posts.length - 1].created_at : null,
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
  const payload = {
    author_id: userId,
    title: input.title?.trim() || null,
    content: input.content.trim(),
    filiere: input.filiere.trim(),
    type: input.type ?? "text",
    attachment_url: input.attachment_url ?? null,
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select("id,author_id,filiere,title,content,type,attachment_url,created_at")
    .single();

  if (error) throw error;

  const profile = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,filiere,niveau,avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (profile.error) throw profile.error;

  const post = data as Post;
  return {
    ...post,
    author: (profile.data as Profile | null) ?? null,
    likesCount: 0,
    commentsCount: 0,
    savesCount: 0,
    likedByMe: false,
    savedByMe: false,
  } as FeedPost;
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

  const profilesRes = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,filiere,niveau,avatar_url")
    .in("id", authorIds);

  if (profilesRes.error) throw profilesRes.error;
  const profileMap = new Map<string, Profile>((profilesRes.data ?? []).map((p) => [p.id, p as Profile]));

  return comments.map((comment) => ({
    ...comment,
    author: profileMap.get(comment.user_id) ?? null,
  }));
}

export async function addComment(postId: string, content: string) {
  const userId = await requireUserId();
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("comments").insert({ post_id: postId, user_id: userId, content: content.trim() });
  if (error) throw error;

  return fetchComments(postId);
}
