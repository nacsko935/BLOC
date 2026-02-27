import { Pressable, StyleSheet, Text } from "react-native";

export function PrimaryPillButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  pressed: { opacity: 0.92 },
  label: { color: "#101114", fontSize: 12, fontWeight: "800" },
});
