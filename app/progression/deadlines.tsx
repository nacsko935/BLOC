import { ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "../../src/core/ui/Card";
import { AppButton } from "../../src/core/ui/AppButton";

export default function DeadlinesScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Deadlines</Text>
        <Card><Text style={styles.h}>Partiel reseaux</Text><Text style={styles.t}>Urgent â€¢ dans 3 jours</Text></Card>
        <Card><Text style={styles.h}>Projet dev mobile</Text><Text style={styles.t}>Important â€¢ dans 7 jours</Text></Card>
        <AppButton style={styles.green}>Ajouter deadline</AppButton>
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
