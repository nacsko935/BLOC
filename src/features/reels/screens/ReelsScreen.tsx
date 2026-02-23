import { useMemo, useState } from "react";
import { Dimensions, Pressable, StatusBar, View, ViewToken } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../../../core/ui/AppText";
import { ReelPlayer } from "../components/ReelPlayer";
import { ReelActions } from "../components/ReelActions";
import { useReelsFeed } from "../hooks/useReelsFeed";
import { CommentsSheet } from "../../comments/components/CommentsSheet";

const { height } = Dimensions.get("window");

export function ReelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, activeIndex, setActiveIndex, loadMore } = useReelsFeed();
  const [commentsTargetId, setCommentsTargetId] = useState<string | null>(null);
  const [commentsCountById, setCommentsCountById] = useState<Record<string, number>>({});

  const onViewableItemsChanged = useMemo(
    () => ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems.find((v) => typeof v.index === "number");
      if (first?.index != null) setActiveIndex(first.index);
    },
    [setActiveIndex]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />
      <Pressable
        onPress={() => router.push("/messages")}
        style={{
          position: "absolute",
          right: 16,
          top: Math.max(insets.top + 8, 44),
          zIndex: 10,
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.42)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        <AppText style={{ fontSize: 20, color: "#fff" }}>💬</AppText>
      </Pressable>

      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        pagingEnabled
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item, index }) => (
          <View style={{ height }}>
            <ReelPlayer reel={item} isActive={index === activeIndex} />
            <ReelActions
              likesCount={item.likesCount}
              commentsCount={commentsCountById[item.id] ?? item.commentsCount}
              onComments={() => setCommentsTargetId(item.id)}
            />
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged as any}
      />

      <CommentsSheet
        visible={!!commentsTargetId}
        targetId={commentsTargetId ?? ""}
        onClose={() => setCommentsTargetId(null)}
        onCountChange={(count) => {
          if (!commentsTargetId) return;
          setCommentsCountById((prev) => ({ ...prev, [commentsTargetId]: count }));
        }}
      />
    </View>
  );
}
