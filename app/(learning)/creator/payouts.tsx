import { StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../../state/useAuthStore";

function isCertifiedProfile(profile: Record<string, unknown> | null) {
  if (!profile) return false;
  return profile.role === "certified" || profile.account_type === "certified" || profile.is_certified === true;
}

export default function LearningCreatorPayoutsScreen() {
  const profile = useAuthStore((s) => s.profile) as Record<string, unknown> | null;
  const certified = isCertifiedProfile(profile);

  if (!certified) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Acces reserve</Text>
        <Text style={styles.subtitle}>Active la certification createur pour debloquer les revenus.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Revenus & subventions</Text>
      <View style={styles.card}>
        <Text style={styles.metric}>1 240 EUR</Text>
        <Text style={styles.caption}>Gains cumulés (mock)</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.metric}>320 EUR</Text>
        <Text style={styles.caption}>Disponible au payout (mock)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000", paddingTop: 58, paddingHorizontal: 16 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900", marginBottom: 12 },
  subtitle: { color: "#9A9A9A", marginTop: 6 },
  card: { backgroundColor: "#111", borderColor: "#222", borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10 },
  metric: { color: "#FFF", fontSize: 26, fontWeight: "900" },
  caption: { color: "#A9A9A9", marginTop: 4 },
});
