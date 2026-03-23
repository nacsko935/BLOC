import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../core/theme/ThemeProvider";

const TRENDING = ["react native", "sql", "alternance", "machine learning"];

type Props = {
  recent: string[];
  onSelect: (term: string) => void;
  onDelete: (term: string) => void;
  onClear: () => void;
};

export function RecentSearches({ recent, onSelect, onDelete, onClear }: Props) {
  const { c } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Recent searches */}
      {recent.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Récents</Text>
            <Pressable onPress={onClear} hitSlop={8}>
              <Text style={[styles.clearAll, { color: c.accentPurple }]}>Effacer tout</Text>
            </Pressable>
          </View>
          {recent.map(term => (
            <Pressable key={term} onPress={() => onSelect(term)} style={styles.recentRow}>
              <Ionicons name="time-outline" size={15} color={c.textSecondary} style={{ marginTop: 1 }} />
              <Text style={[styles.recentText, { color: c.textPrimary }]} numberOfLines={1}>
                {term}
              </Text>
              <Pressable onPress={() => onDelete(term)} hitSlop={10} style={{ marginLeft: "auto" }}>
                <Ionicons name="close-outline" size={17} color={c.textSecondary} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      {/* Trending */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Tendances</Text>
        <View style={styles.chips}>
          {TRENDING.map(term => (
            <Pressable
              key={term}
              onPress={() => onSelect(term)}
              style={[styles.chip, { backgroundColor: c.cardAlt, borderColor: c.border }]}
            >
              <Ionicons name="trending-up-outline" size={13} color={c.accentPurple} />
              <Text style={[styles.chipText, { color: c.textPrimary }]}>{term}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  clearAll: { fontSize: 13, fontWeight: "700" },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  recentText: { fontSize: 14, flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
});
