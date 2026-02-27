import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";

export type LibraryTabKey = "projects" | "files" | "flashcards" | "quiz" | "groups";

type TabItem = {
  key: LibraryTabKey;
  label: string;
};

const tabs: TabItem[] = [
  { key: "projects", label: "Projets" },
  { key: "files", label: "Fichiers" },
  { key: "flashcards", label: "Flashcards" },
  { key: "quiz", label: "Quiz" },
  { key: "groups", label: "Groupes" },
];

type Props = {
  value: LibraryTabKey;
  onChange: (value: LibraryTabKey) => void;
};

export function TabsRow({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            <View style={[styles.indicator, active && styles.indicatorActive]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 16, paddingRight: 12 },
  tab: { alignItems: "center", paddingVertical: 4 },
  label: { color: "#A3A8B2", fontWeight: "700", fontSize: 14 },
  labelActive: { color: "#FFFFFF" },
  indicator: {
    marginTop: 8,
    width: "100%",
    height: 2,
    borderRadius: 99,
    backgroundColor: "transparent",
  },
  indicatorActive: { backgroundColor: "#FFFFFF" },
});
