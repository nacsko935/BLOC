import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";
import { signUp } from "../../src/features/auth/authRepo";

export default function SignUpScreen() {
  const router = useRouter();
  const { accountType } = useLocalSearchParams<{ accountType: 'student' | 'professor' | 'school' }>();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre nom");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (accountType === 'school' && !schoolName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer le nom de l'établissement");
      return;
    }

    setLoading(true);

    try {
      // Créer le compte
      await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        accountType: accountType || 'student',
        schoolName: accountType === 'school' ? schoolName.trim() : undefined,
      });

      Alert.alert(
        "Compte créé !",
        "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        [
          {
            text: "Se connecter",
            onPress: () => router.replace({
              pathname: "/(auth)/login",
              params: { accountType },
            }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de créer le compte");
    } finally {
      setLoading(false);
    }
  };

  const getBadge = () => {
    switch (accountType) {
      case 'professor':
        return { text: 'Pro', color: '#ff9500', bg: 'rgba(255, 149, 0, 0.15)' };
      case 'school':
        return { text: 'Ec', color: '#af52de', bg: 'rgba(175, 82, 222, 0.15)' };
      default:
        return { text: 'Et', color: '#007aff', bg: 'rgba(0, 122, 255, 0.15)' };
    }
  };

  const badge = getBadge();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>
                {badge.text}
              </Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              {accountType === 'professor' && "Compte Professeur"}
              {accountType === 'school' && "Compte École"}
              {accountType === 'student' && "Compte Étudiant"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {accountType === 'school' ? "Nom de l'établissement" : "Nom complet"}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={accountType === 'school' ? "Ex: ESGI Paris" : "Ex: Marie Dupont"}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* School name for school accounts */}
            {accountType === 'school' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Code établissement</Text>
                <TextInput
                  value={schoolName}
                  onChangeText={setSchoolName}
                  placeholder="Ex: ESGI2024"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.input}
                  autoCapitalize="characters"
                />
              </View>
            )}

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 caractères"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Retapez votre mot de passe"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSignUp}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                loading && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Création..." : "Créer mon compte"}
              </Text>
            </Pressable>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Déjà un compte ? </Text>
              <Pressable onPress={() => router.replace({
                pathname: "/(auth)/login",
                params: { accountType },
              })}>
                <Text style={styles.loginLinkButton}>Se connecter</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 17,
    fontWeight: "600",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "400",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    ...theme.shadow.sm,
  },
  submitButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  loginLinkText: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  loginLinkButton: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
});
