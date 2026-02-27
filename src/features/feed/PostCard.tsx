import { useEffect, useState } from "react";
import { Alert, View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Card from "../../core/ui/Card";
import Chip from "../../core/ui/Chip";
import { Post } from "../../core/data/models";
import { getPostInteraction, toggleLike, toggleSave } from "./feedRepo";
import { CommentsSheet } from "../comments/components/CommentsSheet";

const sourceLabel: Record<Post["source"], string> = {
  amis: "Amis",
  campus: "Campus",
  prof: "Prof",
  tendance: "Tendance",
};

const typeLabel: Record<Post["type"], string> = {
  text: "Post",
  image: "Image",
  file: "Fichier",
  link: "Lien",
  qcm: "QCM",
  audio: "Audio",
};

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.stats.likes);
  const [saves, setSaves] = useState(post.stats.saves);
  const [comments, setComments] = useState(post.stats.comments);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const interaction = await getPostInteraction(post.id, post.stats);
      setLiked(interaction.liked);
      setSaved(interaction.saved);
      setLikes(interaction.likesCount || post.stats.likes);
      setSaves(interaction.savesCount || post.stats.saves);
      setComments(interaction.commentsCount || post.stats.comments);
    })();
  }, [post.id, post.stats.comments, post.stats.likes, post.stats.saves]);

  const onToggleLike = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = await toggleLike(post.id, post.stats);
    setLiked(next);
    setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
  };

  const onToggleSave = async () => {
    await Haptics.selectionAsync();
    const next = await toggleSave(post.id, post.stats);
    setSaved(next);
    setSaves((n) => (next ? n + 1 : Math.max(0, n - 1)));
  };

  const initials = post.author.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#2a2f3a",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>{initials}</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: "white", fontWeight: "800" }}>{post.author.name}</Text>
                {post.source === "prof" ? (
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor: "#142033",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text style={{ color: "#2e90ff", fontWeight: "800", fontSize: 10 }}>PROF</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                {sourceLabel[post.source]} · {post.createdAt}
              </Text>
            </View>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.6)" }}>•••</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Chip label={typeLabel[post.type]} />
          {post.source === "prof" ? <Chip label="Prof certifie" /> : null}
        </View>

        <Text style={{ color: "white", fontSize: 16, fontWeight: "800", marginTop: 10 }}>{post.title}</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{post.content}</Text>

        {post.type === "qcm" ? (
          <View
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 14,
              backgroundColor: "#151821",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Commencer le QCM</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>15 questions · 10 min</Text>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {post.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} />
          ))}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <Pressable onPress={onToggleLike}>
              <Text style={{ color: liked ? "#ff4d5d" : "white" }}>❤ {likes}</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                setCommentsOpen(true);
              }}
            >
              <Text style={{ color: "white" }}>💬 {comments}</Text>
            </Pressable>
            <Pressable onPress={onToggleSave}>
              <Text style={{ color: saved ? "#f5b21b" : "white" }}>🔖 {saves}</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => Alert.alert("Partager", "Lien de publication copie (demo).")}>
            <Text style={{ color: "rgba(255,255,255,0.7)" }}>↗</Text>
          </Pressable>
        </View>
      </Card>

      <CommentsSheet
        visible={commentsOpen}
        targetId={`post-${post.id}`}
        onClose={() => setCommentsOpen(false)}
        onCountChange={setComments}
      />
    </>
  );
}
