import { ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "../../src/core/ui/Card";

export default function ProjectsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Projets</Text>
        <Card><Text style={styles.h}>Projet API Node</Text><Text style={styles.t}>4 membres • 7 taches ouvertes</Text></Card>
        <Card><Text style={styles.h}>Groupe revisions reseaux</Text><Text style={styles.t}>3 membres • prochaine session demain</Text></Card>
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
});

