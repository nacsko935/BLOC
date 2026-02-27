import { ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "../../src/core/ui/Card";

const badges = ["Web Basics", "IA Starter", "Secu 101", "Streak 7 jours"];

export default function BadgesScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Badges & XP</Text>
        <Card>
          <Text style={styles.h}>Niveau 5 • 1280 XP</Text>
          <Text style={styles.t}>Streak actuel: 4 jours</Text>
        </Card>
        {badges.map((b) => (
          <Card key={b}><Text style={styles.h}>{b}</Text><Text style={styles.t}>Debloque</Text></Card>
        ))}
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
