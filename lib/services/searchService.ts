import { getSupabaseOrThrow } from "../supabase";

export async function searchUsers(q: string) {
  const supabase = getSupabaseOrThrow();
  const term = q.trim();
  if (!term) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,full_name,filiere,niveau")
    .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function searchGroups(q: string) {
  const supabase = getSupabaseOrThrow();
  const term = q.trim();
  if (!term) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select("id,title,description,filiere,privacy")
    .eq("type", "group")
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function searchPosts(q: string, filiere?: string) {
  const supabase = getSupabaseOrThrow();
  const term = q.trim();
  if (!term) return [];

  let query = supabase
    .from("posts")
    .select("id,title,content,filiere,created_at,author_id")
    .or(`title.ilike.%${term}%,content.ilike.%${term}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (filiere) query = query.eq("filiere", filiere);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}