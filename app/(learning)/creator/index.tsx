import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../../../src/core/ui/AppButton";
import { useAuthStore } from "../../../state/useAuthStore";

function isCertifiedProfile(profile: Record<string, unknown> | null) {
  if (!profile) return false;
  return profile.role === "certified" || profile.account_type === "certified" || profile.is_certified === true;
}

export default function LearningCreatorHomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile) as Record<string, unknown> | null;
  const certified = isCertifiedProfile(profile);

  if (!certified) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Devenir certifie</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acces reserve aux createurs certifies</Text>
          <Text style={styles.cardText}>
            Publie tes modules, active la vente et suis tes performances apres validation.
          </Text>
          <AppButton style={styles.mainBtn} onPress={() => Alert.alert("Certification", "Demande envoyee (placeholder).")}>
            Demander certification
          </AppButton>
          <AppButton variant="secondary" onPress={() => router.push("/(learning)/catalog")}>
            Explorer le catalogue
          </AppButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Espace createur</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Creator Hub</Text>
        <Text style={styles.cardText}>Cree, publie et monetise tes modules d'apprentissage.</Text>
        <View style={styles.row}>
          <AppButton style={[styles.mainBtn, styles.flex]} onPress={() => router.push("/(learning)/creator/create")}>
            Creer un module
          </AppButton>
          <AppButton variant="secondary" style={styles.flex} onPress={() => router.push("/(learning)/creator/modules")}>
            Mes modules
          </AppButton>
        </View>
        <AppButton variant="secondary" onPress={() => router.push("/(learning)/creator/payouts")}>
          Revenus / subventions
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000", paddingTop: 58, paddingHorizontal: 16 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900" },
  card: { marginTop: 14, backgroundColor: "#111", borderColor: "#222", borderWidth: 1, borderRadius: 20, padding: 14, gap: 10 },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  cardText: { color: "#9A9A9A", lineHeight: 19 },
  mainBtn: { backgroundColor: "#FF4D5E" },
  row: { flexDirection: "row", gap: 8 },
  flex: { flex: 1 },
});
