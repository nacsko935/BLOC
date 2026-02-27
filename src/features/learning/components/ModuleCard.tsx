import { Pressable, StyleSheet, Text, View } from "react-native";
import { LearningModule } from "../types";

type Props = {
  module: LearningModule;
  onPress: () => void;
};

function levelLabel(level: LearningModule["level"]) {
  if (level === "debutant") return "Debutant";
  if (level === "intermediaire") return "Intermediaire";
  return "Avance";
}

export function ModuleCard({ module, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.title} numberOfLines={1}>
        {module.title}
      </Text>
      <Text style={styles.desc} numberOfLines={2}>
        {module.subtitle}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{levelLabel(module.level)}</Text>
        <Text style={styles.meta}>{Math.round(module.durationMinutes / 60)}h</Text>
        <Text style={styles.meta}>
          {module.ratingAvg.toFixed(1)} ({module.ratingCount})
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 20,
    padding: 14,
    marginRight: 10,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  title: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  desc: { color: "#9A9A9A", fontSize: 13, marginTop: 6, lineHeight: 18 },
  metaRow: { marginTop: 10, flexDirection: "row", gap: 10 },
  meta: { color: "#D6D6D6", fontSize: 12, fontWeight: "700" },
});
