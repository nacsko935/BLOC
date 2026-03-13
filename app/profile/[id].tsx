import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, Image, Pressable,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../state/useAuthStore";
import { Profile } from "../../types/db";
import { getSupabaseOrThrow } from "../../lib/supabase";
import { ensureDmConversation } from "../../lib/services/messageService";
import { getProjects, getProjectProgress } from "../../lib/services/projectsService";

function asId(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

type Tab = "posts" | "projects" | "badges";

const BADGES_DEF = [
  { id:"b1", icon:"🌱", label:"Premier pas",   desc:"Publier 3 posts" },
  { id:"b2", icon:"📚", label:"Apprenti",       desc:"Atteindre 150 XP" },
  { id:"b3", icon:"⭐", label:"Studieux",        desc:"Atteindre 500 XP" },
  { id:"b4", icon:"🔥", label:"Contributeur",   desc:"Atteindre 1200 XP" },
  { id:"b5", icon:"💎", label:"Expert",          desc:"Atteindre 2500 XP" },
  { id:"b6", icon:"🏆", label:"Maître",          desc:"Atteindre 5000 XP" },
  { id:"b7", icon:"👑", label:"Légende",         desc:"Atteindre 10000 XP" },
];

export default function PublicProfileScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { id }  = useLocalSearchParams<{ id?: string | string[] }>();
  const targetId = asId(id);
  const { user } = useAuthStore();

  const [profile, setProfile]           = useState<Profile | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error,   setError]             = useState<string | null>(null);
  const [tab,     setTab]               = useState<Tab>("posts");

  const [isFollowing,    setIsFollowing]    = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [likesCount,     setLikesCount]     = useState(0);
  const [followLoading,  setFollowLoading]  = useState(false);
  const [msgLoading,     setMsgLoading]     = useState(false);

  const [posts,    setPosts]    = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const isMe = useMemo(() => user?.id === targetId, [user?.id, targetId]);

  const load = useCallback(async () => {
    if (!targetId) { setError("Profil introuvable."); return; }
    setLoading(true); setError(null);
    try {
      const supabase = getSupabaseOrThrow();

      // Load profile
      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", targetId).maybeSingle();
      setProfile(prof as Profile | null);

      // Load follow counts + like counts in parallel
      const [followersR, followingR, likesR, followCheckR, postsR] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", targetId),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", targetId),
        supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_author_id", targetId),
        user?.id ? supabase.from("follows")
          .select("follower_id").eq("follower_id", user.id).eq("following_id", targetId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase.from("posts").select("*").eq("author_id", targetId)
          .order("created_at", { ascending: false }).limit(20),
      ]);

      setFollowersCount(followersR.count ?? 0);
      setFollowingCount(followingR.count ?? 0);
      setLikesCount(likesR.count ?? 0);
      setIsFollowing(!!followCheckR.data);
      setPosts(postsR.data || []);

      // Load projects from AsyncStorage (keyed by userId if same user, else empty)
      if (isMe) {
        const projs = await getProjects();
        setProjects(projs);
      }
    } catch (e: any) {
      setError(e?.message || "Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  }, [targetId, user?.id, isMe]);

  useEffect(() => { load(); }, [load]);

  const toggleFollow = useCallback(async () => {
    if (isMe || followLoading || !user?.id) return;
    setFollowLoading(true);
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowersCount(v => Math.max(0, v + (prev ? -1 : 1)));
    try {
      const supabase = getSupabaseOrThrow();
      if (prev) {
        await supabase.from("follows").delete()
          .eq("follower_id", user.id).eq("following_id", targetId);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
        // Send notification (best-effort)
        supabase.from("notifications").insert({
          user_id: targetId, from_user_id: user.id,
          type: "follow", title: "Nouveau abonné",
          body: "Quelqu'un a commencé à te suivre.", read: false,
        }).then(() => null, () => null);
      }
    } catch {
      setIsFollowing(prev);
      setFollowersCount(v => Math.max(0, v + (prev ? 1 : -1)));
    } finally { setFollowLoading(false); }
  }, [isMe, followLoading, user?.id, isFollowing, targetId]);

  const openMessage = useCallback(async () => {
    if (isMe || msgLoading || !user?.id) return;
    setMsgLoading(true);
    try {
      const convId = await ensureDmConversation(targetId);
      router.push({ pathname: "/messages/[id]", params: { id: convId } });
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'ouvrir la conversation.");
    } finally { setMsgLoading(false); }
  }, [isMe, msgLoading, user?.id, targetId, router]);

  const displayName = profile?.display_name || profile?.full_name || profile?.username || "Utilisateur";
  const handle = profile?.username || `user-${targetId.slice(0, 6)}`;
  const roleRaw = (profile?.role || profile?.account_type || profile?.niveau || "etudiant").toLowerCase();
  const role = roleRaw.includes("prof") ? "Professeur" : roleRaw.includes("ecole") ? "École" : "Étudiant";
  const roleColor = role === "Professeur" ? "#FF8C00" : role === "École" ? "#00C7BE" : "#4DA3FF";

  const TABS: { key: Tab; icon: string }[] = [
    { key: "posts",    icon: "grid-outline" },
    { key: "projects", icon: "folder-outline" },
    { key: "badges",   icon: "trophy-outline" },
  ];

  return (
    <View style={s.screen}>
      {/* Header */}
      <LinearGradient colors={["#1A0A3B","#000"]}
        style={[s.headerGrad, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>Profil</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#7B6CFF" size="large" /></View>
      ) : error ? (
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={s.errorTxt}>{error}</Text>
          <Pressable onPress={() => load()} style={s.retryBtn}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Avatar + name */}
          <View style={s.profileHeader}>
            <View style={s.avatarWrap}>
              {profile?.avatar_url
                ? <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
                : <Text style={s.avatarFallback}>{displayName.charAt(0).toUpperCase()}</Text>
              }
            </View>
            <Text style={s.name}>{displayName}</Text>
            <Text style={s.handle}>@{handle}</Text>
            <View style={[s.rolePill, { backgroundColor: roleColor + "20" }]}>
              <Text style={[s.roleText, { color: roleColor }]}>{role}</Text>
            </View>
            {profile?.filiere ? (
              <Text style={s.filiere}>{profile.filiere}</Text>
            ) : null}
            {profile?.bio ? (
              <Text style={s.bio}>{profile.bio}</Text>
            ) : null}
          </View>

          {/* Stats row — full width */}
          <View style={s.statsRow}>
            <Pressable style={s.statBox} onPress={() => router.push({ pathname: "/profile/followers", params: { userId: targetId, type: "followers" } })}>
              <Text style={s.statVal}>{followersCount}</Text>
              <Text style={s.statLbl}>Abonnés</Text>
            </Pressable>
            <View style={s.statDivider} />
            <Pressable style={s.statBox} onPress={() => router.push({ pathname: "/profile/followers", params: { userId: targetId, type: "following" } })}>
              <Text style={s.statVal}>{followingCount}</Text>
              <Text style={s.statLbl}>Suivis</Text>
            </Pressable>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statVal}>{posts.length}</Text>
              <Text style={s.statLbl}>Posts</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statVal}>{likesCount}</Text>
              <Text style={s.statLbl}>J'aimes</Text>
            </View>
          </View>

          {/* Action buttons */}
          {!isMe && (
            <View style={s.actionsRow}>
              <Pressable onPress={toggleFollow} disabled={followLoading}
                style={[s.followBtn, { backgroundColor: isFollowing ? "#1A1A2E" : "#7B6CFF" }]}>
                {followLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                      <Ionicons name={isFollowing ? "checkmark" : "person-add-outline"} size={16} color="#fff" />
                      <Text style={s.followBtnTxt}>{isFollowing ? "Abonné" : "S'abonner"}</Text>
                    </>
                }
              </Pressable>
              <Pressable onPress={openMessage} disabled={msgLoading}
                style={s.msgBtn}>
                {msgLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                      <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                      <Text style={s.followBtnTxt}>Message</Text>
                    </>
                }
              </Pressable>
            </View>
          )}

          {/* Icon tabs */}
          <View style={s.tabsRow}>
            {TABS.map(t => {
              const active = tab === t.key;
              return (
                <Pressable key={t.key} onPress={() => setTab(t.key)}
                  style={[s.tabBtn, { borderBottomColor: active ? "#7B6CFF" : "transparent" }]}>
                  <Ionicons name={t.icon as any} size={22}
                    color={active ? "#7B6CFF" : "rgba(255,255,255,0.35)"} />
                </Pressable>
              );
            })}
          </View>

          {/* Posts tab */}
          {tab === "posts" && (
            <View style={s.tabContent}>
              {posts.length === 0 ? (
                <View style={s.emptyBox}>
                  <Ionicons name="document-text-outline" size={36} color="rgba(255,255,255,0.2)" />
                  <Text style={s.emptyTxt}>Aucune publication</Text>
                </View>
              ) : (
                posts.map(p => (
                  <View key={p.id} style={s.postCard}>
                    {p.title ? <Text style={s.postTitle}>{p.title}</Text> : null}
                    <Text style={s.postContent} numberOfLines={3}>{p.content}</Text>
                    <Text style={s.postDate}>
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Projects tab */}
          {tab === "projects" && (
            <View style={s.tabContent}>
              {!isMe ? (
                <View style={s.emptyBox}>
                  <Ionicons name="lock-closed-outline" size={36} color="rgba(255,255,255,0.2)" />
                  <Text style={s.emptyTxt}>Projets privés</Text>
                </View>
              ) : projects.length === 0 ? (
                <View style={s.emptyBox}>
                  <Ionicons name="folder-open-outline" size={36} color="rgba(255,255,255,0.2)" />
                  <Text style={s.emptyTxt}>Aucun projet</Text>
                </View>
              ) : (
                projects.map(proj => {
                  const pct = getProjectProgress(proj);
                  return (
                    <View key={proj.id} style={s.projectCard}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ fontSize: 24 }}>{proj.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.postTitle}>{proj.title}</Text>
                          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                            {proj.objectives.filter((o: any) => o.done).length}/{proj.objectives.length} objectifs
                          </Text>
                        </View>
                        <Text style={{ color: proj.color, fontWeight: "900", fontSize: 16 }}>{pct}%</Text>
                      </View>
                      <View style={s.progBar}>
                        <View style={[s.progFill, { width: `${pct}%` as any, backgroundColor: proj.color }]} />
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* Badges tab */}
          {tab === "badges" && (
            <View style={[s.tabContent, { flexDirection: "row", flexWrap: "wrap", gap: 12 }]}>
              {BADGES_DEF.map(b => (
                <View key={b.id} style={s.badgeCard}>
                  <Text style={{ fontSize: 32 }}>{b.icon}</Text>
                  <Text style={s.badgeLabel}>{b.label}</Text>
                  <Text style={s.badgeDesc}>{b.desc}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: "#000" },
  headerGrad:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:  { color: "#fff", fontSize: 18, fontWeight: "800" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  center:       { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  errorTxt:     { color: "#FF6B6B", textAlign: "center", fontSize: 15 },
  retryBtn:     { backgroundColor: "#7B6CFF", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },

  profileHeader:{ alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
  avatarWrap:   { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(123,108,255,0.25)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#7B6CFF", marginBottom: 12 },
  avatar:       { width: 90, height: 90, borderRadius: 45 },
  avatarFallback:{ color: "#fff", fontSize: 36, fontWeight: "900" },
  name:         { color: "#fff", fontSize: 22, fontWeight: "900" },
  handle:       { color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 2 },
  rolePill:     { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  roleText:     { fontWeight: "800", fontSize: 12 },
  filiere:      { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 6 },
  bio:          { color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8, paddingHorizontal: 20 },

  statsRow:     { flexDirection: "row", marginHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", padding: 16, marginBottom: 16 },
  statBox:      { flex: 1, alignItems: "center" },
  statVal:      { color: "#fff", fontSize: 20, fontWeight: "900" },
  statLbl:      { color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 2, fontWeight: "600" },
  statDivider:  { width: 1, backgroundColor: "rgba(255,255,255,0.10)", marginVertical: 4 },

  actionsRow:   { flexDirection: "row", gap: 10, marginHorizontal: 16, marginBottom: 20 },
  followBtn:    { flex: 1, height: 44, borderRadius: 14, borderWidth: 1, borderColor: "#7B6CFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  msgBtn:       { flex: 1, height: 44, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.06)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  followBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },

  tabsRow:      { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16 },
  tabBtn:       { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2 },

  tabContent:   { paddingHorizontal: 16, gap: 12 },
  emptyBox:     { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyTxt:     { color: "rgba(255,255,255,0.35)", fontSize: 15 },

  postCard:     { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14 },
  postTitle:    { color: "#fff", fontWeight: "800", fontSize: 15, marginBottom: 4 },
  postContent:  { color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 20 },
  postDate:     { color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 },

  projectCard:  { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, gap: 10 },
  progBar:      { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" },
  progFill:     { height: 6, borderRadius: 3 },

  badgeCard:    { width: "45%", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, alignItems: "center", gap: 6 },
  badgeLabel:   { color: "#fff", fontWeight: "800", fontSize: 13, textAlign: "center" },
  badgeDesc:    { color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "center" },
});
