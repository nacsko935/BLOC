import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../state/useAuthStore";
import { useFeedStore } from "../../state/useFeedStore";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { PostCard } from "../../src/components/PostCard";
import { FeedPost } from "../../types/db";

type ProfileTab = "posts" | "modules" | "projects" | "badges";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "posts", label: "Posts" },
  { key: "modules", label: "Modules" },
  { key: "projects", label: "Projets" },
  { key: "badges", label: "Badges" },
];

const MODULES = [
  { id: "m1", name: "SQL avance", progress: 72 },
  { id: "m2", name: "Reseaux fondamentaux", progress: 44 },
];

const PROJECTS = [
  { id: "p1", title: "Revision partiels S2", tasks: 12, done: 8 },
  { id: "p2", title: "Groupe BDD - mini projet", tasks: 9, done: 4 },
];

const BADGES = [
  { id: "b1", name: "Streak 7 jours", unlocked: true },
  { id: "b2", name: "Quiz Master", unlocked: true },
  { id: "b3", name: "Top contributeur", unlocked: false },
];

function mapRoleLabel(rawRole?: string | null) {
  const value = (rawRole || "").toLowerCase();
  if (value.includes("prof")) return "Professeur";
  if (value.includes("ecole") || value.includes("school")) return "Ecole";
  return "Etudiant";
}

