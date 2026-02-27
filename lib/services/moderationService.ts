import { getSupabaseOrThrow } from "../supabase";

async function requireUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Session introuvable");
  return userId;
}

export async function fetchBlockedUserIds() {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { data, error } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.blocked_id as string);
}

export async function fetchHiddenPostIds() {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { data, error } = await supabase.from("hidden_posts").select("post_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.post_id as string);
}

export async function blockUser(blockedId: string) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  if (blockedId === userId) return;
  const { error } = await supabase.from("blocks").upsert(
    { blocker_id: userId, blocked_id: blockedId },
    { onConflict: "blocker_id,blocked_id" }
  );
  if (error) throw error;
}

export async function hidePost(postId: string) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("hidden_posts").upsert(
    { user_id: userId, post_id: postId },
    { onConflict: "user_id,post_id" }
  );
  if (error) throw error;
}

export async function reportTarget(input: {
  targetType: "post" | "comment" | "user";
  targetId: string;
  reason: string;
}) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("reports").insert({
    reporter_id: userId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
  });
  if (error) throw error;
}