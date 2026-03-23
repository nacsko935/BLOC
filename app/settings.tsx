import { useState } from "react";
import {
  Alert, Linking, Modal, Pressable, ScrollView,
  Switch, Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/useAuthStore";
import { useTheme } from "../src/core/theme/ThemeProvider";
import { optimizeLocalStorage } from "../src/core/storage/optimizer";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Composants internes ───────────────────────────────────────────────────────

function Section({ title }: { title: string }) {
  return (
    <Text style={{ color: "#7B6CFF", fontSize: 12, fontWeight: "800",
      textTransform: "uppercase", letterSpacing: 1.2, marginTop: 8, marginBottom: 4, paddingHorizontal: 4 }}>
      {title}
    </Text>
  );
}

function Row({
  icon, iconColor = "#9A9AA6", title, subtitle, right, onPress, danger = false, disabled = false,
}: {
  icon: string; iconColor?: string; title: string; subtitle?: string;
  right?: React.ReactNode; onPress?: () => void; danger?: boolean; disabled?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: c.card, borderRadius: 14, borderWidth: 1,
        borderColor: c.border, paddingHorizontal: 14, paddingVertical: 13,
        opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
      }]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10,
        backgroundColor: (danger ? "#FF3B30" : iconColor) + "18",
        alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon as any} size={18} color={danger ? "#FF3B30" : iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? "#FF3B30" : c.textPrimary, fontSize: 15, fontWeight: "700" }}>{title}</Text>
        {subtitle ? <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />}
    </Pressable>
  );
}

