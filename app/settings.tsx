import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SettingsRow } from "../src/features/profile/components/SettingsRow";
import { useAuthStore } from "../state/useAuthStore";
import { useTheme } from "../src/core/theme/ThemeProvider";
import { seedInitialContent, seedPosts } from "../lib/dev/seed";
import { AppButton } from "../src/core/ui/AppButton";
import { optimizeLocalStorage } from "../src/core/storage/optimizer";

export default function SettingsRoute() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark, toggleTheme } = useTheme();
  const { signOut, profile, updateProfile } = useAuthStore();

  const pushEnabled      = (profile?.push_enabled ?? profile?.notification_enabled) ?? true;
  const analyticsEnabled = profile?.analytics_enabled ?? true;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const toggleRow = (label: string, sub: string, value: boolean, onChange: (v: boolean) => void) => (
    <View style={{ minHeight: 64, borderRadius: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 15 }}>{label}</Text>
        <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 3 }}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: isDark ? "#3A3A40" : "#D1D1D6", true: "#6E5CFF" }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>

        <Text style={{ color: c.textPrimary, fontSize: 30, fontWeight: "800", marginBottom: 4 }}>Paramètres</Text>

        {/* ── Thème ── */}
        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 }, pressed && { opacity: 0.85 }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={isDark ? "#A78BFA" : "#F59E0B"} />
            </View>
            <View>
              <Text style={{ color: c.textPrimary, fontSize: 15, fontWeight: "700" }}>Thème</Text>
              <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 1 }}>{isDark ? "Mode sombre activé" : "Mode clair activé"}</Text>
            </View>
          </View>
          {/* Switch visuel */}
          <View style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: isDark ? "#5B4CFF" : "#E5E7EB", justifyContent: "center", paddingHorizontal: 3 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.background, alignSelf: isDark ? "flex-end" : "flex-start" }} />
          </View>
        </Pressable>

        {/* ── Compte & préférences ── */}
        <View style={{ gap: 10 }}>
          <SettingsRow icon="person-circle-outline"    title="Compte"          subtitle="Profil, email, mot de passe" />
          {toggleRow("Notifications", "Push messages et activité groupe", pushEnabled, async (v) => {
            try { await updateProfile({ push_enabled: v, notification_enabled: v }); }
            catch (e: any) { Alert.alert("Erreur", e?.message); }
          })}
          {toggleRow("Analytics", "Autoriser la collecte d'événements produit", analyticsEnabled, async (v) => {
            try { await updateProfile({ analytics_enabled: v }); }
            catch (e: any) { Alert.alert("Erreur", e?.message); }
          })}
          <SettingsRow icon="eye-outline"              title="Confidentialité"  subtitle="Visibilité et données" />
          <SettingsRow icon="shield-checkmark-outline" title="Sécurité"         subtitle="Sessions et vérification" />
          <SettingsRow icon="language-outline"         title="Langue"           subtitle="Français" />
          <SettingsRow icon="help-circle-outline"      title="Aide"             subtitle="Support et FAQ" />
          <SettingsRow icon="document-text-outline"    title="Conditions"       subtitle="CGU et politique de confidentialité" />
        </View>

        {/* ── Outils ── */}
        <AppButton variant="secondary" onPress={async () => {
          try {
            const result = await optimizeLocalStorage({ force: true });
            if (result.skipped) { Alert.alert("Stockage", "Optimisation déjà récente."); return; }
            Alert.alert("Stockage optimisé", `Commentaires nettoyés: ${result.deletedOldComments}\nMeta nettoyées: ${result.deletedOrphanMeta}`);
          } catch (e: any) { Alert.alert("Erreur", e?.message); }
        }}>
          Optimiser stockage local
        </AppButton>

        {__DEV__ && (
          <View style={{ gap: 8 }}>
            <AppButton variant="secondary" onPress={async () => {
              try { const n = await seedPosts(10); Alert.alert("Seed OK", `${n} posts insérés.`); }
              catch (e: any) { Alert.alert("Erreur", e?.message); }
            }}>Seed posts (DEV)</AppButton>
            <AppButton variant="secondary" onPress={async () => {
              try { const r = await seedInitialContent(); Alert.alert("Seed V1", `${r.posts} posts, ${r.groups} groupes.`); }
              catch (e: any) { Alert.alert("Erreur", e?.message); }
            }}>Générer contenu test</AppButton>
            <AppButton variant="secondary" onPress={() => router.push("/debug-tools")}>Debug tools</AppButton>
          </View>
        )}

        <SettingsRow icon="log-out-outline" title="Déconnexion" subtitle="Quitter la session" tone="danger" onPress={handleSignOut} />
      </ScrollView>
    </View>
  );
}
