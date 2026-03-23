import { ScrollView, Pressable, Text, StyleSheet, View } from "react-native";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { SearchFilter } from "../hooks/useSearch";

type CountByType = {
  all: number;
  user: number;
  course: number;
  post: number;
  note: number;
};

type FilterDef = { key: SearchFilter; label: string };

const FILTERS: FilterDef[] = [
  { key: "all",    label: "Tout" },
  { key: "user",   label: "Personnes" },
  { key: "course", label: "Cours" },
  { key: "post",   label: "Posts" },
  { key: "note",   label: "Notes" },
];

type Props = {
  active: SearchFilter;
  onChange: (f: SearchFilter) => void;
  counts: CountByType;
};

export function SearchFilters({ active, onChange, counts }: Props) {
  const { c } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map(({ key, label }) => {
        const count = counts[key];
        const isActive = active === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? c.accentPurple : c.cardAlt,
                borderColor: isActive ? c.accentPurple : c.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: isActive ? "#fff" : c.textSecondary }]}>
              {label}
            </Text>
            {count > 0 && (
              <View style={[styles.badge, { backgroundColor: isActive ? "rgba(255,255,255,0.25)" : c.border }]}>
                <Text style={[styles.badgeText, { color: isActive ? "#fff" : c.textSecondary }]}>
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  label: { fontSize: 13, fontWeight: "700" },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, fontWeight: "800" },
});
