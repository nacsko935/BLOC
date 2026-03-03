import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import SegmentedTabs from "../../src/core/ui/SegmentedTabs";
import Card from "../../src/core/ui/Card";
import IconButton from "../../src/core/ui/IconButton";
import { Ionicons } from "@expo/vector-icons";
import { searchGroupsPage, searchPostsPage, searchUsersPage } from "../../lib/services/searchService";

const tabs = [
  { key: "users", label: "Utilisateurs" },
  { key: "groups", label: "Groupes" },
  { key: "posts", label: "Posts" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function Search() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("users");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const [usersCursor, setUsersCursor] = useState<string | null>(null);
  const [groupsCursor, setGroupsCursor] = useState<string | null>(null);
  const [postsCursor, setPostsCursor] = useState<string | null>(null);

  const hasQuery = q.trim().length > 0;

  const getUserTitle = (u: any) => u.display_name || u.full_name || u.username || "Utilisateur";
  const getUserHandle = (u: any) => u.username || `user-${String(u.id || "").slice(0, 6)}`;

  const activeData = useMemo(() => {
    if (tab === "users") return users;
    if (tab === "groups") return groups;
    return posts;
  }, [tab, users, groups, posts]);

  const activeCursor = useMemo(() => {
    if (tab === "users") return usersCursor;
    if (tab === "groups") return groupsCursor;
    return postsCursor;
  }, [tab, usersCursor, groupsCursor, postsCursor]);

  const resultCount = activeData.length;

  const runSearch = useCallback(
    async (opts?: { append?: boolean; tabOverride?: TabKey; qOverride?: string }) => {
      const append = Boolean(opts?.append);
      const currentTab = opts?.tabOverride ?? tab;
      const value = (opts?.qOverride ?? q).trim();

      if (!value) {
        setUsers([]);
        setGroups([]);
        setPosts([]);
        setUsersCursor(null);
        setGroupsCursor(null);
        setPostsCursor(null);
        setError(null);
        return;
      }

      if (append) {
        const cursorForTab =
          currentTab === "users" ? usersCursor : currentTab === "groups" ? groupsCursor : postsCursor;
        if (!cursorForTab) return;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        if (currentTab === "users") {
          const page = await searchUsersPage(value, { limit: 20, cursor: append ? usersCursor : null });
          setUsers((prev) => (append ? [...prev, ...page.items] : page.items));
          setUsersCursor(page.nextCursor);
        } else if (currentTab === "groups") {
          const page = await searchGroupsPage(value, { limit: 20, cursor: append ? groupsCursor : null });
          setGroups((prev) => (append ? [...prev, ...page.items] : page.items));
          setGroupsCursor(page.nextCursor);
        } else {
          const page = await searchPostsPage(value, { limit: 20, cursor: append ? postsCursor : null });
          setPosts((prev) => (append ? [...prev, ...page.items] : page.items));
          setPostsCursor(page.nextCursor);
        }
      } catch (e: any) {
        setError(e?.message ?? "Recherche indisponible.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [tab, q, usersCursor, groupsCursor, postsCursor]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch({ append: false }).catch(() => null);
    }, 400);
    return () => clearTimeout(timer);
  }, [q, tab, runSearch]);

  return (
    <Screen>
      <FlatList
        data={activeData}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.35}
        onEndReached={() => {
          if (!hasQuery || !activeCursor || loading || loadingMore) return;
          runSearch({ append: true }).catch(() => null);
        }}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Recherche</Text>
              <IconButton onPress={() => setQ("")}>
                <Ionicons name="close-outline" size={20} color="#fff" />
              </IconButton>
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="search-outline" size={18} color="#9A9A9A" />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Rechercher utilisateurs, groupes, posts..."
                placeholderTextColor="#9A9A9A"
                style={styles.input}
              />
            </View>

            <Text style={styles.count}>{resultCount} resultat(s)</Text>

            <SegmentedTabs
              items={tabs as any}
              value={tab}
              onChange={(next: any) => {
                setTab(next);
              }}
            />

            <View style={styles.results}>
              {loading ? <ActivityIndicator color="#fff" /> : null}
              {error ? (
                <Card>
                  <Text style={{ color: "#fff", fontWeight: "800" }}>Erreur</Text>
                  <Text style={{ color: "#9A9A9A", marginTop: 6 }}>{error}</Text>
                </Card>
              ) : null}
              {!hasQuery ? (
                <Card>
                  <Text style={{ color: "white", fontWeight: "800" }}>Recherche</Text>
                  <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                    Suggestions: sql, react, bdd, alternance
                  </Text>
                </Card>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          hasQuery && !loading && !error ? (
            <Card>
              <Text style={{ color: "white", fontWeight: "800" }}>
                {tab === "users" ? "Aucun utilisateur" : tab === "groups" ? "Aucun groupe" : "Aucun post"}
              </Text>
            </Card>
          ) : null
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginTop: 14 }} color="#fff" /> : null}
        renderItem={({ item }) => {
          if (tab === "users") {
            return (
              <Pressable
                onPress={() => router.push({ pathname: "/profile/[id]", params: { id: item.id } })}
              >
                <Card>
                  <Text style={styles.itemTitle}>{getUserTitle(item)}</Text>
                  <Text style={styles.itemSubtitle}>@{getUserHandle(item)}</Text>
                </Card>
              </Pressable>
            );
          }

          if (tab === "groups") {
            return (
              <Pressable
                onPress={() => router.push({ pathname: "/messages/group/[id]", params: { id: item.id } })}
              >
                <Card>
                  <Text style={styles.itemTitle}>{item.title || "Groupe"}</Text>
                  <Text style={styles.itemSubtitle}>{item.description || "Sans description"}</Text>
                </Card>
              </Pressable>
            );
          }

          return (
            <Pressable onPress={() => router.push({ pathname: "/content/[id]", params: { id: item.id } })}>
              <Card>
                <Text style={styles.itemTitle}>{item.title || "Post"}</Text>
                <Text style={[styles.itemSubtitle, { marginTop: 6 }]}>{item.content}</Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 56, paddingBottom: 120, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { color: "#fff", fontSize: 30, fontWeight: "800" },
  inputWrap: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    backgroundColor: "#111",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  input: { flex: 1, color: "#fff", paddingVertical: 10 },
  count: { color: "#9A9A9A", marginBottom: 12 },
  results: { gap: 12, marginTop: 12, marginBottom: 8 },
  itemTitle: { color: "#fff", fontWeight: "800" },
  itemSubtitle: { color: "#9A9A9A", marginTop: 4 },
});

