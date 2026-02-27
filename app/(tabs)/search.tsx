import { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import SegmentedTabs from "../../src/core/ui/SegmentedTabs";
import Card from "../../src/core/ui/Card";
import IconButton from "../../src/core/ui/IconButton";
import { Ionicons } from "@expo/vector-icons";
import { searchGroups, searchPosts, searchUsers } from "../../lib/services/searchService";

const tabs = [
  { key: "users", label: "Utilisateurs" },
  { key: "groups", label: "Groupes" },
  { key: "posts", label: "Posts" },
] as const;

export default function Search() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("users");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const hasQuery = q.trim().length > 0;

  const runSearch = async (value: string, currentTab: typeof tab) => {
    const query = value.trim();
    if (!query) {
      setUsers([]);
      setGroups([]);
      setPosts([]);
      return;
    }

    setLoading(true);
    try {
      if (currentTab === "users") setUsers(await searchUsers(query));
      if (currentTab === "groups") setGroups(await searchGroups(query));
      if (currentTab === "posts") setPosts(await searchPosts(query));
    } finally {
      setLoading(false);
    }
  };

  const resultCount = useMemo(() => {
    if (tab === "users") return users.length;
    if (tab === "groups") return groups.length;
    return posts.length;
  }, [tab, users.length, groups.length, posts.length]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
            onChangeText={(value) => {
              setQ(value);
              runSearch(value, tab).catch(() => null);
            }}
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
            runSearch(q, next).catch(() => null);
          }}
        />

        <View style={styles.results}>
          {loading ? <ActivityIndicator color="#fff" /> : null}

          {!hasQuery ? (
            <Card>
              <Text style={{ color: "white", fontWeight: "800" }}>Recherche</Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                Suggestions: sql, react, bdd, alternance
              </Text>
            </Card>
          ) : tab === "users" ? (
            users.length === 0 ? (
              <Card>
                <Text style={{ color: "white", fontWeight: "800" }}>Aucun utilisateur</Text>
              </Card>
            ) : (
              users.map((u) => (
                <Pressable key={u.id} onPress={() => router.push("/(tabs)/profile") }>
                  <Card>
                    <Text style={styles.itemTitle}>{u.full_name || u.username || "Utilisateur"}</Text>
                    <Text style={styles.itemSubtitle}>@{u.username || "bloc"}</Text>
                  </Card>
                </Pressable>
              ))
            )
          ) : tab === "groups" ? (
            groups.length === 0 ? (
              <Card>
                <Text style={{ color: "white", fontWeight: "800" }}>Aucun groupe</Text>
              </Card>
            ) : (
              groups.map((g) => (
                <Pressable key={g.id} onPress={() => router.push({ pathname: "/messages/group/[id]", params: { id: g.id } })}>
                  <Card>
                    <Text style={styles.itemTitle}>{g.title || "Groupe"}</Text>
                    <Text style={styles.itemSubtitle}>{g.description || "Sans description"}</Text>
                  </Card>
                </Pressable>
              ))
            )
          ) : posts.length === 0 ? (
            <Card>
              <Text style={{ color: "white", fontWeight: "800" }}>Aucun post</Text>
            </Card>
          ) : (
            posts.map((p) => (
              <Pressable key={p.id} onPress={() => router.push({ pathname: "/content/[id]", params: { id: p.id } })}>
                <Card>
                  <Text style={styles.itemTitle}>{p.title || "Post"}</Text>
                  <Text style={[styles.itemSubtitle, { marginTop: 6 }]}>{p.content}</Text>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 56, paddingBottom: 120 },
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
  results: { gap: 12, marginTop: 12 },
  itemTitle: { color: "#fff", fontWeight: "800" },
  itemSubtitle: { color: "#9A9A9A", marginTop: 4 },
});
