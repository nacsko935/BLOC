import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "default" | "warning" | "danger";
  onPress?: () => void;
};

export function SettingsCard({ title, subtitle, icon, tone = "default", onPress }: Props) {
  const titleColor = tone === "danger" ? "#FF6B6B" : "#F3F3F8";

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={tone === "warning" ? "#FFD56A" : tone === "danger" ? "#FF6B6B" : "#B0B0C0"} />
        </View>
        <View>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#666676" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#232329",
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#191920",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    color: "#83838F",
    marginTop: 1,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.82,
  },
});
