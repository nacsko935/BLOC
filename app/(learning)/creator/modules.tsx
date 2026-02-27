import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../../../src/core/ui/AppButton";
import { listModules } from "../../../src/features/learning/services";
import { LearningModule } from "../../../src/features/learning/types";
import { useAuthStore } from "../../../state/useAuthStore";

function isCertifiedProfile(profile: Record<string, unknown> | null) {
  if (!profile) return false;
  return profile.role === "certified" || profile.account_type === "certified" || profile.is_certified === true;
}

export default function LearningCreatorModulesScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile) as Record<string, unknown> | null;
  const certified = isCertifiedProfile(profile);
  const [modules, setModules] = useState<LearningModule[]>([]);

  useEffect(() => {
    listModules().then((rows) => setModules(rows.filter((m) => m.certified))).catch(() => setModules([]));
  }, []);

  if (!certified) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Acces reserve</Text>
        <Text style={styles.subtitle}>Cette section est reservee aux createurs certifies.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mes modules</Text>
      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.ratingAvg.toFixed(1)} / 5 - {item.ratingCount} avis
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aucun module publie</Text>
            <Text style={styles.cardMeta}>Commence par creer ton premier module.</Text>
            <AppButton style={{ marginTop: 10, backgroundColor: "#FF4D5E" }} onPress={() => router.push("/(learning)/creator/create")}>
              Creer
            </AppButton>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000", paddingTop: 58, paddingHorizontal: 16 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900" },
  subtitle: { color: "#9A9A9A", marginTop: 6 },
  card: { backgroundColor: "#111", borderColor: "#222", borderWidth: 1, borderRadius: 18, padding: 12, marginBottom: 10 },
  cardTitle: { color: "#FFF", fontWeight: "800" },
  cardMeta: { color: "#A9A9A9", marginTop: 6, fontSize: 12 },
});
