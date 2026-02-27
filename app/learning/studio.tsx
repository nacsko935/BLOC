import { ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "../../src/core/ui/Card";
import { AppButton } from "../../src/core/ui/AppButton";

export default function LearningStudioScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>IA Studio</Text>
        <Card>
          <Text style={styles.step}>1. Importer source</Text>
          <Text style={styles.text}>PDF, notes ou texte brut.</Text>
          <AppButton style={styles.cta}>Importer</AppButton>
        </Card>
        <Card>
          <Text style={styles.step}>2. Choisir format</Text>
          <Text style={styles.text}>Resume, flashcards, QCM, plan de cours.</Text>
          <AppButton style={styles.cta}>Choisir format</AppButton>
        </Card>
        <Card>
          <Text style={styles.step}>3. Generer et editer</Text>
          <Text style={styles.text}>Ajuster le contenu avant sauvegarde.</Text>
          <AppButton style={styles.cta}>Generer</AppButton>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52 },
  step: { color: "#fff", fontSize: 16, fontWeight: "800" },
  text: { color: "#9A9A9A", marginTop: 4 },
  cta: { marginTop: 10, backgroundColor: "#FF4D5E" },
});

