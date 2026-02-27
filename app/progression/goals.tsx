import { ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "../../src/core/ui/Card";
import { AppButton } from "../../src/core/ui/AppButton";

export default function GoalsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Objectifs</Text>
        <Card>
          <Text style={styles.h}>Finir chapitre 3 IA</Text>
          <Text style={styles.t}>62% complete â€¢ streak 4 jours</Text>
        </Card>
        <AppButton style={styles.green}>Ajouter objectif</AppButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52 },
  h: { color: "#fff", fontSize: 16, fontWeight: "800" },
  t: { color: "#9A9A9A", marginTop: 4 },
  green: { backgroundColor: "#1DB954" },
});
