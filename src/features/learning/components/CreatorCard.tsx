import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../../core/ui/AppButton";

type Props = {
  certified: boolean;
  onCreate: () => void;
  onSecondary: () => void;
};

export function CreatorCard({ certified, onCreate, onSecondary }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="school-outline" size={18} color="#FFF" />
        <Text style={styles.title}>{certified ? "Espace createur" : "Devenir certifie"}</Text>
      </View>
      <Text style={styles.description}>
        {certified
          ? "Publie tes modules, suis tes performances et gere tes revenus."
          : "Passe la certification pour publier des modules premium sur BLOC."}
      </Text>
      <View style={styles.row}>
        <AppButton style={[styles.btn, { backgroundColor: "#FF4D5E" }]} onPress={onCreate}>
          {certified ? "Creer un module" : "Decouvrir"}
        </AppButton>
        <AppButton variant="secondary" style={styles.btn} onPress={onSecondary}>
          {certified ? "Mes ventes" : "Demander"}
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 20,
    padding: 14,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  description: { color: "#9A9A9A", marginTop: 8, lineHeight: 18 },
  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  btn: { flex: 1 },
});
