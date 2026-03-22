import { useEffect, useRef } from "react";
import {
  View, Text, SectionList, Animated, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { useSearch } from "../hooks/useSearch";
import { SearchBar } from "../components/SearchBar";
import { SearchFilters } from "../components/SearchFilters";
import { SearchResultItem } from "../components/SearchResultItem";
import { RecentSearches } from "../components/RecentSearches";
import { SearchResult } from "../services/searchService";

/* ── Skeleton row ─────────────────────────────────── */
function SkeletonRow({ c }: { c: any }) {
  return (
    <View style={[styles.skeletonRow, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.skeletonAvatar, { backgroundColor: c.cardAlt }]} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={[styles.skeletonLine, { width: "60%", backgroundColor: c.cardAlt }]} />
        <View style={[styles.skeletonLine, { width: "40%", backgroundColor: c.cardAlt }]} />
      </View>
    </View>
  );
}

/* ── Section header ───────────────────────────────── */
const SECTION_LABELS: Record<string, string> = {
  user:   "Personnes",
  course: "Cours",
  post:   "Posts",
  note:   "Notes",
};

function SectionHeader({ title, c }: { title: string; c: any }) {
  return (
    <View style={[styles.sectionHeader, { backgroundColor: c.background }]}>
      <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{title}</Text>
    </View>
  );
}

/* ── Main screen ──────────────────────────────────── */
export function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  const {
    query, setQuery,
    results, loading, skeleton,
    filter, setFilter,
    recentSearches, deleteRecent, clearRecent,
    countByType,
  } = useSearch();

  // Entry animation
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  // Build SectionList sections from results
  const sections = (() => {
    const order: SearchResult["type"][] = ["user", "course", "post", "note"];
    return order
      .map(type => ({
        title: SECTION_LABELS[type],
        key: type,
        data: results.filter(r => r.type === type),
      }))
      .filter(s => s.data.length > 0);
  })();

  const handleResultPress = (item: SearchResult) => {
    switch (item.type) {
      case "user":
        router.push({ pathname: "/profile/[id]" as any, params: { id: item.id } });
        break;
      case "course":
        router.push({ pathname: "/learning/course/[id]" as any, params: { id: item.id } });
        break;
      case "post":
        router.push({ pathname: "/content/[id]" as any, params: { id: item.id } });
        break;
      case "note":
        router.push({ pathname: "/notes/[id]" as any, params: { id: item.id } });
        break;
    }
  };

  const isEmpty = !query.trim();
  const noResults = !isEmpty && !loading && !skeleton && results.length === 0;
  const showSkeleton = skeleton || (loading && results.length === 0);

  return (
    <Animated.View
      style={[
        styles.flex,
        { backgroundColor: c.background, paddingTop: insets.top },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Search bar */}
      <View style={[styles.barWrap, { borderBottomColor: c.border }]}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onBack={() => router.back()}
          autoFocus
        />
      </View>

      {/* Filters (only when there's a query) */}
      {!isEmpty && (
        <SearchFilters
          active={filter}
          onChange={setFilter}
          counts={countByType}
        />
      )}

      {/* States */}
      {isEmpty && (
        <RecentSearches
          recent={recentSearches}
          onSelect={setQuery}
          onDelete={deleteRecent}
          onClear={clearRecent}
        />
      )}

      {showSkeleton && (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4].map(i => <SkeletonRow key={i} c={c} />)}
        </View>
      )}

      {noResults && (
        <View style={styles.empty}>
          <Text style={[styles.emptyEmoji]}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Aucun résultat</Text>
          <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
            Aucun résultat pour «&nbsp;{query}&nbsp;»
          </Text>
        </View>
      )}

      {!isEmpty && !showSkeleton && results.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id + item.type}
          renderItem={({ item }) => (
            <SearchResultItem item={item} onPress={handleResultPress} />
          )}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} c={c} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  barWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  listContent: { paddingTop: 4, paddingBottom: 100 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  skeletonList: { padding: 16, gap: 10 },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  skeletonAvatar: { width: 42, height: 42, borderRadius: 21 },
  skeletonLine: { height: 12, borderRadius: 6 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyEmoji: { fontSize: 38 },
  emptyTitle: { fontSize: 17, fontWeight: "800" },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
});
