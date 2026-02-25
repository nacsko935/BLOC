import { Href, useRouter } from "expo-router";
import { memo, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../../../../constants/colors";
import { HomeHeader } from "../../../components/HomeHeader";
import { PostCard } from "../../../components/PostCard";
import { TrendCard } from "../../../components/TrendCard";
import { FeedPost, PostType } from "../../../../types/db";
import { trendsMock, TrendItem } from "../homeMock";
import { useFeedStore } from "../../../../state/useFeedStore";
import { useAuthStore } from "../../../../state/useAuthStore";

function HomeScreenComponent() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    commentsByPost,
    commentsLoading,
    refresh,
    loadMore,
    toggleLike,
    toggleSave,
    openComments,
    addComment,
  } = useFeedStore();

  const [selectedCommentPost, setSelectedCommentPost] = useState<FeedPost | null>(null);
  const [commentText, setCommentText] = useState("");

  const filiere = profile?.filiere || undefined;

  useEffect(() => {
    refresh(filiere).catch(() => null);
  }, [refresh, filiere]);

  const notificationCount = useMemo(() => 3, []);

  const onPressTrend = (trend: TrendItem) => {
    router.push(`/trends/${trend.id}` as Href);
  };

  const onPressContent = (post: FeedPost) => {
    router.push(`/content/${post.id}` as Href);
  };

  const onPressComments = async (post: FeedPost) => {
    setSelectedCommentPost(post);
    await openComments(post.id).catch(() => null);
  };

  const submitComment = async () => {
    if (!selectedCommentPost || !commentText.trim()) return;
    await addComment(selectedCommentPost.id, commentText.trim()).catch(() => null);
    setCommentText("");
  };

  return (
    <View style={styles.screen}>
      <HomeHeader
        notificationCount={notificationCount}
        onPressBoost={() => {}}
        onPressFavorites={() => {}}
        onPressNotifications={() => {}}
        onPressTitle={() => {}}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(filiere)} tintColor="#fff" />}
        onEndReachedThreshold={0.35}
        onEndReached={() => loadMore(filiere)}
        ListHeaderComponent={
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Tendances etudes</Text>
              <Pressable><Text style={styles.sectionAction}>Voir tout</Text></Pressable>
            </View>

            <FlatList
              data={trendsMock}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <TrendCard item={item} onPress={onPressTrend} />}
              contentContainerStyle={styles.trendsList}
            />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Fil d'actu</Text>
              <Text style={styles.sectionHint}>{filiere || "Pour toi"}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.emptyText}>Chargement du feed...</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Aucun post. Cree ta premiere publication.</Text>
            </View>
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#fff" style={{ marginVertical: 12 }} /> : null}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={(id) => toggleLike(id)}
            onToggleSave={(id) => toggleSave(id)}
            onPressComments={onPressComments}
            onPressContent={onPressContent}
          />
        )}
      />

      <Modal visible={!!selectedCommentPost} transparent animationType="fade" onRequestClose={() => setSelectedCommentPost(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedCommentPost(null)} />
          <View style={styles.commentSheet}>
            <Text style={styles.commentTitle}>Commentaires</Text>
            <FlatList
              data={selectedCommentPost ? commentsByPost[selectedCommentPost.id] ?? [] : []}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 230 }}
              ListEmptyComponent={
                <Text style={styles.commentTextMuted}>
                  {commentsLoading ? "Chargement..." : "Aucun commentaire"}
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{item.author?.username || "user"}</Text>
                  <Text style={styles.commentBody}>{item.content}</Text>
                </View>
              )}
            />

            <View style={styles.commentInputRow}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Ajouter un commentaire"
                placeholderTextColor="#8D8D95"
                style={styles.commentInput}
              />
              <Pressable style={styles.commentSend} onPress={submitComment}>
                <Text style={styles.commentSendText}>Envoyer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  sectionAction: { color: colors.accentAlt, fontWeight: "600", fontSize: 13 },
  trendsList: { paddingBottom: 18 },
  sectionHint: { color: colors.textMuted, fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingVertical: 20, gap: 10 },
  emptyText: { color: colors.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  commentSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#0B0B0B",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  commentTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  commentAuthor: { color: colors.text, fontWeight: "700", fontSize: 12 },
  commentBody: { color: "#DFDFE8", marginTop: 3 },
  commentTextMuted: { color: colors.textMuted },
  commentInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentInput: {
    flex: 1,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  commentSend: {
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  commentSendText: { color: colors.text, fontWeight: "700" },
});

export const HomeScreen = memo(HomeScreenComponent);