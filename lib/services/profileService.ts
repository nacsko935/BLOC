import { getSupabaseOrThrow } from "../supabase";
import { Profile } from "../../types/db";

async function requireAuthUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const id = data.user?.id;
  if (!id) throw new Error("Session invalide. Reconnecte-toi.");
  return id;
}

export async function getMyProfile(): Promise<Profile | null> {
  const userId = await requireAuthUserId();
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,filiere,niveau,avatar_url,notification_enabled,push_enabled,analytics_enabled")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function upsertMyProfile(partialProfile: Partial<Profile>) {
  const userId = await requireAuthUserId();
  const supabase = getSupabaseOrThrow();
  const payload: Partial<Profile> & { id: string } = {
    id: userId,
    ...partialProfile,
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw error;

  return getMyProfile();
}
