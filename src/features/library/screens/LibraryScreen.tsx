import { useTheme } from "../../../core/theme/ThemeProvider";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import Screen from "../../../core/ui/Screen";
import { AppHeader } from "../../../core/ui/AppHeader";
import { AppText } from "../../../core/ui/AppText";
import Card from "../../../core/ui/Card";
import { Pill } from "../../../core/ui/Pill";
import { theme } from "../../../core/ui/theme";
import { getLibraryItems, LibraryItem } from "../services/libraryService";

const tabs = ["En cours", "Termines", "Favoris"] as const;

export default function LibraryScreen() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [tab, setTab] = useState<(typeof tabs)[number]>("En cours");
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Tout");
  const [difficultyFilter, setDifficultyFilter] = useState("Tout");

  useEffect(() => {
    getLibraryItems().then(setItems);
  }, []);

  const subjects = useMemo(() => ["Tout", ...Array.from(new Set(items.map((i) => i.subject)))], [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => {
        if (tab === "En cours") return i.status === "en_cours";
        if (tab === "Termines") return i.status === "termine";
        return i.favorite;
      })
      .filter((i) => (subjectFilter === "Tout" ? true : i.subject === subjectFilter))
      .filter((i) => (difficultyFilter === "Tout" ? true : i.difficulty === difficultyFilter))
      .filter((i) => (q ? `${i.title} ${i.subject} ${i.kind}`.toLowerCase().includes(q) : true));
  }, [difficultyFilter, items, query, subjectFilter, tab]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Bibliotheque" subtitle="QCM, flashcards et notes" />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher..."
          placeholderTextColor={"rgba(255,255,255,0.45)"}
          style={{
            backgroundColor: "#16161b",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: theme.radius.md,
            paddingHorizontal: 14,
            paddingVertical: 10,
            color: "#ffffff",
          }}
        />

        <View style={{ flexDirection: "row", gap: 8 }}>
          {tabs.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)}>
              <Pill active={tab === t}>{t}</Pill>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="caption">Matiere</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {subjects.map((s) => (
              <Pressable key={s} onPress={() => setSubjectFilter(s)}>
                <Pill active={subjectFilter === s}>{s}</Pill>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="caption">Difficulte</AppText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["Tout", "facile", "moyen", "difficile"].map((d) => (
              <Pressable key={d} onPress={() => setDifficultyFilter(d)}>
                <Pill active={difficultyFilter === d}>{d}</Pill>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {filtered.length === 0 ? (
            <Card>
              <AppText>Aucun element</AppText>
              <AppText muted variant="caption" style={{ marginTop: 6 }}>Ajuste les filtres ou ajoute du contenu.</AppText>
            </Card>
          ) : (
            filtered.map((item) => (
              <Card key={item.id}>
                <AppText>{item.title}</AppText>
                <AppText muted variant="caption" style={{ marginTop: 4 }}>
                  {item.kind} � {item.subject} � {item.difficulty}
                </AppText>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
