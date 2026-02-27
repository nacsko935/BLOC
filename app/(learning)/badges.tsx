import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBadges } from "../../src/features/learning/services";
import { Badge } from "../../src/features/learning/types";

export default function LearningBadgesScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    getBadges().then(setBadges).catch(() => setBadges([]));
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Badges & XP</Text>
      <Text style={styles.subtitle}>Debloque des badges en terminant lecons et quiz</Text>
      <FlatList
        data={badges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const unlocked = Boolean(item.unlocked);
          return (
            <View style={styles.card}>
              <Ionicons name={(item.icon as keyof typeof Ionicons.glyphMap) || "ribbon-outline"} size={20} color={unlocked ? "#8AE39F" : "#D1D1D1"} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
              </View>
              <Text style={[styles.status, unlocked && styles.statusUnlocked]}>{unlocked ? "Debloque" : "Verrouille"}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000", paddingTop: 58, paddingHorizontal: 16 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900" },
  subtitle: { color: "#9A9A9A", marginTop: 4 },
  card: {
    backgroundColor: "#111",
    borderColor: "#222",
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { color: "#FFF", fontWeight: "800" },
  cardDesc: { color: "#9A9A9A", marginTop: 4, fontSize: 12 },
  status: { color: "#A9A9A9", fontSize: 11, fontWeight: "700" },
  statusUnlocked: { color: "#8AE39F" },
});