// ── Écran paramètres ─────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark, toggleTheme } = useTheme();
  const { signOut, profile, updateProfile, user } = useAuthStore();

  const pushEnabled      = (profile?.push_enabled ?? profile?.notification_enabled) ?? true;
  const analyticsEnabled = profile?.analytics_enabled ?? true;

  // Modal changement de mot de passe
  const [pwdModal, setPwdModal]     = useState(false);
  const [newPwd,   setNewPwd]       = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Modal suppression compte
  const [deleteModal, setDeleteModal] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Déconnexion", "Tu vas être déconnecté.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion", style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleChangePwd = async () => {
    if (newPwd.length < 8) { Alert.alert("Trop court", "Le mot de passe doit faire au moins 8 caractères."); return; }
    if (newPwd !== confirmPwd) { Alert.alert("Erreur", "Les mots de passe ne correspondent pas."); return; }
    setPwdLoading(true);
    try {
      const { getSupabaseOrThrow } = await import("../lib/supabase");
      const sb = getSupabaseOrThrow();
      const { error } = await sb.auth.updateUser({ password: newPwd });
      if (error) throw error;
      Alert.alert("✅ Mot de passe changé", "Ton mot de passe a été mis à jour.");
      setPwdModal(false); setNewPwd(""); setConfirmPwd("");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de changer le mot de passe.");
    } finally { setPwdLoading(false); }
  };

  const handleClearCache = async () => {
    Alert.alert("Vider le cache", "Les données locales seront effacées (tes cours et projets resteront).", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Vider", style: "destructive",
        onPress: async () => {
          try {
            await optimizeLocalStorage({ force: true });
            Alert.alert("✅ Cache vidé", "Stockage local optimisé.");
          } catch { Alert.alert("Erreur", "Impossible de vider le cache."); }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert("⚠️ Supprimer le compte", "Cette action est irréversible. Toutes tes données seront supprimées.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer définitivement", style: "destructive",
        onPress: async () => {
          try {
            const { getSupabaseOrThrow } = await import("../lib/supabase");
            const sb = getSupabaseOrThrow();
            await sb.from("profiles").delete().eq("id", user?.id ?? "");
            await signOut();
            router.replace("/(auth)/login");
          } catch (e: any) {
            Alert.alert("Erreur", e?.message || "Impossible de supprimer le compte.");
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 60, gap: 6 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <Text style={{ color: c.textPrimary, fontSize: 30, fontWeight: "900", marginBottom: 10 }}>Paramètres</Text>

        {/* ── Apparence ── */}
        <Section title="Apparence" />
        <Row
          icon={isDark ? "moon" : "sunny-outline"}
          iconColor={isDark ? "#A78BFA" : "#F59E0B"}
          title="Thème"
          subtitle={isDark ? "Mode sombre activé" : "Mode clair activé"}
          onPress={toggleTheme}
          right={
            <View style={{ width: 46, height: 26, borderRadius: 13,
              backgroundColor: isDark ? "#7B6CFF" : "#E5E7EB",
              justifyContent: "center", paddingHorizontal: 3 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10,
                backgroundColor: "#fff", alignSelf: isDark ? "flex-end" : "flex-start" }} />
            </View>
          }
        />

        {/* ── Compte ── */}
        <Section title="Compte" />
        <Row
          icon="person-outline" iconColor="#4DA3FF"
          title="Modifier le profil"
          subtitle="Nom, bio, filière, avatar"
          onPress={() => router.push("/(modals)/edit-profile")}
        />
        <Row
          icon="mail-outline" iconColor="#34C759"
          title="Email"
          subtitle={user?.email ?? "Non connecté"}
          onPress={() => Alert.alert("Email", `Connecté avec : ${user?.email}`)}
          right={<View />}
        />
        <Row
          icon="lock-closed-outline" iconColor="#FF9500"
          title="Changer le mot de passe"
          subtitle="Modifier ton mot de passe"
          onPress={() => setPwdModal(true)}
        />
        <Row
          icon="school-outline" iconColor="#AF52DE"
          title="Lier une école"
          subtitle="Code établissement"
          onPress={() => router.push("/(modals)/link-school")}
        />

        {/* ── Notifications ── */}
        <Section title="Notifications" />
        <Row
          icon="notifications-outline" iconColor="#FF6B6B"
          title="Notifications push"
          subtitle="Messages, activité et rappels"
          onPress={() => updateProfile({ push_enabled: !pushEnabled, notification_enabled: !pushEnabled }).catch(() => null)}
          right={
            <Switch
              value={pushEnabled}
              onValueChange={async (v) => {
                try { await updateProfile({ push_enabled: v, notification_enabled: v }); }
                catch (e: any) { Alert.alert("Erreur", e?.message); }
              }}
              trackColor={{ false: isDark ? "#3A3A40" : "#D1D1D6", true: "#7B6CFF" }}
              thumbColor="#fff"
            />
          }
        />

        {/* ── Confidentialité ── */}
        <Section title="Confidentialité & données" />
        <Row
          icon="analytics-outline" iconColor="#00C7BE"
          title="Analytics"
          subtitle="Collecte d'événements anonymes"
          right={
            <Switch
              value={analyticsEnabled}
              onValueChange={async (v) => {
                try { await updateProfile({ analytics_enabled: v }); }
                catch (e: any) { Alert.alert("Erreur", e?.message); }
              }}
              trackColor={{ false: isDark ? "#3A3A40" : "#D1D1D6", true: "#7B6CFF" }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="eye-off-outline" iconColor="#9A9AA6"
          title="Confidentialité du profil"
          subtitle="Qui peut voir ton profil"
          onPress={() => Alert.alert("Confidentialité", "Ton profil est visible par les utilisateurs de ta filière.")}
        />
        <Row
          icon="trash-outline" iconColor="#FF9500"
          title="Vider le cache"
          subtitle="Libérer l'espace de stockage local"
          onPress={handleClearCache}
        />

        {/* ── Aide ── */}
        <Section title="Aide & informations" />
        <Row
          icon="help-circle-outline" iconColor="#4DA3FF"
          title="Centre d'aide"
          subtitle="FAQ et support"
          onPress={() => Linking.openURL("https://blocapp.fr/aide").catch(() => null)}
        />
        <Row
          icon="document-text-outline" iconColor="#9A9AA6"
          title="Conditions d'utilisation"
          subtitle="CGU et politique de confidentialité"
          onPress={() => Linking.openURL("https://blocapp.fr/cgu").catch(() => null)}
        />
        <Row
          icon="information-circle-outline" iconColor="#9A9AA6"
          title="Version"
          subtitle="BLOC 1.0.0 — SDK 55"
          right={<View />}
        />

        {/* ── Danger zone ── */}
        <Section title="Zone dangereuse" />
        <Row
          icon="log-out-outline"
          title="Déconnexion"
          subtitle="Quitter la session"
          danger
          onPress={handleSignOut}
        />
        <Row
          icon="person-remove-outline"
          title="Supprimer le compte"
          subtitle="Action irréversible"
          danger
          onPress={handleDeleteAccount}
        />

      </ScrollView>

      {/* ── Modal changement mot de passe ── */}
      <Modal visible={pwdModal} transparent animationType="slide" onRequestClose={() => setPwdModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <Pressable style={{ position: "absolute", inset: 0 } as any} onPress={() => setPwdModal(false)} />
          <View style={{ backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            borderWidth: 1, borderColor: c.border, padding: 24, paddingBottom: 40, gap: 14 }}>
            <Text style={{ color: c.textPrimary, fontSize: 20, fontWeight: "900" }}>Changer le mot de passe</Text>
            <TextInput
              value={newPwd} onChangeText={setNewPwd}
              placeholder="Nouveau mot de passe" placeholderTextColor={c.textSecondary}
              secureTextEntry autoCapitalize="none"
              style={{ backgroundColor: c.cardAlt, borderWidth: 1, borderColor: c.border, borderRadius: 14,
                color: c.textPrimary, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
            />
            <TextInput
              value={confirmPwd} onChangeText={setConfirmPwd}
              placeholder="Confirmer le mot de passe" placeholderTextColor={c.textSecondary}
              secureTextEntry autoCapitalize="none"
              style={{ backgroundColor: c.cardAlt, borderWidth: 1, borderColor: c.border, borderRadius: 14,
                color: c.textPrimary, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => setPwdModal(false)}
                style={{ flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: c.border,
                  alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: c.textSecondary, fontWeight: "700" }}>Annuler</Text>
              </Pressable>
              <Pressable onPress={handleChangePwd} disabled={pwdLoading}
                style={{ flex: 2, height: 48, borderRadius: 14, backgroundColor: "#7B6CFF",
                  alignItems: "center", justifyContent: "center", opacity: pwdLoading ? 0.7 : 1 }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                  {pwdLoading ? "Chargement…" : "Enregistrer"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