export default function ProfileTabRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { profile, user, updateProfile, updateAvatar } = useAuthStore();
  const { posts, refresh, createPost, toggleLike, toggleSave, openComments } = useFeedStore();

  const [tab, setTab] = useState<ProfileTab>("posts");
  const [editVisible, setEditVisible] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [filiere, setFiliere] = useState(profile?.filiere || "");

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setUsername(profile?.username || "");
    setBio(profile?.bio || "");
    setFiliere(profile?.filiere || "");
  }, [profile]);

  useEffect(() => {
    refresh(profile?.filiere || undefined).catch(() => null);
  }, [refresh, profile?.filiere]);

  const displayName = useMemo(
    () => profile?.display_name || profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Utilisateur",
    [profile, user?.email]
  );
  const handle = useMemo(
    () => profile?.username || user?.email?.split("@")[0] || "utilisateur",
    [profile?.username, user?.email]
  );
  const school = useMemo(
    () => profile?.school_name || profile?.ecole || null,
    [profile?.school_name, profile?.ecole]
  );
  const role = useMemo(
    () => mapRoleLabel(profile?.role || profile?.account_type || profile?.niveau),
    [profile?.role, profile?.account_type, profile?.niveau]
  );
  const avatarUri = localAvatar || profile?.avatar_url || null;

  const myPosts = useMemo(() => {
    const uid = user?.id;
    if (!uid) return [] as FeedPost[];
    return posts
      .filter((p) => p.user_id === uid || p.author_id === uid || p.author?.id === uid)
      .map((p) => (p.author ? p : { ...p, author: profile || null }));
  }, [posts, profile, user?.id]);

  const uploadAvatar = async (uri: string) => {
    setLocalAvatar(uri);
    setUploading(true);
    try {
      await updateAvatar(uri);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Upload avatar impossible.");
    } finally {
      setUploading(false);
    }
  };

  const pickFromLibrary = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) uploadAvatar(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled && result.assets[0]) uploadAvatar(result.assets[0].uri);
  };

  const saveProfile = async () => {
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        filiere: filiere.trim() || null,
      });
      setEditVisible(false);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'enregistrer le profil.");
    }
  };

  const publishPost = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      await createPost({
        title: postTitle.trim() || undefined,
        content: postContent.trim(),
        filiere: profile?.filiere || "General",
      } as any);
      await refresh(profile?.filiere || undefined);
      setPostTitle("");
      setPostContent("");
      setPostVisible(false);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de publier.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <LinearGradient colors={["#15151D", "#08080C"]} style={[styles.cover, { paddingTop: insets.top + 14 }]}>
          <View style={styles.coverActions}>
            <Pressable style={styles.coverAction} onPress={() => setPostVisible(true)}>
              <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.coverAction} onPress={() => router.push("/settings")}>
              <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.avatarRow}>
            <Pressable
              onPress={() =>
                Alert.alert("Photo de profil", "", [
                  { text: "Galerie", onPress: pickFromLibrary },
                  { text: "Camera", onPress: pickFromCamera },
                  { text: "Annuler", style: "cancel" },
                ])
              }
            >
              <View style={[styles.avatarWrap, { borderColor: c.background }]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.avatarFallback}>{displayName.slice(0, 2).toUpperCase()}</Text>
                )}
                {uploading ? (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
            </Pressable>
            <View style={styles.avatarRight}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{profile?.niveau || "Niveau 1"}</Text>
              </View>
              <Pressable onPress={() => setEditVisible(true)} style={[styles.outlineBtn, { borderColor: c.border }]}>
                <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 13 }}>Modifier</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.identity}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.handle}>@{handle}</Text>
            <Text style={styles.role}>{role}</Text>
            <Text style={styles.bio} numberOfLines={2}>
              {profile?.bio || "Ajoute une bio pour presenter ton profil et tes objectifs."}
            </Text>
            <View style={styles.metaRow}>
              {profile?.filiere ? (
                <View style={styles.metaItem}>
                  <Ionicons name="school-outline" size={13} color={c.textSecondary} />
                  <Text style={styles.metaText}>{profile.filiere}</Text>
                </View>
              ) : null}
              {school ? (
                <View style={styles.metaItem}>
                  <Ionicons name="business-outline" size={13} color={c.textSecondary} />
                  <Text style={styles.metaText}>{school}</Text>
                </View>
              ) : null}
            </View>
          </View>

        </View>

        <View style={[styles.tabsRow, { borderTopColor: c.border, borderBottomColor: c.border }]}>
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                style={[styles.tabItem, active && styles.tabItemActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ paddingTop: 8 }}>
          {tab === "posts" ? (
            myPosts.length ? (
              myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onToggleLike={async (id) => {
                    try {
                      await toggleLike(id);
                    } catch {}
                  }}
                  onToggleSave={async (id) => {
                    try {
                      await toggleSave(id);
                    } catch {}
                  }}
                  onPressComments={async (p) => {
                    await openComments(p.id).catch(() => null);
                  }}
                  onPressContent={(p) => router.push(`/content/${p.id}` as any)}
                  onPressMore={(p) =>
                    Alert.alert("Publication", "Actions disponibles", [
                      { text: "Voir le contenu", onPress: () => router.push(`/content/${p.id}` as any) },
                      { text: "Fermer", style: "cancel" },
                    ])
                  }
                />
              ))
            ) : (
              <View style={styles.emptyWrap}>
                <Ionicons name="newspaper-outline" size={38} color={c.textSecondary} />
                <Text style={styles.emptyTitle}>Aucun post pour le moment</Text>
                <Text style={styles.emptySub}>Publie ton premier contenu depuis ton profil.</Text>
                <Pressable style={styles.primaryBtn} onPress={() => setPostVisible(true)}>
                  <Text style={styles.primaryBtnText}>Publier maintenant</Text>
                </Pressable>
              </View>
            )
          ) : null}

          {tab === "modules" ? (
            <View style={styles.cardList}>
              {MODULES.map((m) => (
                <View key={m.id} style={[styles.simpleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={styles.simpleTitle}>{m.name}</Text>
                  <Text style={styles.simpleSub}>{m.progress}% complete</Text>
                  <View style={[styles.progressTrack, { backgroundColor: c.cardAlt }]}>
                    <View style={[styles.progressFill, { width: `${m.progress}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "projects" ? (
            <View style={styles.cardList}>
              {PROJECTS.map((p) => {
                const value = Math.round((p.done / p.tasks) * 100);
                return (
                  <View key={p.id} style={[styles.simpleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={styles.simpleTitle}>{p.title}</Text>
                    <Text style={styles.simpleSub}>{p.done}/{p.tasks} taches terminees</Text>
                    <View style={[styles.progressTrack, { backgroundColor: c.cardAlt }]}>
                      <View style={[styles.progressFill, { width: `${value}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {tab === "badges" ? (
            <View style={styles.cardList}>
              {BADGES.map((b) => (
                <View key={b.id} style={[styles.simpleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={styles.simpleTitle}>{b.name}</Text>
                  <Text style={styles.simpleSub}>{b.unlocked ? "Debloque" : "A debloquer"}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={postVisible} transparent animationType="slide" onRequestClose={() => setPostVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setPostVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Nouvelle publication</Text>
              <Pressable onPress={() => setPostVisible(false)}>
                <Ionicons name="close" size={22} color={c.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={postTitle}
              onChangeText={setPostTitle}
              placeholder="Titre (optionnel)"
              placeholderTextColor={c.textSecondary}
              style={[styles.input, { borderColor: c.border, backgroundColor: c.cardAlt, color: c.textPrimary }]}
            />
            <TextInput
              value={postContent}
              onChangeText={setPostContent}
              multiline
              placeholder="Exprime-toi..."
              placeholderTextColor={c.textSecondary}
              style={[styles.inputArea, { borderColor: c.border, backgroundColor: c.cardAlt, color: c.textPrimary }]}
            />
            <Pressable onPress={publishPost} disabled={posting || !postContent.trim()} style={[styles.primaryBtn, (posting || !postContent.trim()) && { opacity: 0.55 }]}>
              {posting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.primaryBtnText}>Publier</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setEditVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Nom" placeholderTextColor={c.textSecondary} style={[styles.input, { borderColor: c.border, backgroundColor: c.cardAlt, color: c.textPrimary }]} />
            <TextInput value={username} onChangeText={setUsername} placeholder="@username" placeholderTextColor={c.textSecondary} style={[styles.input, { borderColor: c.border, backgroundColor: c.cardAlt, color: c.textPrimary }]} />
            <TextInput value={filiere} onChangeText={setFiliere} placeholder="Filiere" placeholderTextColor={c.textSecondary} style={[styles.input, { borderColor: c.border, backgroundColor: c.cardAlt, color: c.textPrimary }]} />
            <TextInput value={bio} onChangeText={setBio} multiline placeholder="Bio" placeholderTextColor={c.textSecondary} style={[styles.inputArea, { borderColor: c.border, backgroundColor: c.cardAlt, color: c.textPrimary }]} />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditVisible(false)} style={[styles.outlineBtn, { borderColor: c.border }]}>
                <Text style={{ color: c.textPrimary, fontWeight: "700" }}>Annuler</Text>
              </Pressable>
              <Pressable onPress={saveProfile} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 210,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
  },
  coverActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  coverAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRow: {
    marginTop: -56,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  avatarWrap: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 4,
    backgroundColor: "#1D1D22",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarFallback: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRight: {
    alignItems: "flex-end",
    gap: 8,
    paddingBottom: 8,
  },
  levelBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(110,92,255,0.18)",
    borderWidth: 1,
    borderColor: "#6E5CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: {
    color: "#D8D1FF",
    fontSize: 12,
    fontWeight: "800",
  },
  outlineBtn: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: {
    marginTop: 12,
    gap: 4,
  },
  displayName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  handle: {
    color: "#9A9AA7",
    fontSize: 14,
    fontWeight: "700",
  },
  role: {
    color: "#6E5CFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  bio: {
    color: "#E1E1EA",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#8A8A95",
    fontSize: 13,
  },
  progressTrack: {
    marginTop: 8,
    width: "100%",
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#6E5CFF",
  },
  tabsRow: {
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#6E5CFF",
  },
  tabLabel: {
    color: "#8F8F99",
    fontSize: 13,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: "#6E5CFF",
  },
  emptyWrap: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 38,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  emptySub: {
    color: "#9494A0",
    fontSize: 13,
    textAlign: "center",
  },
  primaryBtn: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6E5CFF",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  cardList: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10,
  },
  simpleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  simpleTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  simpleSub: {
    color: "#9B9BA6",
    marginTop: 4,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  input: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inputArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
    fontSize: 14,
  },
  modalActions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
});
