import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../src/core/ui/theme";

export default function AccountTypeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(auth)/register");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur BLOC</Text>
        <Text style={styles.subtitle}>Votre plateforme éducative nouvelle génération</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎓</Text>
            <Text style={styles.featureText}>Cours interactifs</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎬</Text>
            <Text style={styles.featureText}>Réels éducatifs</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Chat en direct</Text>
          </View>
        </View>

        <Pressable
          onPress={handleGetStarted}
          style={({ pressed }) => [
            styles.getStartedButton,
            pressed && styles.getStartedButtonPressed,
          ]}
        >
          <Text style={styles.getStartedButtonText}>Commencer →</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>
            Déjà un compte ? <Text style={styles.loginButtonLink}>Se connecter</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 48,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: theme.radius.pill,
    ...theme.shadow.md,
  },
  getStartedButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  getStartedButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  loginButton: {
    marginTop: 24,
  },
  loginButtonText: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  loginButtonLink: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
});
