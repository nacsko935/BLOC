import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SettingsRow } from "../src/features/profile/components/SettingsRow";
import { useAuthStore } from "../state/useAuthStore";
import { seedPosts } from "../lib/dev/seed";

export default function SettingsRoute() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const handleSeed = async () => {
    try {
      const count = await seedPosts(10);
      Alert.alert("Seed OK", `${count} posts de test inseres.`);
    } catch (error: any) {
      Alert.alert("Seed erreur", error?.message || "Impossible de seed");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Parametres</Text>

        <View style={styles.group}>
          <SettingsRow icon="person-circle-outline" title="Compte" subtitle="Profil, email, mot de passe" />
          <SettingsRow icon="notifications-outline" title="Notifications" subtitle="Push et emails" />
          <SettingsRow icon="eye-outline" title="Confidentialite" subtitle="Visibilite et donnees" />
          <SettingsRow icon="shield-checkmark-outline" title="Securite" subtitle="Sessions et verification" />
          <SettingsRow icon="language-outline" title="Langue" subtitle="Francais" />
          <SettingsRow icon="color-palette-outline" title="Apparence" subtitle="Theme sombre" />
          <SettingsRow icon="help-circle-outline" title="Aide" subtitle="Support et FAQ" />
          <SettingsRow icon="document-text-outline" title="Conditions" subtitle="CGU et politique" />
        </View>

        {__DEV__ ? (
          <Pressable style={styles.seedButton} onPress={handleSeed}>
            <Text style={styles.seedButtonText}>Seed posts (DEV)</Text>
          </Pressable>
        ) : null}

        <View style={styles.logoutWrap}>
          <SettingsRow
            icon="log-out-outline"
            title="Deconnexion"
            subtitle="Quitter la session"
            tone="danger"
            onPress={handleSignOut}
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
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  group: {
    gap: 10,
  },
  seedButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1A1A1F",
    borderWidth: 1,
    borderColor: "#32323A",
    alignItems: "center",
    justifyContent: "center",
  },
  seedButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  logoutWrap: {
    marginTop: 6,
  },
});