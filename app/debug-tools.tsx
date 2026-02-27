import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "../state/useAuthStore";
import { seedInitialContent, seedPosts } from "../lib/dev/seed";
import { AppButton } from "../src/core/ui/AppButton";

export default function DebugToolsScreen() {
  const { session, profile, user } = useAuthStore();

  if (!__DEV__) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Debug tools indisponible</Text>
      </View>
    );
  }

  const simulatePush = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test push BLOC",
        body: "Tap pour ouvrir une conversation",
        data: { type: "dm", conversation_id: "demo" },
      },
      trigger: null,
    });
    Alert.alert("OK", "Push locale simulee");
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Debug Tools</Text>

        <AppButton
          style={styles.button}
          onPress={async () => {
            try {
              await seedPosts(10);
              Alert.alert("OK", "10 posts seed");
            } catch (error: any) {
              Alert.alert("Erreur", error?.message || "seed failed");
            }
          }}
        >
          Seed posts
        </AppButton>

        <AppButton
          style={styles.button}
          onPress={async () => {
            try {
              const result = await seedInitialContent();
              Alert.alert("Seed V1", `${result.posts} posts, ${result.groups} groupes, ${result.profiles} profils demos.`);
            } catch (error: any) {
              Alert.alert("Erreur", error?.message || "seed initial impossible");
            }
          }}
        >
          Generer contenu test
        </AppButton>

        <AppButton style={styles.button} onPress={simulatePush}>
          Simuler push payload
        </AppButton>

        <View style={styles.card}>
          <Text style={styles.label}>Session</Text>
          <Text style={styles.value}>{session ? "active" : "inactive"}</Text>
          <Text style={styles.label}>User</Text>
          <Text style={styles.value}>{user?.id || "none"}</Text>
          <Text style={styles.label}>Profile</Text>
          <Text style={styles.value}>{profile?.username || profile?.full_name || "none"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 56, paddingHorizontal: 16, gap: 12, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 30, fontWeight: "800" },
  button: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#17171D",
    borderWidth: 1,
    borderColor: "#2B2B36",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  card: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2B2B36",
    backgroundColor: "#111",
    padding: 12,
    gap: 4,
  },
  label: { color: "#8B8B95", fontSize: 12 },
  value: { color: "#fff", fontSize: 13, marginBottom: 6 },
});
