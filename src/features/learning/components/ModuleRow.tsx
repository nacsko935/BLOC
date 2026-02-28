import { Pressable, StyleSheet, Text, View } from "react-native";
import { Module } from "../types";
import { PillButton } from "./PillButton";
import { ProgressBar } from "./ProgressBar";

type Props = {
  module: Module;
  rightLabel?: string;
  onPress?: () => void;
  onPressRight?: () => void;
  progress?: number;
  subtitleOverride?: string;
};

export function ModuleRow({ module, rightLabel, onPress, onPressRight, progress, subtitleOverride }: Props) {
  const priceLabel = module.isFree ? "Gratuit" : "Premium";
  const levelLabel = module.level === "debutant" ? "Debutant" : module.level === "intermediaire" ? "Intermediaire" : "Avance";
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.cover} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {module.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitleOverride ?? `${module.authorName} • ${Math.max(1, Math.round(module.durationMinutes / 60))}h • ${levelLabel}`}
        </Text>
        {typeof progress === "number" ? (
          <View style={{ marginTop: 8 }}>
            <ProgressBar value={progress} />
          </View>
        ) : null}
      </View>
      <View style={styles.right}>
        <PillButton label={rightLabel ?? priceLabel} onPress={onPressRight} tone={module.isFree ? "dark" : "accent"} />
        {module.certified ? <Text style={styles.certified}>Certifie</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#000000",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242527",
    padding: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  pressed: { opacity: 0.92 },
  cover: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#232428",
  },
  body: { flex: 1 },
  title: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  subtitle: { color: "#9FA1A6", fontSize: 12, marginTop: 4 },
  right: { alignItems: "flex-end", gap: 7 },
  certified: { color: "#8FB5FF", fontSize: 11, fontWeight: "700" },
});
