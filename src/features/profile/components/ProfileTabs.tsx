import { Pressable, StyleSheet, Text, View } from "react-native";

export type ProfileTab = "activite" | "cours" | "fichiers" | "groupes";

type Props = {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
};

const tabs: Array<{ key: ProfileTab; label: string }> = [
  { key: "activite", label: "Activite" },
  { key: "cours", label: "Cours" },
  { key: "fichiers", label: "Fichiers" },
  { key: "groupes", label: "Groupes" },
];

export function ProfileTabs({ activeTab, onChange }: Props) {
  return (
    <View style={styles.root}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={({ pressed }) => [styles.item, activeTab === tab.key && styles.itemActive, pressed && styles.pressed]}
        >
          <Text style={[styles.label, activeTab === tab.key && styles.labelActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    backgroundColor: "#101014",
    borderWidth: 1,
    borderColor: "#1F1F27",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: {
    backgroundColor: "#2B2670",
  },
  label: {
    color: "#7E7E8B",
    fontSize: 12,
    fontWeight: "700",
  },
  labelActive: {
    color: "#F2F1FF",
  },
  pressed: {
    opacity: 0.85,
  },
});
