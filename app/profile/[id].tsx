import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../state/useAuthStore";
import { Profile } from "../../types/db";
import { getSupabaseOrThrow } from "../../lib/supabase";
import { ensureDmConversation } from "../../lib/services/messageService";

function asId(input: string | string[] | undefined) {
  if (Array.isArray(input)) return input[0] ?? "";
  return input ?? "";
}

export default function PublicProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const targetUserId = asId(id);
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [followAvailable, setFollowAvailable] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  const isMe = useMemo(() => user?.id === targetUserId, [user?.id, targetUserId]);

  const loadFollowMeta = useCallback(async () => {
    if (!targetUserId || !user?.id) return;
    const supabase = getSupabaseOrThrow();

    const check = await supabase.from("follows").select("follower_id").limit(1);
    if (check.error && check.error.code === "PGRST205") {
      setFollowAvailable(false);
      return;
    }
    if (check.error) {
      setFollowAvailable(false);
      return;
    }
    setFollowAvailable(true);

    const [isFollowingRes, followersRes, followingRes] = await Promise.all([
      supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle(),
      supabase
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", targetUserId),
      supabase
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", targetUserId),
    ]);

    if (!isFollowingRes.error) setIsFollowing(Boolean(isFollowingRes.data));
    if (!followersRes.error) setFollowersCount(followersRes.count ?? 0);
    if (!followingRes.error) setFollowingCount(followingRes.count ?? 0);
  }, [targetUserId, user?.id]);

  const loadProfile = useCallback(async () => {
    if (!targetUserId) {
      setError("Profil introuvable.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseOrThrow();
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!data) {
        setError("Profil introuvable.");
      } else {
        setProfile(data as Profile);
      }
      await loadFollowMeta();
    } catch (e: any) {
      setError(e?.message || "Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  }, [targetUserId, loadFollowMeta]);

  useEffect(() => {
    loadProfile().catch(() => null);
  }, [loadProfile]);

  const toggleFollow = useCallback(async () => {
    if (isMe || !targetUserId || !user?.id) return;
    if (!followAvailable) {
      Alert.alert("Info", "Le follow n'est pas disponible sur cet environnement.");
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    const previousFollowing = isFollowing;
    const previousFollowersCount = followersCount;
    setIsFollowing(!previousFollowing);
    if (previousFollowersCount !== null) {
      setFollowersCount(Math.max(0, previousFollowersCount + (previousFollowing ? -1 : 1)));
    }
    try {
      const supabase = getSupabaseOrThrow();
      if (previousFollowing) {
        const { error: deleteError } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);
        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: targetUserId });
        if (insertError && insertError.code !== "23505") throw insertError;
      }
      await loadFollowMeta();
    } catch (e: any) {
      setIsFollowing(previousFollowing);
      setFollowersCount(previousFollowersCount ?? null);
      Alert.alert("Erreur", e?.message || "Action impossible.");
    } finally {
      setFollowLoading(false);
    }
  }, [isMe, targetUserId, user?.id, followAvailable, followLoading, isFollowing, followersCount, loadFollowMeta]);

  const openMessage = useCallback(async () => {
    if (!targetUserId || isMe) return;
    if (messageLoading) return;
    setMessageLoading(true);
    try {
      const conversationId = await ensureDmConversation(targetUserId);
      router.push({ pathname: "/messages/[id]", params: { id: conversationId } });
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'ouvrir la conversation.");
    } finally {
      setMessageLoading(false);
    }
  }, [targetUserId, isMe, messageLoading, router]);

  const displayName = profile?.display_name || profile?.full_name || profile?.username || "Utilisateur";
  const handle = profile?.username || `user-${targetUserId.slice(0, 6)}`;
  const filiere = profile?.filiere || "Filiere non renseignee";
  const roleRaw = (profile?.role || profile?.account_type || profile?.niveau || "etudiant").toLowerCase();
  const role = roleRaw.includes("prof") ? "Professeur" : roleRaw.includes("ecole") || roleRaw.includes("school") ? "Ecole" : "Etudiant";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 40 }}>
        <View style={styles.topRow}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFF" />
          </Pressable>
          <Text style={styles.title}>Profil</Text>
          <View style={styles.iconBtn} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#7B6CFF" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.primaryBtn} onPress={() => loadProfile().catch(() => null)}>
              <Text style={styles.primaryBtnText}>Reessayer</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.headerCard}>
              <View style={styles.avatarWrap}>
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarFallback}>{displayName.slice(0, 2).toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.handle}>@{handle}</Text>
                <Text style={styles.meta}>{role} - {filiere}</Text>
                <Text style={styles.bio} numberOfLines={2}>
                  {profile?.bio || "Aucune bio pour le moment."}
                </Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{followersCount ?? "-"}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{followingCount ?? "-"}</Text>
                <Text style={styles.statLabel}>Suivis</Text>
              </View>
            </View>

            {!isMe ? (
              <View style={styles.actionsRow}>
                <Pressable
                  style={[styles.primaryBtn, (followLoading || !followAvailable) && { opacity: 0.65 }]}
                  disabled={followLoading || !followAvailable}
                  onPress={toggleFollow}
                >
                  {followLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {!followAvailable ? "Indisponible" : isFollowing ? "Abonne" : "S'abonner"}
                    </Text>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.secondaryBtn, messageLoading && { opacity: 0.7 }]}
                  disabled={messageLoading}
                  onPress={openMessage}
                >
                  {messageLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.secondaryBtnText}>Message</Text>}
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#27272F",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111114",
  },
  center: { paddingVertical: 48, alignItems: "center", gap: 12 },
  errorText: { color: "#E5A8A8", textAlign: "center" },
  headerCard: {
    backgroundColor: "#111114",
    borderWidth: 1,
    borderColor: "#23232D",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1B1B22",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarFallback: { color: "#FFF", fontSize: 24, fontWeight: "800" },
  name: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  handle: { color: "#A5A5B0", fontSize: 13, marginTop: 2 },
  meta: { color: "#7B6CFF", fontSize: 12, marginTop: 6, fontWeight: "700" },
  bio: { color: "#D5D5DD", fontSize: 13, marginTop: 6, lineHeight: 18 },
  statsCard: {
    marginTop: 12,
    backgroundColor: "#0E0E12",
    borderWidth: 1,
    borderColor: "#22222B",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  statLabel: { color: "#A5A5B0", fontSize: 12, marginTop: 2 },
  actionsRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: "#6E5CFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  secondaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#333342",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#15151B",
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});

