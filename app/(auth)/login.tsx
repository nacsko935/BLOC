import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";
import { signIn } from "../../src/features/auth/authRepo";
import { AppText } from "../../src/core/ui/AppText";
import { AppInput } from "../../src/core/ui/AppInput";
import { AppButton } from "../../src/core/ui/AppButton";
import { AppBadge } from "../../src/core/ui/AppBadge";
import { Toast } from "../../src/core/ui/Toast";

type Errors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { accountType } = useLocalSearchParams<{ accountType?: "student" | "professor" | "school" }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState("");

  const badge = useMemo(() => {
    if (accountType === "professor") return { label: "Espace Professeur", tone: "orange" as const };
    if (accountType === "school") return { label: "Espace Ecole", tone: "purple" as const };
    return { label: "Espace Etudiant", tone: "blue" as const };
  }, [accountType]);

  const validate = () => {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email requis";
    if (!password.trim()) next.password = "Mot de passe requis";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      setToast("Corrige les champs en erreur.");
      setTimeout(() => setToast(""), 1600);
      return;
    }

    setLoading(true);
    try {
      const user = await signIn(email.trim().toLowerCase(), password);
      if (user) {
        router.replace("/(tabs)/home");
      } else {
        setToast("Email ou mot de passe incorrect.");
        setTimeout(() => setToast(""), 1800);
      }
    } catch (error: any) {
      setToast(error?.message || "Impossible de se connecter.");
      setTimeout(() => setToast(""), 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.surface,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <AppText style={{ fontSize: 22 }}>?</AppText>
            </Pressable>
            <AppBadge label={badge.label} tone={badge.tone} />
          </View>

          <View style={{ marginTop: 18, marginBottom: 30 }}>
            <AppText variant="title">Connexion</AppText>
            <AppText muted style={{ marginTop: 6 }}>Bienvenue sur BLOC</AppText>
          </View>

          <View style={{ gap: 14 }}>
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <AppInput
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            <View style={{ alignSelf: "flex-end" }}>
              <Pressable>
                <AppText variant="caption" style={{ color: theme.colors.accent }}>Mot de passe oublie ?</AppText>
              </Pressable>
            </View>

            <AppButton onPress={handleLogin} disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </AppButton>

            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 8 }}>
              <AppText muted variant="caption">Pas encore de compte ? </AppText>
              <Pressable onPress={() => router.push({ pathname: "/(auth)/signup", params: { accountType: accountType || "student" } })}>
                <AppText variant="caption" style={{ color: theme.colors.accent, fontWeight: "800" }}>S'inscrire</AppText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast visible={!!toast} message={toast} />
    </SafeAreaView>
  );
}
