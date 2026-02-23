import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "../../src/features/auth/authRepo";
import { theme } from "../../src/core/ui/theme";
import { AppText } from "../../src/core/ui/AppText";
import { AppButton } from "../../src/core/ui/AppButton";
import { AppInput } from "../../src/core/ui/AppInput";
import { AppBadge } from "../../src/core/ui/AppBadge";
import { Toast } from "../../src/core/ui/Toast";

type AccountType = "student" | "professor" | "school";

type Errors = {
  name?: string;
  email?: string;
  schoolCode?: string;
  password?: string;
  confirmPassword?: string;
};

const accountTypes = [
  { value: "student", label: "Etudiant", icon: "??", tone: "blue" as const },
  { value: "professor", label: "Professeur", icon: "?????", tone: "orange" as const },
  { value: "school", label: "Ecole", icon: "??", tone: "purple" as const },
];

export default function RegisterScreen() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState("");

  const headerTone = useMemo(() => {
    if (accountType === "professor") return "orange" as const;
    if (accountType === "school") return "purple" as const;
    return "blue" as const;
  }, [accountType]);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);

  const validate = (): boolean => {
    const next: Errors = {};

    if (!name.trim()) next.name = "Le nom est requis.";
    if (!validateEmail(email.trim())) next.email = "Email invalide.";
    if (!validatePassword(password)) next.password = "8+ caracteres avec lettres et chiffres.";
    if (confirmPassword !== password) next.confirmPassword = "Les mots de passe ne correspondent pas.";
    if (accountType === "school" && !schoolCode.trim()) next.schoolCode = "Code etablissement requis.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) {
      setToast("Corrige les champs en erreur.");
      setTimeout(() => setToast(""), 1800);
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        accountType,
        schoolName: accountType === "school" ? schoolCode.trim() : undefined,
      });
      setToast("Compte cree avec succes.");
      setTimeout(() => {
        setToast("");
        router.replace("/(auth)/login");
      }, 900);
    } catch (error: any) {
      setToast(error?.message || "Impossible de creer le compte.");
      setTimeout(() => setToast(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ paddingVertical: 14 }}>
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
          </View>

          <View style={{ marginTop: 8, marginBottom: 22 }}>
            <AppText variant="title">Creer un compte</AppText>
            <AppText muted style={{ marginTop: 6 }}>Rejoins BLOC aujourd'hui</AppText>
            <View style={{ marginTop: 10 }}>
              <AppBadge label={accountType === "school" ? "Espace Ecole" : accountType === "professor" ? "Espace Professeur" : "Espace Etudiant"} tone={headerTone} />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {accountTypes.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => setAccountType(type.value as AccountType)}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: accountType === type.value ? theme.colors.accent : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <AppText>{type.icon}</AppText>
                <AppText variant="caption" style={{ marginTop: 6 }}>{type.label}</AppText>
              </Pressable>
            ))}
          </View>

          <View style={{ gap: 14 }}>
            <AppInput
              label={accountType === "school" ? "Nom de l'etablissement" : "Nom complet"}
              value={name}
              onChangeText={setName}
              placeholder={accountType === "school" ? "Ex: ESGI Paris" : "Ex: Marie Dupont"}
              autoCapitalize="words"
              error={errors.name}
            />

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

            {accountType === "school" ? (
              <AppInput
                label="Code etablissement"
                value={schoolCode}
                onChangeText={setSchoolCode}
                placeholder="Ex: ESGI2024"
                autoCapitalize="characters"
                error={errors.schoolCode}
              />
            ) : null}

            <AppInput
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="8+ caracteres avec chiffres"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            <AppInput
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Retape ton mot de passe"
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            <AppButton onPress={handleSignUp} disabled={loading}>
              {loading ? "Creation..." : "Creer mon compte"}
            </AppButton>

            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 4 }}>
              <AppText muted variant="caption">Deja un compte ? </AppText>
              <Pressable onPress={() => router.replace("/(auth)/login")}>
                <AppText variant="caption" style={{ color: theme.colors.accent, fontWeight: "800" }}>Se connecter</AppText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast visible={!!toast} message={toast} />
    </SafeAreaView>
  );
}
