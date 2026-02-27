import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Shortcut = {
  id: string;
  label: string;
  onPress: () => void;
};

type Props = {
  shortcuts: Shortcut[];
};

export function CollapsibleShortcutsCard({ shortcuts }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.title}>Raccourcis</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#C4CBD5" />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          {shortcuts.map((shortcut) => (
            <Pressable key={shortcut.id} style={styles.row} onPress={shortcut.onPress}>
              <Text style={styles.rowLabel}>{shortcut.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#101215",
    borderWidth: 1,
    borderColor: "#25282D",
    borderRadius: 18,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  body: { paddingHorizontal: 13, paddingBottom: 10, gap: 8 },
  row: { paddingVertical: 7 },
  rowLabel: { color: "#C6CDD8", fontSize: 13 },
});
