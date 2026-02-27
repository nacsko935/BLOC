import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Badge } from "../types";

type Props = {
  badge: Badge;
};

export function BadgeTeaserCard({ badge }: Props) {
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <View style={styles.row}>
        <Ionicons name={(badge.icon as keyof typeof Ionicons.glyphMap) || "ribbon-outline"} size={18} color="#D9D9D9" />
        <Ionicons name="lock-closed-outline" size={14} color="#9A9A9A" />
      </View>
      <Text style={styles.title}>{badge.name}</Text>
      <Text style={styles.desc} numberOfLines={2}>
        {badge.description}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#FFF", marginTop: 10, fontWeight: "800", fontSize: 14 },
  desc: { color: "#9A9A9A", marginTop: 5, fontSize: 12, lineHeight: 16 },
});
