import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ModuleRow } from "../../src/features/learning/components/ModuleRow";
import { PillButton } from "../../src/features/learning/components/PillButton";
import { listModules } from "../../src/features/learning/services";
import { Module } from "../../src/features/learning/types";

const levelFilters: Array<{ key: "all" | Module["level"]; label: string }> = [
  { key: "all", label: "Tous" },
  { key: "debutant", label: "Debutant" },
  { key: "intermediaire", label: "Intermediaire" },
  { key: "avance", label: "Avance" },
];

export default function LearningCatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ certified?: string }>();
  const [query, setQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState<(typeof levelFilters)[number]["key"]>("all");
  const [certifiedOnly, setCertifiedOnly] = useState(params.certified === "true");
  const [results, setResults] = useState<Module[]>([]);

  useEffect(() => {
    listModules({
      query,
      level: activeLevel,
      certified: certifiedOnly,
    })
      .then(setResults)
      .catch(() => setResults([]));
  }, [query, activeLevel, certifiedOnly]);

  const emptyTitle = useMemo(() => (query ? "Aucun module trouve" : "Aucun module disponible"), [query]);

  return (
    <View style={styles.screen}>
      <View style={styles.stickyHeader}>
        <Text style={styles.title}>Catalogue</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un module, un auteur..."
          placeholderTextColor="#787D86"
          style={styles.searchInput}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {levelFilters.map((filter) => (
            <Pressable key={filter.key} onPress={() => setActiveLevel(filter.key)}>
              <PillButton label={filter.label} tone={activeLevel === filter.key ? "light" : "dark"} />
            </Pressable>
          ))}
          <Pressable onPress={() => setCertifiedOnly((prev) => !prev)}>
            <PillButton label="Certifie" tone={certifiedOnly ? "accent" : "dark"} />
          </Pressable>
        </ScrollView>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <ModuleRow
              module={item}
              onPress={() => router.push({ pathname: "/(learning)/module/[id]", params: { id: item.id } })}
              subtitleOverride={`${item.subtitle} • ${Math.max(1, Math.round(item.durationMinutes / 60))}h`}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>Essaie un autre filtre ou retire le filtre Certifie.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  stickyHeader: {
    paddingTop: 58,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: "#000",
  },
  title: { color: "#FFF", fontSize: 34, fontWeight: "900" },
  searchInput: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#242529",
    backgroundColor: "#121315",
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  filterRow: { gap: 8, paddingTop: 10, paddingRight: 8 },
  listContent: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 40 },
  emptyCard: {
    marginTop: 12,
    backgroundColor: "#101113",
    borderWidth: 1,
    borderColor: "#232428",
    borderRadius: 18,
    padding: 14,
  },
  emptyTitle: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  emptyText: { color: "#989CA4", marginTop: 6 },
});
