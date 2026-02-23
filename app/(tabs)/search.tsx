import { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import Screen from "../../src/core/ui/Screen";
import SegmentedTabs from "../../src/core/ui/SegmentedTabs";
import Card from "../../src/core/ui/Card";
import Chip from "../../src/core/ui/Chip";
import { searchMock } from "../../src/features/search/mock";

const tabs = [
  { key: "posts", label: "Posts" },
  { key: "actus", label: "Actus" },
  { key: "personnes", label: "Personnes" },
  { key: "profs", label: "Professeurs" },
  { key: "perso", label: "Personnalites" },
];

const filters = ["Pertinence", "Date", "Popularite", "Campus", "Matiere"];

export default function Search() {
  const [tab, setTab] = useState("posts");
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState("Pertinence");
  const normalizedQuery = q.trim().toLowerCase();

  const filteredPeople = useMemo(() => {
    let items = [...searchMock.people];

    if (normalizedQuery) {
      items = items.filter((p) =>
        `${p.name} ${p.handle} ${p.campus}`.toLowerCase().includes(normalizedQuery)
      );
    }

    if (activeFilter === "Popularite") {
      items.sort((a, b) => b.level - a.level);
    }

    return items;
  }, [activeFilter, normalizedQuery]);

  const filteredPosts = useMemo(() => {
    let items = [...searchMock.posts];

    if (normalizedQuery) {
      items = items.filter((post) =>
        `${post.title} ${post.content} ${post.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    if (activeFilter === "Popularite") {
      items.sort((a, b) => b.stats.likes - a.stats.likes);
    }

    return items;
  }, [activeFilter, normalizedQuery]);

  const isPeopleTab = tab === "personnes" || tab === "profs" || tab === "perso";
  const resultCount = isPeopleTab ? filteredPeople.length : filteredPosts.length;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ color: "white", fontSize: 30, fontWeight: "800" }}>Recherche</Text>
          <Text style={{ color: "rgba(255,255,255,0.6)" }}>Filtrer</Text>
        </View>

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher posts, cours, QCM..."
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={{
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "#14151a",
            color: "white",
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
          }}
        />

        <SegmentedTabs items={tabs} value={tab} onChange={setTab} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {filters.map((f) => (
              <Pressable key={f} onPress={() => setActiveFilter(f)}>
                <Chip label={f} active={activeFilter === f} />
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={{ marginTop: 14, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "700" }}>Tendances</Text>
            <Text style={{ color: "rgba(255,255,255,0.55)" }}>{resultCount} resultat(s)</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["#qcm", "#reseaux", "#maths", "#pomodoro", "#exam"].map((t) => (
              <Chip key={t} label={t} />
            ))}
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 16 }}>
          {isPeopleTab ? (
            filteredPeople.length === 0 ? (
              <Card>
                <Text style={{ color: "white", fontWeight: "800" }}>Aucun resultat</Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                  Essaie un autre mot-cle.
                </Text>
              </Card>
            ) : (
              filteredPeople.map((p) => (
                <Card key={p.id}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "#2a2f3a",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "800" }}>{p.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "white", fontWeight: "800" }}>{p.name}</Text>
                      <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                        {p.handle} · {p.campus}
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>Niveau {p.level}</Text>
                    </View>
                    <Pressable
                      style={{
                        backgroundColor: "white",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ color: "#111217", fontWeight: "800" }}>Suivre</Text>
                    </Pressable>
                  </View>
                </Card>
              ))
            )
          ) : filteredPosts.length === 0 ? (
            <Card>
              <Text style={{ color: "white", fontWeight: "800" }}>Aucun resultat</Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                Essaie un autre mot-cle.
              </Text>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontWeight: "700" }}>
                    {post.type.toUpperCase()}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.55)" }}>{post.createdAt}</Text>
                </View>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "800", marginTop: 6 }}>{post.title}</Text>
                <Text style={{ color: "rgba(255,255,255,0.65)", marginTop: 6 }}>{post.content}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {post.tags.map((t) => (
                    <Chip key={t} label={`#${t}`} />
                  ))}
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
