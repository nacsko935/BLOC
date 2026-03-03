import { getSupabaseOrThrow } from "../supabase";
import { FeedPost, Profile } from "../../types/db";

type SearchOptions = {
  limit?: number;
  cursor?: string | null;
};

type SearchGroup = { id: string; title: string; description: string };

export type SearchPage<T> = {
  items: T[];
  nextCursor: string | null;
};

const DEFAULT_LIMIT = 20;

function sanitizeTerm(value: string) {
  return value.trim().replace(/,/g, " ");
}

function parseCursor(cursor?: string | null) {
  if (!cursor) return 0;
  const parsed = Number(cursor);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function toPage<T>(items: T[], offset: number, limit: number): SearchPage<T> {
  return {
    items,
    nextCursor: items.length === limit ? String(offset + limit) : null,
  };
}

export async function searchUsersPage(query: string, options: SearchOptions = {}): Promise<SearchPage<Profile>> {
  const term = sanitizeTerm(query);
  if (!term) return { items: [], nextCursor: null };

  const supabase = getSupabaseOrThrow();
  const limit = options.limit ?? DEFAULT_LIMIT;
  const offset = parseCursor(options.cursor);
  const pattern = `%${term}%`;

  let res = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.${pattern},full_name.ilike.${pattern},display_name.ilike.${pattern}`)
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (res.error && res.error.code === "42703") {
    res = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.${pattern},full_name.ilike.${pattern}`)
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
  }

  if (res.error && res.error.code === "42703") {
    res = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", pattern)
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
  }

  if (res.error) throw res.error;
  return toPage((res.data as Profile[]) ?? [], offset, limit);
}

export async function searchUsers(query: string): Promise<Profile[]> {
  const page = await searchUsersPage(query, { limit: 10 });
  return page.items;
}

export async function searchGroupsPage(
  query: string,
  options: SearchOptions = {}
): Promise<SearchPage<SearchGroup>> {
  const term = sanitizeTerm(query);
  if (!term) return { items: [], nextCursor: null };

  const supabase = getSupabaseOrThrow();
  const limit = options.limit ?? DEFAULT_LIMIT;
  const offset = parseCursor(options.cursor);
  const pattern = `%${term}%`;

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .or(`name.ilike.${pattern},description.ilike.${pattern}`)
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const items = (data ?? []).map((row: any) => ({
    id: String(row.id),
    title: String(row.name ?? row.title ?? "Groupe"),
    description: String(row.description ?? ""),
  }));

  return toPage(items, offset, limit);
}

export async function searchGroups(
  query: string
): Promise<SearchGroup[]> {
  const page = await searchGroupsPage(query, { limit: 20 });
  return page.items;
}

export async function searchPostsPage(query: string, options: SearchOptions = {}): Promise<SearchPage<FeedPost>> {
  const term = sanitizeTerm(query);
  if (!term) return { items: [], nextCursor: null };

  const supabase = getSupabaseOrThrow();
  const limit = options.limit ?? DEFAULT_LIMIT;
  const offset = parseCursor(options.cursor);
  const pattern = `%${term}%`;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(`title.ilike.${pattern},content.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const items = (data ?? []).map((p: any) => ({
    id: String(p.id),
    author_id: String(p.author_id ?? p.user_id ?? ""),
    user_id: p.user_id ?? null,
    filiere: p.filiere ?? null,
    title: p.title ?? null,
    content: String(p.content ?? ""),
    type: p.type ?? "text",
    attachment_url: p.attachment_url ?? null,
    created_at: p.created_at ?? new Date().toISOString(),
    author: null,
    likesCount: p.likes_count ?? 0,
    commentsCount: p.comments_count ?? 0,
    savesCount: p.saves_count ?? 0,
    likedByMe: false,
    savedByMe: false,
  })) as FeedPost[];

  return toPage(items, offset, limit);
}

export async function searchPosts(query: string): Promise<FeedPost[]> {
  const page = await searchPostsPage(query, { limit: 20 });
  return page.items;
}
