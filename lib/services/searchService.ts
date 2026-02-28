import { getSupabaseOrThrow } from "../supabase";
import { Profile, FeedPost } from "../../types/db";

export async function searchUsers(query: string): Promise<Profile[]> {
  if (!query.trim()) return [];
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,filiere,niveau,avatar_url")
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);
  if (error) throw error;
  return (data as Profile[]) ?? [];
}

export async function searchPosts(query: string): Promise<FeedPost[]> {
  if (!query.trim()) return [];
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("posts")
    .select(`id, author_id, title, content, type, filiere, created_at, attachment_url,
      author:profiles!posts_author_id_fkey(id,username,full_name,bio,filiere,niveau,avatar_url),
      likes_count, comments_count, saves_count`)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    likesCount:    p.likes_count    ?? 0,
    commentsCount: p.comments_count ?? 0,
    savesCount:    p.saves_count    ?? 0,
    likedByMe:     false,
    savedByMe:     false,
  })) as FeedPost[];
}
