import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ToolPreset } from "../types";

type Props = {
  tool: ToolPreset;
  onPress: () => void;
};

export function ToolIcon({ tool, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.circle}>
        <Ionicons name={(tool.icon as keyof typeof Ionicons.glyphMap) ?? "apps-outline"} size={22} color="#FFFFFF" />
        {tool.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tool.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {tool.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "24%", alignItems: "center", marginBottom: 14 },
  pressed: { opacity: 0.9 },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#191A1C",
    borderWidth: 1,
    borderColor: "#2A2B2E",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#FF4D5E",
  },
  badgeText: { color: "#FFF", fontWeight: "800", fontSize: 9 },
  label: { color: "#D2D2D2", marginTop: 8, fontSize: 11, textAlign: "center" },
});
