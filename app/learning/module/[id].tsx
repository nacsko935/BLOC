import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Card from "../../../src/core/ui/Card";
import { AppButton } from "../../../src/core/ui/AppButton";

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Module {id}</Text>
        <Card>
          <Text style={styles.h}>Objectifs pedagogiques</Text>
          <Text style={styles.t}>Comprendre les fondamentaux et appliquer sur des exercices guides.</Text>
        </Card>
        <Card>
          <Text style={styles.h}>Programme</Text>
          <Text style={styles.t}>Lecon 1 â€¢ Lecon 2 â€¢ Quiz final â€¢ Ressources</Text>
          <AppButton style={styles.red} onPress={() => router.push({ pathname: "/learning/lesson/[id]", params: { id: "lesson-1" } })}>
            Demarrer module
          </AppButton>
        </Card>
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
  red: { marginTop: 10, backgroundColor: "#FF4D5E" },
});
