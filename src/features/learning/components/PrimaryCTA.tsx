import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: "red" | "neutral";
};

export function PrimaryCTA({ title, subtitle, icon, onPress, tone = "red" }: Props) {
  const bg = tone === "red" ? "#FF4D5E" : "#151515";
  const border = tone === "red" ? "#FF6A79" : "#262626";
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.cta, { backgroundColor: bg, borderColor: border }, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cta: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#FFF", fontSize: 17, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.85)", marginTop: 2, fontSize: 13 },
});
