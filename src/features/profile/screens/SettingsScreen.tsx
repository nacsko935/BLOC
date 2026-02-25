import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SettingsCard } from "../components/SettingsCard";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Parametres</Text>
          <Ionicons name="options-outline" size={22} color="#D6D6DD" />
        </View>

        <View style={styles.subscriptionCard}>
          <View>
            <Text style={styles.subscriptionTitle}>Abonnement Premium</Text>
            <Text style={styles.subscriptionSubtitle}>Debloque l'IA, stockage et analytics avances.</Text>
          </View>
          <Text style={styles.subscriptionAction}>Voir</Text>
        </View>

        <View style={styles.group}>
          <SettingsCard title="Compte" subtitle="Profil, email, mot de passe" icon="person-circle-outline" />
          <SettingsCard title="Notifications" subtitle="Push et emails" icon="notifications-outline" />
          <SettingsCard title="Confidentialite" subtitle="Visibilite et donnees" icon="eye-outline" />
          <SettingsCard title="Securite" subtitle="Sessions et verification" icon="shield-checkmark-outline" />
          <SettingsCard title="Langue" subtitle="Francais" icon="language-outline" />
          <SettingsCard title="Apparence" subtitle="Theme sombre" icon="color-palette-outline" />
          <SettingsCard title="Aide" subtitle="Support et FAQ" icon="help-circle-outline" />
          <SettingsCard title="Conditions" subtitle="CGU et politique de confidentialite" icon="document-text-outline" />
          <SettingsCard
            title="Deconnexion"
            subtitle="Se deconnecter de l'application"
            icon="log-out-outline"
            tone="danger"
            onPress={() => router.replace("/(auth)/login")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 14,
    paddingBottom: 30,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  subscriptionCard: {
    backgroundColor: "#D8A938",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subscriptionTitle: {
    color: "#2B1D00",
    fontWeight: "800",
    fontSize: 16,
  },
  subscriptionSubtitle: {
    color: "#4B3400",
    marginTop: 4,
    maxWidth: 250,
    fontSize: 13,
  },
  subscriptionAction: {
    color: "#2B1D00",
    fontWeight: "900",
    fontSize: 14,
  },
  group: {
    gap: 10,
  },
});
