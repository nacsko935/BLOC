import { ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "../../src/core/ui/Card";

export default function ProgressDashboardScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dashboard progression</Text>
        <Card><Text style={styles.h}>Objectifs actifs</Text><Text style={styles.t}>3 objectifs en cours</Text></Card>
        <Card><Text style={styles.h}>Deadlines proches</Text><Text style={styles.t}>2 echeances cette semaine</Text></Card>
        <Card><Text style={styles.h}>Conseil du jour</Text><Text style={styles.t}>Lance un quiz IA pour consolider.</Text></Card>
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

