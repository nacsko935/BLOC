import { getSupabaseOrThrow } from "../supabase";

export async function upsertPushToken(userId: string, token: string, platform?: string) {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: token,
      platform: platform || "unknown",
      enabled: true,
    },
    { onConflict: "user_id,expo_push_token" }
  );
  if (error) throw error;
}

export async function setPushEnabledForUser(userId: string, enabled: boolean) {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("push_tokens").update({ enabled }).eq("user_id", userId);
  if (error) throw error;
}