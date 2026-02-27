import { Href, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { blockUser, hidePost, reportTarget } from "../../../../lib/services/moderationService";
import { AppButton } from "../../../core/ui/AppButton";
import { seedInitialContentIfEmptyDev } from "../../../../lib/dev/seed";

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

  useEffect(() => {
    seedInitialContentIfEmptyDev()
      .then((result) => {
        if (result) {
          refresh(filiere).catch(() => null);
        }
      })
      .catch(() => null);
  }, [refresh, filiere]);

  const notificationCount = useMemo(() => 3, []);

  const onPressTrend = useCallback((trend: TrendItem) => {
    router.push(`/trends/${trend.id}` as Href);
  }, [router]);

  const onPressContent = useCallback((post: FeedPost) => {
    router.push(`/content/${post.id}` as Href);
  }, [router]);

  const onPressComments = useCallback(async (post: FeedPost) => {
    setSelectedCommentPost(post);
    await openComments(post.id).catch((error: any) => {
      Alert.alert("Erreur", error?.message || "Impossible de charger les commentaires");
    });
  }, [openComments]);

  const submitComment = useCallback(async () => {
    if (!selectedCommentPost || !commentText.trim()) return;
    await addComment(selectedCommentPost.id, commentText.trim()).catch((error: any) => {
      Alert.alert("Erreur", error?.message || "Impossible d'ajouter le commentaire");
    });
    setCommentText("");
  }, [addComment, commentText, selectedCommentPost]);

  return (
    <View style={styles.screen}>
      <HomeHeader
        notificationCount={notificationCount}
        avatarLabel={profile?.full_name || profile?.username || "B"}
        onPressBoost={() => router.push("/create")}
        onPressFavorites={() => Alert.alert("Favoris", "Tu pourras retrouver tes contenus favoris ici.")}
        onPressNotifications={() => Alert.alert("Notifications", "Aucune nouvelle notification importante.")}
        onPressTitle={() => router.push("/(tabs)/search")}
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
              <AppButton variant="secondary" onPress={() => router.push("/(tabs)/search")}>Voir tout</AppButton>
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
        ListEmptyComponent={loading ? (
          <View style={styles.skeletonWrap}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonCard}>
                <View style={styles.skeletonLineLg} />
                <View style={styles.skeletonLineMd} />
                <View style={styles.skeletonLineSm} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Aucun post. Cree ta premiere publication.</Text>
            <View style={styles.emptyActions}>
              <AppButton onPress={() => router.push("/create")}>Creer ton premier post</AppButton>
              <AppButton variant="secondary" onPress={() => router.push("/(tabs)/messages/index")}>
                Rejoindre un groupe
              </AppButton>
            </View>
          </View>
        )}
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#fff" style={{ marginVertical: 12 }} /> : null}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={async (id) => {
              try {
                await toggleLike(id);
              } catch (error: any) {
                Alert.alert("Erreur", error?.message || "Action like indisponible");
              }
            }}
            onToggleSave={async (id) => {
              try {
                await toggleSave(id);
              } catch (error: any) {
                Alert.alert("Erreur", error?.message || "Action sauvegarde indisponible");
              }
            }}
            onPressComments={onPressComments}
            onPressContent={onPressContent}
            onPressFollow={(post) => {
              const name = post.author?.username || post.author?.full_name || "cet utilisateur";
              Alert.alert("Suivi", `Tu suis maintenant ${name}.`);
            }}
            onPressShare={(post) => {
              Alert.alert("Partager", `Publication "${post.title || "Sans titre"}" partagee (demo).`);
            }}
            onPressMore={(post) => {
              Alert.alert("Actions", "Selectionne une action", [
                {
                  text: "Signaler",
                  onPress: async () => {
                    try {
                      await reportTarget({ targetType: "post", targetId: post.id, reason: "signalement utilisateur" });
                      Alert.alert("Merci", "Signalement envoye.");
                    } catch (error: any) {
                      Alert.alert("Erreur", error?.message || "Impossible de signaler");
                    }
                  },
                },
                {
                  text: "Masquer",
                  onPress: async () => {
                    try {
                      await hidePost(post.id);
                      await refresh(filiere);
                    } catch (error: any) {
                      Alert.alert("Erreur", error?.message || "Impossible de masquer");
                    }
                  },
                },
                {
                  text: "Bloquer l'auteur",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      if (!post.author?.id) return;
                      await blockUser(post.author.id);
                      await refresh(filiere);
                    } catch (error: any) {
                      Alert.alert("Erreur", error?.message || "Impossible de bloquer");
                    }
                  },
                },
                { text: "Annuler", style: "cancel" },
              ]);
            }}
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
              <AppButton style={styles.commentSend} onPress={submitComment}>
                Envoyer
              </AppButton>
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
  emptyActions: { width: "100%", gap: 8, paddingHorizontal: 24 },
  emptyCta: {
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCtaText: { color: "#fff", fontWeight: "700" },
  skeletonWrap: { gap: 10, paddingVertical: 8 },
  skeletonCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#101010",
    padding: 14,
    gap: 8,
  },
  skeletonLineLg: { height: 18, borderRadius: 9, backgroundColor: "#1E1E1E", width: "70%" },
  skeletonLineMd: { height: 12, borderRadius: 6, backgroundColor: "#1C1C1C", width: "92%" },
  skeletonLineSm: { height: 12, borderRadius: 6, backgroundColor: "#1A1A1A", width: "60%" },
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
