import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { FeedPost } from "../../types/db";

type PostCardProps = {
  post: FeedPost;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onPressComments: (post: FeedPost) => void;
  onPressContent: (post: FeedPost) => void;
};

export function PostCard({ post, onToggleLike, onToggleSave, onPressComments, onPressContent }: PostCardProps) {
  const authorName = post.author?.full_name || post.author?.username || "Utilisateur";
  const username = post.author?.username || "bloc";
  const role = post.author?.niveau || "ETUDIANT";

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
              <Text style={styles.time}>{new Date(post.created_at).toLocaleString()}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightTopRow}>
          <Pressable style={styles.followPill}><Text style={styles.followText}>Suivre</Text></Pressable>
          <Pressable style={styles.iconTap}><Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} /></Pressable>
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
        <Pressable style={styles.actionBtn} onPress={() => onToggleLike(post.id)}>
          <Ionicons name={post.likedByMe ? "heart" : "heart-outline"} color={post.likedByMe ? "#FF5C7A" : colors.textMuted} size={18} />
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
        <Pressable style={styles.actionBtn}>
          <Ionicons name="share-social-outline" color={colors.textMuted} size={18} />
          <Text style={styles.actionText}>Partager</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
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
  title: { color: colors.text, marginTop: 12, fontSize: 16, fontWeight: "700" },
  content: { marginTop: 6, color: "#D0D0D0", lineHeight: 20 },
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