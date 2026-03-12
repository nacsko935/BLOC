import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Animated, Image, Pressable,
  ScrollView, Share, StyleSheet, Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { FeedPost, FeedComment } from "../../types/db";
import { useFeedStore } from "../../state/useFeedStore";
import { getSupabaseOrThrow } from "../../lib/supabase";

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  Professeur: { label: "Prof",      color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  École:      { label: "École",     color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  Étudiant:   { label: "Étudiant",  color: "#818CF8", bg: "rgba(129,140,248,0.12)" },
};

function getRole(post: FeedPost) {
  const raw = (post.author?.role || post.author?.account_type || "etudiant").toLowerCase();
  if (raw.includes("prof")) return "Professeur";
  if (raw.includes("ecole") || raw.includes("school")) return "École";
  return "Étudiant";
}

function relDate(s: string) {
  const d = Math.max(1, Math.floor((Date.now() - new Date(s).getTime()) / 1000));
  if (d < 60) return "à l'instant";
  if (d < 3600) return `${Math.floor(d / 60)} min`;
  if (d < 86400) return `${Math.floor(d / 3600)} h`;
  return `${Math.floor(d / 86400)} j`;
}

async function fetchPostById(id: string): Promise<FeedPost | null> {
  try {
    const supabase = getSupabaseOrThrow();
    const { data: row } = await supabase
      .from("posts")
      .select("*, profiles!author_id(*)")
      .eq("id", id)
      .maybeSingle();
    if (!row) return null;
    const author = (row as any).profiles ?? null;
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", id),
      supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", id),
    ]);
    return {
      id: row.id,
      author_id: row.author_id,
      filiere: row.filiere ?? null,
      title: row.title ?? null,
      content: row.content,
      type: row.type,
      attachment_url: row.attachment_url ?? null,
      created_at: row.created_at,
      author,
      likesCount: likesRes.count ?? 0,
      commentsCount: commentsRes.count ?? 0,
      savesCount: 0,
      likedByMe: false,
      savedByMe: false,
      repostedByMe: false,
      repostsCount: 0,
    };
  } catch { return null; }
}

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark } = useTheme();

  const storePost = useFeedStore.getState().posts.find(p => p.id === id);
  const [post, setPost]     = useState<FeedPost | null>(storePost ?? null);
  const [loading, setLoading] = useState(!storePost);

  const { toggleLike, toggleSave, toggleRepost, openComments, addComment, commentsByPost, commentsLoading } = useFeedStore();
  const comments: FeedComment[] = commentsByPost[id ?? ""] ?? [];

  const [liked,    setLiked]    = useState(post?.likedByMe ?? false);
  const [likes,    setLikes]    = useState(post?.likesCount ?? 0);
  const [saved,    setSaved]    = useState(post?.savedByMe ?? false);
  const [reposted, setReposted] = useState(post?.repostedByMe ?? false);
  const [reposts,  setReposts]  = useState(post?.repostsCount ?? 0);
  const [commentText, setCommentText] = useState("");

  // Entry zoom animation
  const entryScale   = useRef(new Animated.Value(0.93)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(entryScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 9 }),
      Animated.timing(entryOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  // Fetch post if not in store
  useEffect(() => {
    if (storePost || !id) return;
    fetchPostById(id).then(p => {
      if (p) {
        setPost(p);
        setLiked(p.likedByMe);
        setLikes(p.likesCount);
        setSaved(p.savedByMe);
        setReposted(p.repostedByMe ?? false);
        setReposts(p.repostsCount ?? 0);
      }
      setLoading(false);
    });
  }, [id, storePost]);

  // Load comments on mount
  useEffect(() => {
    if (id) openComments(id).catch(() => null);
  }, [id]);

  const handleLike = useCallback(() => {
    if (!post) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    const next = !liked;
    setLiked(next); setLikes(v => v + (next ? 1 : -1));
    toggleLike(post.id).catch(() => null);
  }, [liked, post, toggleLike]);

  const handleSave = useCallback(() => {
    if (!post) return;
    Haptics.selectionAsync().catch(() => null);
    setSaved(v => !v);
    toggleSave(post.id).catch(() => null);
  }, [post, toggleSave]);

  const handleRepost = useCallback(() => {
    if (!post) return;
    const next = !reposted;
    setReposted(next); setReposts(v => v + (next ? 1 : -1));
    toggleRepost(post.id).catch(() => null);
  }, [post, reposted, toggleRepost]);

  const handleShare = useCallback(async () => {
    if (!post) return;
    await Share.share({
      title:   post.title || "BLOC",
      message: `${post.title ? post.title + "\n\n" : ""}${post.content}\n\nhttps://blocapp.fr/post/${post.id}`,
    }).catch(() => null);
  }, [post]);

  const submitComment = useCallback(async () => {
    if (!id || !commentText.trim()) return;
    const text = commentText.trim();
    setCommentText("");
    await addComment(id, text).catch(() => null);
  }, [id, commentText, addComment]);

  const openDocViewer = useCallback(() => {
    if (!post) return;
    router.push({
      pathname: "/(modals)/doc-viewer",
      params: {
        url: post.attachment_url ?? "",
        title: post.title ?? "Document",
        type: post.type,
        postId: post.id,
      },
    });
  }, [post, router]);

  if (loading) {
    return (
      <View style={[s.root, { backgroundColor: c.background }]}>
        <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: c.border, backgroundColor: c.background }]}>
          <Pressable onPress={() => router.back()} style={[s.iconBtn, { borderColor: c.border, backgroundColor: c.card }]}>
            <Ionicons name="arrow-back" size={18} color={c.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={{ width: 38 }} />
        </View>
        <View style={s.center}><ActivityIndicator color="#7B6CFF" size="large" /></View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[s.root, { backgroundColor: c.background }]}>
        <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: c.border, backgroundColor: c.background }]}>
          <Pressable onPress={() => router.back()} style={[s.iconBtn, { borderColor: c.border, backgroundColor: c.card }]}>
            <Ionicons name="arrow-back" size={18} color={c.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={{ width: 38 }} />
        </View>
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={{ color: c.textSecondary, fontSize: 15, marginTop: 10 }}>Publication introuvable</Text>
        </View>
      </View>
    );
  }

  const name      = post.author?.display_name || post.author?.full_name || post.author?.username || "Utilisateur";
  const handle    = post.author?.username || `user-${(post.author_id || "").slice(0, 5)}`;
  const role      = getRole(post);
  const roleStyle = ROLE_STYLES[role];
  const initials  = name.slice(0, 2).toUpperCase();
  const avatarColors: [string, string] = role === "Professeur"
    ? ["#F59E0B", "#D97706"] : role === "École"
    ? ["#10B981", "#059669"]
    : ["#818CF8", "#6366F1"];

  return (
    <Animated.View style={[s.root, { backgroundColor: c.background, transform: [{ scale: entryScale }], opacity: entryOpacity }]}>
      {/* Sticky header */}
      <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: c.border, backgroundColor: c.background }]}>
        <Pressable onPress={() => router.back()} style={[s.iconBtn, { borderColor: c.border, backgroundColor: c.card }]}>
          <Ionicons name="arrow-back" size={18} color={c.textPrimary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: c.textPrimary }]}>Publication</Text>
        <Pressable onPress={handleShare} style={[s.iconBtn, { borderColor: c.border, backgroundColor: c.card }]}>
          <Ionicons name="share-outline" size={18} color={c.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled">

        {/* Post card */}
        <View style={[s.postCard, { backgroundColor: isDark ? "#0F0F28" : "#fff", borderColor: isDark ? "rgba(130,110,255,0.16)" : "rgba(91,76,255,0.09)" }]}>
          <LinearGradient colors={["rgba(130,110,255,0.22)", "rgba(130,110,255,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1 }} />

          <View style={{ padding: 16 }}>
            {/* Author */}
            <Pressable onPress={() => router.push(`/profile/${post.author?.id || post.author_id}` as any)}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, overflow: "hidden", borderWidth: 1.5, borderColor: roleStyle.bg.replace("0.12", "0.4") }}>
                {post.author?.avatar_url
                  ? <Image source={{ uri: post.author.avatar_url }} style={{ width: 48, height: 48 }} />
                  : <LinearGradient colors={avatarColors} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 17 }}>{initials}</Text>
                    </LinearGradient>
                }
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 15, letterSpacing: -0.3 }}>{name}</Text>
                  <View style={{ backgroundColor: roleStyle.bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: roleStyle.color + "30" }}>
                    <Text style={{ color: roleStyle.color, fontSize: 10, fontWeight: "800" }}>{roleStyle.label}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3, flexWrap: "wrap" }}>
                  <Text style={{ color: c.textSecondary, fontSize: 12.5 }}>@{handle}</Text>
                  {post.filiere && (
                    <>
                      <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: c.textSecondary, opacity: 0.4 }} />
                      <Text style={{ color: c.textSecondary, fontSize: 12 }} numberOfLines={1}>{post.filiere}</Text>
                    </>
                  )}
                  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: c.textSecondary, opacity: 0.4 }} />
                  <Text style={{ color: c.textSecondary, fontSize: 12 }}>{relDate(post.created_at)}</Text>
                </View>
              </View>
            </Pressable>

            {/* Content — no line limit */}
            <View style={{ marginTop: 16 }}>
              {post.title ? (
                <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "900", letterSpacing: -0.4, lineHeight: 25, marginBottom: 10 }}>
                  {post.title}
                </Text>
              ) : null}
              <Text style={{ color: c.textPrimary, fontSize: 15, lineHeight: 23, opacity: 0.88 }}>
                {post.content}
              </Text>
            </View>

            {/* Attachment */}
            {post.type !== "text" && (
              <Pressable onPress={openDocViewer}
                style={[s.attachment, { backgroundColor: isDark ? "#181836" : "#F4F2FF", borderColor: isDark ? "rgba(130,110,255,0.20)" : "rgba(91,76,255,0.12)" }]}>
                <View style={s.attachIcon}>
                  <Ionicons name={post.type === "pdf" ? "document-text" : "flash"} size={18} color="#7B6CFF" />
                </View>
                <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 13, flex: 1 }}>
                  {post.type === "pdf" ? "Voir le document" : "Répondre au QCM"}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={c.textSecondary} />
              </Pressable>
            )}

            {/* Action bar */}
            <View style={[s.actionBar, { borderTopColor: isDark ? "rgba(130,110,255,0.10)" : "rgba(91,76,255,0.06)" }]}>
              <Pressable onPress={handleLike}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 6 }}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#FF4757" : c.textSecondary} />
                <Text style={{ color: liked ? "#FF4757" : c.textSecondary, fontSize: 14, fontWeight: "700" }}>{likes}</Text>
              </Pressable>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 6 }}>
                <Ionicons name="chatbubble-outline" size={18} color={c.textSecondary} />
                <Text style={{ color: c.textSecondary, fontSize: 14, fontWeight: "700" }}>{comments.length || post.commentsCount || 0}</Text>
              </View>
              <Pressable onPress={handleRepost}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 6 }}>
                <Ionicons name="repeat-outline" size={20} color={reposted ? "#F59E0B" : c.textSecondary} />
                <Text style={{ color: reposted ? "#F59E0B" : c.textSecondary, fontSize: 14, fontWeight: "700" }}>{reposts}</Text>
              </Pressable>
              <Pressable onPress={handleSave}
                style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}>
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={saved ? "#7B6CFF" : c.textSecondary} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Comments section */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 16, marginBottom: 14 }}>
            Commentaires{comments.length > 0 ? ` (${comments.length})` : ""}
          </Text>

          {commentsLoading ? (
            <ActivityIndicator color="#7B6CFF" style={{ marginVertical: 20 }} />
          ) : comments.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 24, gap: 8 }}>
              <Ionicons name="chatbubbles-outline" size={36} color="rgba(255,255,255,0.12)" />
              <Text style={{ color: c.textSecondary, fontSize: 14 }}>Aucun commentaire — sois le premier !</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {comments.map(comment => (
                <View key={comment.id} style={[s.commentCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 12 }}>
                        {(comment.author?.username || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 13 }}>
                      @{comment.author?.username || "utilisateur"}
                    </Text>
                    <Text style={{ color: c.textSecondary, fontSize: 11, marginLeft: "auto" }}>
                      {relDate(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={{ color: c.textPrimary, fontSize: 14, lineHeight: 20, marginLeft: 38 }}>
                    {comment.content}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Add comment */}
          <View style={[s.commentInput, { borderTopColor: c.border, marginTop: 20 }]}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Ajouter un commentaire…"
              placeholderTextColor={c.textSecondary}
              style={[s.textInput, { backgroundColor: c.cardAlt, borderColor: c.border, color: c.textPrimary }]}
              multiline
            />
            <Pressable onPress={submitComment} disabled={!commentText.trim()}
              style={[s.sendBtn, { backgroundColor: commentText.trim() ? "#7B6CFF" : c.cardAlt }]}>
              <Ionicons name="send" size={16} color={commentText.trim() ? "#fff" : c.textSecondary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1 },
  center:      { flex: 1, alignItems: "center", justifyContent: "center" },
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  iconBtn:     { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  postCard:   { marginHorizontal: 14, marginTop: 14, borderRadius: 24, borderWidth: 1, overflow: "hidden" },
  attachment: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, borderRadius: 14, padding: 12, borderWidth: 1 },
  attachIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(123,108,255,0.18)", alignItems: "center", justifyContent: "center" },
  actionBar:  { flexDirection: "row", alignItems: "center", marginTop: 14, borderTopWidth: 1, paddingTop: 10 },

  commentCard:  { borderRadius: 16, borderWidth: 1, padding: 12 },
  commentInput: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingTop: 16, borderTopWidth: 1 },
  textInput:    { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn:      { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
