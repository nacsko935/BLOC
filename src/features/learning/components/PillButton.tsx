import { Pressable, StyleSheet, Text } from "react-native";


type Props = {
  label: string;
  onPress?: () => void;
  tone?: "dark" | "light" | "accent";
};

export function PillButton({ label, onPress, tone = "dark" }: Props) {
  const toneStyle = tone === "light" ? styles.light : tone === "accent" ? styles.accent : styles.dark;
  const textStyle = tone === "light" ? styles.lightText : tone === "accent" ? styles.accentText : styles.darkText;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.base, toneStyle, pressed && styles.pressed]}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  pressed: { opacity: 0.9 },
  dark: { backgroundColor: "#171819", borderColor: "#252627" },
  light: { backgroundColor: "#000000", borderColor: "#FFFFFF" },
  accent: { backgroundColor: "#2A1115", borderColor: "#533239" },
  text: { fontWeight: "700", fontSize: 12 },
  darkText: { color: "#E8E8E8" },
  lightText: { color: "#111111" },
  accentText: { color: "#FFB5BE" },
});
