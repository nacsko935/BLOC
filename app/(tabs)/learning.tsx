import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Card from "../../src/core/ui/Card";
import { AppButton } from "../../src/core/ui/AppButton";

export default function LearningTab() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Apprentissage</Text>
        <Text style={styles.subtitle}>Pole rouge: creation IA, catalogue, badges, createurs.</Text>

        <Card>
          <Text style={styles.cardTitle}>IA Studio</Text>
          <Text style={styles.cardText}>Importer, generer, editer puis sauvegarder tes contenus IA.</Text>
          <AppButton style={styles.cta} onPress={() => router.push("/learning/studio")}>
            Ouvrir le studio
          </AppButton>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Catalogue de modules</Text>
          <Text style={styles.cardText}>Explore des parcours par filiere, niveau et duree.</Text>
          <AppButton style={styles.cta} onPress={() => router.push("/learning/catalog")}>
            Voir le catalogue
          </AppButton>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Gamification</Text>
          <Text style={styles.cardText}>XP, niveaux, badges et certifications internes.</Text>
          <AppButton style={styles.cta} onPress={() => router.push("/learning/badges")}>
            Voir mes badges
          </AppButton>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Espace createur</Text>
          <Text style={styles.cardText}>Creation de modules, soumission review et publication.</Text>
          <AppButton style={styles.cta} onPress={() => router.push("/learning/creator")}>
            Espace createur
          </AppButton>
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
  cta: { marginTop: 10, backgroundColor: "#FF4D5E" },
});

