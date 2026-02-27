import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Card from "../../src/core/ui/Card";
import { AppButton } from "../../src/core/ui/AppButton";

export default function ProgressionTab() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progression</Text>
        <Text style={styles.subtitle}>Pole vert: objectifs, deadlines, conseils, bibliotheque, projets.</Text>

        <Card>
          <Text style={styles.cardTitle}>Dashboard progression</Text>
          <Text style={styles.cardText}>Vue globale: objectifs, streak, priorites et prochaines actions.</Text>
          <AppButton style={styles.cta} onPress={() => router.push("/progression/dashboard")}>
            Ouvrir dashboard
          </AppButton>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Objectifs & deadlines</Text>
          <Text style={styles.cardText}>Planifie tes revisions et dates de rendu.</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <AppButton style={[styles.cta, { flex: 1 }]} onPress={() => router.push("/progression/goals")}>
              Objectifs
            </AppButton>
            <AppButton style={[styles.cta, { flex: 1 }]} onPress={() => router.push("/progression/deadlines")}>
              Deadlines
            </AppButton>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Bibliotheque & Projets</Text>
          <Text style={styles.cardText}>Retrouve tes contenus sauvegardes et projets de groupe.</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <AppButton style={[styles.cta, { flex: 1 }]} onPress={() => router.push("/progression/library")}>
              Bibliotheque
            </AppButton>
            <AppButton style={[styles.cta, { flex: 1 }]} onPress={() => router.push("/progression/projects")}>
              Projets
            </AppButton>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  title: { color: "#fff", fontSize: 30, fontWeight: "800" },
  subtitle: { color: "#9A9A9A", marginBottom: 4 },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  cardText: { color: "#9A9A9A", marginTop: 6 },
  cta: { marginTop: 10, backgroundColor: "#1DB954" },
});

