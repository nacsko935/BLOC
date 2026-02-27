import { Pressable, StyleSheet, Text } from "react-native";

export function PlanPill({
  label,
  active,
  onPress,
  tone = "default",
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: "default" | "urgent" | "success";
}) {
  const bg = active ? "#FFFFFF" : tone === "urgent" ? "#2C1418" : tone === "success" ? "#13281B" : "#15171A";
  const borderColor = active ? "#FFFFFF" : tone === "urgent" ? "#55333A" : tone === "success" ? "#355943" : "#272A2E";
  const color = active ? "#111" : tone === "urgent" ? "#FFB6C0" : tone === "success" ? "#8EE6AE" : "#D1D4D8";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pill, { backgroundColor: bg, borderColor }, pressed && styles.pressed]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pressed: { opacity: 0.9 },
  label: { fontSize: 12, fontWeight: "700" },
});
