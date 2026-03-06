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
    .select("*")
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

export async function getUserStats(userId: string): Promise<{ followersCount: number; followingCount: number; totalLikesReceived: number }> {
  try {
    const supabase = getSupabaseOrThrow();
    const [fwersRes, fwingRes, likesRes] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
      supabase.from("post_likes").select("posts!inner(author_id)", { count: "exact", head: true }).eq("posts.author_id", userId),
    ]);
    return {
      followersCount: fwersRes.count ?? 0,
      followingCount: fwingRes.count ?? 0,
      totalLikesReceived: likesRes.count ?? 0,
    };
  } catch {
    return { followersCount: 0, followingCount: 0, totalLikesReceived: 0 };
  }
}

export function computeLevel(points: number): { level: number; title: string; badge: string; pointsForNextLevel: number } {
  const LEVELS = [
    { min: 0,    title: "Débutant",      badge: "🌱" },
    { min: 50,   title: "Apprenti",      badge: "📚" },
    { min: 150,  title: "Studieux",      badge: "⭐" },
    { min: 300,  title: "Contributeur",  badge: "🔥" },
    { min: 500,  title: "Expert",        badge: "💎" },
    { min: 800,  title: "Maître",        badge: "🏆" },
    { min: 1200, title: "Légende",       badge: "👑" },
  ];
  let level = 1;
  let title = LEVELS[0].title;
  let badge = LEVELS[0].badge;
  for (let i = 1; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) { level = i + 1; title = LEVELS[i].title; badge = LEVELS[i].badge; }
  }
  const nextMin = level < LEVELS.length ? LEVELS[level].min : LEVELS[LEVELS.length - 1].min + 1000;
  return { level, title, badge, pointsForNextLevel: nextMin };
}

export async function getUserPoints(userId: string): Promise<number> {
  try {
    const supabase = getSupabaseOrThrow();
    // Sum from posts (10pts each), likes received (1pt each), reposts (5pts each)
    const [postsRes, likesRes] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", userId),
      supabase.from("post_likes").select("posts!inner(author_id)", { count: "exact", head: true }).eq("posts.author_id", userId),
    ]);
    const postPoints = (postsRes.count ?? 0) * 10;
    const likePoints = likesRes.count ?? 0;
    return postPoints + likePoints;
  } catch {
    return 0;
  }
}

// ── Follow system ─────────────────────────────────────────────────────────────

export async function followUser(targetUserId: string): Promise<void> {
  const myId = await requireAuthUserId();
  const supabase = getSupabaseOrThrow();
  if (myId === targetUserId) return;
  const { error } = await supabase
    .from("follows")
    .upsert({ follower_id: myId, following_id: targetUserId }, { onConflict: "follower_id,following_id" });
  if (error) throw error;
  // Insert notification for the followed user
  await supabase.from("notifications").insert({
    user_id: targetUserId,
    from_user_id: myId,
    type: "follow",
    title: "Nouveau abonné",
    body: "Quelqu'un a commencé à te suivre.",
    read: false,
  }).catch(() => null);
}

export async function unfollowUser(targetUserId: string): Promise<void> {
  const myId = await requireAuthUserId();
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", myId)
    .eq("following_id", targetUserId);
  if (error) throw error;
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  try {
    const myId = await requireAuthUserId();
    const supabase = getSupabaseOrThrow();
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", myId)
      .eq("following_id", targetUserId)
      .maybeSingle();
    return !!data;
  } catch { return false; }
}

export async function toggleFollow(targetUserId: string): Promise<boolean> {
  const following = await isFollowing(targetUserId);
  if (following) {
    await unfollowUser(targetUserId);
    return false;
  } else {
    await followUser(targetUserId);
    return true;
  }
}

// ── Avatar with 60-day lock ───────────────────────────────────────────────────

export function canChangeAvatar(avatarChangedAt: string | null | undefined): { allowed: boolean; daysLeft: number } {
  if (!avatarChangedAt) return { allowed: true, daysLeft: 0 };
  const diff = Date.now() - new Date(avatarChangedAt).getTime();
  const daysPassed = diff / (1000 * 60 * 60 * 24);
  const daysLeft = Math.ceil(60 - daysPassed);
  return { allowed: daysPassed >= 60, daysLeft: Math.max(0, daysLeft) };
}

export async function uploadAvatarWithLock(localUri: string, currentProfile: any): Promise<string> {
  const { allowed, daysLeft } = canChangeAvatar(currentProfile?.avatar_changed_at);
  // If already has an avatar AND not enough time has passed
  if (currentProfile?.avatar_url && !allowed) {
    throw new Error(`Tu pourras changer ta photo dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}.`);
  }
  const url = await uploadAvatar(localUri);
  // Save the timestamp
  await upsertMyProfile({ avatar_changed_at: new Date().toISOString() } as any);
  return url;
}

// ── Get public profile ─────────────────────────────────────────────────────────

export async function getPublicProfile(userId: string): Promise<any | null> {
  try {
    const supabase = getSupabaseOrThrow();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return data;
  } catch { return null; }
}
