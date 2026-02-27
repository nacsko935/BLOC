import { ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "../../src/core/ui/Card";
import { AppButton } from "../../src/core/ui/AppButton";

export default function CreatorScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Espace createur</Text>
        <Card>
          <Text style={styles.h}>Workflow createur certifie</Text>
          <Text style={styles.t}>Creer module, lecons, quiz, review et publication.</Text>
          <AppButton style={styles.red}>Nouveau module</AppButton>
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
