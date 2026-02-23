import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import Screen from "../../../core/ui/Screen";
import { AppText } from "../../../core/ui/AppText";
import { AppButton } from "../../../core/ui/AppButton";
import { AppHeader } from "../../../core/ui/AppHeader";
import { Skeleton } from "../../../core/ui/Skeleton";
import Card from "../../../core/ui/Card";
import DashboardWidget from "../../dashboard/DashboardWidget";
import { useHomeFeed } from "../hooks/useHomeFeed";
import { HomeTabs } from "../components/HomeTabs";
import { PostCard } from "../components/PostCard";
import { DeadlineCarousel } from "../components/DeadlineCarousel";
import { SuggestionCard } from "../components/SuggestionCard";
import { theme } from "../../../core/ui/theme";

const quickActions = [
  { label: "QCM", route: "/(modals)/qcm-new" },
  { label: "Fiche", route: "/(modals)/note-new" },
  { label: "Resume", route: "/(modals)/note-new" },
  { label: "Audio", route: "/(modals)/create" },
];

function HomeScreenComponent() {
  const router = useRouter();
  const {
    tabs,
    activeTab,
    posts,
    refreshing,
    loadingMore,
    initialLoading,
    loadInitial,
    refresh,
    loadMore,
    switchTab,
    scrollOffsetByTab,
  } = useHomeFeed();
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const listRef = useRef<any>(null);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const y = scrollOffsetByTab.current[activeTab] ?? 0;
    requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: y, animated: false }));
  }, [activeTab, scrollOffsetByTab]);

  const publish = useCallback(() => {
    if (!composerText.trim()) return;
    setComposerText("");
    setComposerOpen(false);
  }, [composerText]);

  const header = useMemo(
    () => (
      <View style={{ gap: 12 }}>
        <View>
          <AppHeader title="Fil d'actualite" subtitle="Campus ESGI" rightLabel="💬" onRightPress={() => router.push("/messages")} />
        </View>

        <DashboardWidget onNavigate={(route) => router.push(route as any)} />
        <HomeTabs tabs={tabs} active={activeTab} onChange={switchTab} />
        <DeadlineCarousel />

        <Pressable onPress={() => setComposerOpen((v) => !v)}>
          <Card>
            <AppText muted>Quoi de neuf ?</AppText>
          </Card>
        </Pressable>

        {composerOpen ? (
          <Card>
            <TextInput
              value={composerText}
              onChangeText={setComposerText}
              placeholder="Ecris une annonce..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              style={{ color: theme.colors.text, minHeight: 70 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <AppButton variant="secondary" onPress={() => router.push("/(modals)/create-new")}>Ajouter</AppButton>
              <AppButton onPress={publish}>Publier</AppButton>
            </View>
          </Card>
        ) : null}

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {quickActions.map((a) => (
            <AppButton key={a.label} variant="secondary" onPress={() => router.push(a.route)}>
              {a.label}
            </AppButton>
          ))}
        </View>

        <SuggestionCard
          title="Suggestion"
          subtitle="Lance une session pomodoro pour garder le rythme"
          onPress={() => router.push("/(modals)/pomodoro")}
        />
      </View>
    ),
    [activeTab, composerOpen, composerText, publish, router, switchTab, tabs]
  );

  return (
    <Screen>
      {initialLoading ? (
        <View style={{ gap: 10, marginTop: 14 }}>
          <Skeleton height={28} width="55%" />
          <Skeleton height={120} />
          <Skeleton height={22} width="70%" />
          <Skeleton height={180} />
          <Skeleton height={180} />
          <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 8 }} />
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListHeaderComponent={header}
          ListHeaderComponentStyle={{ paddingBottom: 12 }}
          ListEmptyComponent={
            <Card>
              <AppText>Aucun post</AppText>
              <AppText muted variant="caption" style={{ marginTop: 6 }}>
                Change d'onglet ou rafraichis le feed.
              </AppText>
            </Card>
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={theme.colors.accent} /> : null}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          onScroll={(evt) => {
            scrollOffsetByTab.current[activeTab] = evt.nativeEvent.contentOffset.y;
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

export const HomeScreen = memo(HomeScreenComponent);
