import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SettingsRow } from "../src/features/profile/components/SettingsRow";
import { useAuthStore } from "../state/useAuthStore";
import { seedInitialContent, seedPosts } from "../lib/dev/seed";
import { AppButton } from "../src/core/ui/AppButton";
import { optimizeLocalStorage } from "../src/core/storage/optimizer";

export default function SettingsRoute() {
  const router = useRouter();
  const { signOut, profile, updateProfile } = useAuthStore();

  const pushEnabled = (profile?.push_enabled ?? profile?.notification_enabled) ?? true;
  const analyticsEnabled = profile?.analytics_enabled ?? true;

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

  const handleSeedInitial = async () => {
    try {
      const result = await seedInitialContent();
      Alert.alert("Seed V1", `${result.posts} posts, ${result.groups} groupes, ${result.profiles} profils demos.`);
    } catch (error: any) {
      Alert.alert("Seed erreur", error?.message || "Impossible de seed");
    }
  };

  const handleOptimizeStorage = async () => {
    try {
      const result = await optimizeLocalStorage({ force: true });
      if (result.skipped) {
        Alert.alert("Stockage", "Optimisation deja recente.");
        return;
      }
      Alert.alert(
        "Stockage optimise",
        `Commentaires nettoyes: ${result.deletedOldComments}\nMeta nettoyees: ${result.deletedOrphanMeta}`
      );
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible d'optimiser le stockage");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Parametres</Text>

        <View style={styles.group}>
          <SettingsRow icon="person-circle-outline" title="Compte" subtitle="Profil, email, mot de passe" />
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Notifications</Text>
              <Text style={styles.toggleSubtitle}>Push messages et activite groupe</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={async (value) => {
                try {
                  await updateProfile({ push_enabled: value, notification_enabled: value });
                } catch (error: any) {
                  Alert.alert("Erreur", error?.message || "Impossible de mettre a jour");
                }
              }}
              trackColor={{ false: "#3A3A40", true: "#6E5CFF" }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Analytics</Text>
              <Text style={styles.toggleSubtitle}>Autoriser la collecte d'evenements produit</Text>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={async (value) => {
                try {
                  await updateProfile({ analytics_enabled: value });
                } catch (error: any) {
                  Alert.alert("Erreur", error?.message || "Impossible de mettre a jour");
                }
              }}
              trackColor={{ false: "#3A3A40", true: "#6E5CFF" }}
              thumbColor="#fff"
            />
          </View>
          <SettingsRow icon="eye-outline" title="Confidentialite" subtitle="Visibilite et donnees" />
          <SettingsRow icon="shield-checkmark-outline" title="Securite" subtitle="Sessions et verification" />
          <SettingsRow icon="language-outline" title="Langue" subtitle="Francais" />
          <SettingsRow icon="color-palette-outline" title="Apparence" subtitle="Theme sombre" />
          <SettingsRow icon="help-circle-outline" title="Aide" subtitle="Support et FAQ" />
          <SettingsRow icon="document-text-outline" title="Conditions" subtitle="CGU et politique" />
        </View>

        <View style={{ gap: 8 }}>
          <AppButton variant="secondary" style={styles.seedButton} onPress={handleOptimizeStorage}>
            Optimiser stockage local
          </AppButton>
        </View>

        {__DEV__ ? (
          <View style={{ gap: 8 }}>
            <AppButton variant="secondary" style={styles.seedButton} onPress={handleSeed}>
              Seed posts (DEV)
            </AppButton>
            <AppButton variant="secondary" style={styles.seedButton} onPress={handleSeedInitial}>
              Generer contenu test
            </AppButton>
            <AppButton variant="secondary" style={styles.seedButton} onPress={() => router.push("/debug-tools") }>
              Debug tools
            </AppButton>
          </View>
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
  screen: { flex: 1, backgroundColor: "#000000" },
  content: { paddingTop: 56, paddingHorizontal: 14, paddingBottom: 30, gap: 14 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "800" },
  group: { gap: 10 },
  toggleRow: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#202028",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  toggleSubtitle: { color: "#8B8B95", fontSize: 12, marginTop: 3 },
  seedButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1A1A1F",
    borderWidth: 1,
    borderColor: "#32323A",
    alignItems: "center",
    justifyContent: "center",
  },
  seedButtonText: { color: "#FFFFFF", fontWeight: "700" },
  logoutWrap: { marginTop: 6 },
});
