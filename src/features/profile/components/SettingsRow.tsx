import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  tone?: "default" | "danger";
  onPress?: () => void;
};

export function SettingsRow({ icon, title, subtitle, tone = "default", onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={tone === "danger" ? "#FF6B6B" : "#C2C2CF"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, tone === "danger" && styles.titleDanger]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6F6F7D" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#24242C",
    backgroundColor: "#111111",
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
    backgroundColor: "#1A1A20",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#F2F2F6",
    fontSize: 15,
    fontWeight: "700",
  },
  titleDanger: {
    color: "#FF7D7D",
  },
  subtitle: {
    color: "#868693",
    fontSize: 12,
    marginTop: 1,
  },
  pressed: {
    opacity: 0.84,
  },
});
