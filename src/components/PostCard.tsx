import { memo, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../../constants/colors";
import { FeedPost } from "../../types/db";

type PostCardProps = {
  post: FeedPost;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onPressComments: (post: FeedPost) => void;
  onPressContent: (post: FeedPost) => void;
  onPressMore: (post: FeedPost) => void;
  onPressFollow?: (post: FeedPost) => void;
  onPressShare?: (post: FeedPost) => void;
};

function formatRelativeDate(input: string) {
  const date = new Date(input);
  const deltaSec = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (deltaSec < 60) return "a l'instant";
  const minutes = Math.floor(deltaSec / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "il y a 1 jour" : `il y a ${days} jours`;
}

function PostCardComponent({ post, onToggleLike, onToggleSave, onPressComments, onPressContent, onPressMore, onPressFollow, onPressShare }: PostCardProps) {
  const authorName = post.author?.full_name || post.author?.username || "Utilisateur";
  const username = post.author?.username || "bloc";
  const role = post.author?.niveau || "ETUDIANT";
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.18, duration: 120, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onToggleLike(post.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{authorName.charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{authorName}</Text>
              <Text style={styles.username}>@{username}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.rolePill, role.toLowerCase().includes("prof") ? styles.roleProf : styles.roleStudent]}>
                <Text style={styles.roleText}>{role.toUpperCase()}</Text>
              </View>
              <Text style={styles.time}>{formatRelativeDate(post.created_at)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightTopRow}>
          <Pressable
            style={styles.followPill}
            onPress={() => {
              if (onPressFollow) return onPressFollow(post);
              Alert.alert("Suivre", `Tu suis maintenant @${username}.`);
            }}
          >
            <Text style={styles.followText}>Suivre</Text>
          </Pressable>
          <Pressable style={styles.iconTap} onPress={() => onPressMore(post)}>
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {post.title ? <Text style={styles.title}>{post.title}</Text> : null}
      <Text style={styles.content} numberOfLines={3}>{post.content}</Text>

      {post.type !== "text" ? (
        <Pressable style={styles.embed} onPress={() => onPressContent(post)}>
          <View>
            <Text style={styles.embedTitle}>{post.type === "qcm" ? "QCM" : "Document"} - {post.title || "Sans titre"}</Text>
            <Text style={styles.embedMeta}>{post.attachment_url ? "Fichier joint" : "Contenu disponible"}</Text>
          </View>
          <View style={styles.embedButton}><Text style={styles.embedButtonText}>{post.type === "qcm" ? "Commencer" : "Ouvrir"}</Text></View>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Ionicons name={post.likedByMe ? "heart" : "heart-outline"} color={post.likedByMe ? "#FF5C7A" : colors.textMuted} size={18} />
          </Animated.View>
          <Text style={styles.actionText}>{post.likesCount}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => onPressComments(post)}>
          <Ionicons name="chatbubble-outline" color={colors.textMuted} size={18} />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => onToggleSave(post.id)}>
          <Ionicons name={post.savedByMe ? "bookmark" : "bookmark-outline"} color={post.savedByMe ? colors.accentAlt : colors.textMuted} size={18} />
          <Text style={styles.actionText}>{post.savesCount}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            if (onPressShare) return onPressShare(post);
            Alert.alert("Partager", "Lien de publication copie (demo).");
          }}
        >
          <Ionicons name="share-social-outline" color={colors.textMuted} size={18} />
          <Text style={styles.actionText}>Partager</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const PostCard = memo(PostCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  authorRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.text, fontWeight: "700" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: colors.text, fontWeight: "700", fontSize: 14 },
  username: { color: colors.textMuted, fontSize: 12 },
  metaRow: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 8 },
  rolePill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  roleProf: { backgroundColor: "rgba(110,92,255,0.2)" },
  roleStudent: { backgroundColor: "rgba(59,130,246,0.18)" },
  roleText: { color: colors.text, fontSize: 10, fontWeight: "700" },
  time: { color: colors.textMuted, fontSize: 11 },
  rightTopRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  followPill: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  followText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  iconTap: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, marginTop: 12, fontSize: 17, fontWeight: "800" },
  content: { marginTop: 6, color: "#CECED8", lineHeight: 20 },
  embed: {
    marginTop: 10,
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  embedTitle: { color: colors.text, fontWeight: "700", maxWidth: 210 },
  embedMeta: { color: colors.textMuted, marginTop: 3, fontSize: 12 },
  embedButton: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  embedButtonText: { color: colors.text, fontWeight: "700", fontSize: 12 },
  actions: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { color: colors.textMuted, fontSize: 12 },
});
