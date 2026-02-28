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
    .select("id,username,full_name,bio,filiere,niveau,avatar_url")
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

export async function uploadAvatar(localUri: string): Promise<string> {
  const userId    = await requireAuthUserId();
  const supabase  = getSupabaseOrThrow();
  const response  = await fetch(localUri);
  const blob      = await response.blob();
  const ext       = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeType  = ext === "png" ? "image/png" : "image/jpeg";
  const filePath  = `avatars/${userId}.${ext}`;
  const { error } = await supabase.storage.from("bloc-media").upload(filePath, blob, { contentType: mimeType, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("bloc-media").getPublicUrl(filePath);
  const publicUrl = data.publicUrl + `?t=${Date.now()}`;
  await upsertMyProfile({ avatar_url: publicUrl });
  return publicUrl;
}
