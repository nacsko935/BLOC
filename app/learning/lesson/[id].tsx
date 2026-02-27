import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Card from "../../../src/core/ui/Card";
import { AppButton } from "../../../src/core/ui/AppButton";

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lecon {id}</Text>
        <Card>
          <Text style={styles.h}>Player lecon</Text>
          <Text style={styles.t}>Contenu de la lecon, ressources et checkpoints.</Text>
          <AppButton style={styles.red} onPress={() => router.push({ pathname: "/learning/quiz/[id]", params: { id: "quiz-1" } })}>
            Passer au quiz
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
