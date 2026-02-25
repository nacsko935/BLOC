import { useEffect } from "react";
import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { useAuthStore } from "../state/useAuthStore";

export default function Index() {
  const { initAuth, loading, session } = useAuthStore();

  useEffect(() => {
    initAuth().catch(() => null);
  }, [initAuth]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0b0f", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "rgba(255,255,255,0.7)" }}>Chargement...</Text>
      </View>
    );
  }

  if (session) return <Redirect href="/(tabs)/home" />;

  return <Redirect href="/(auth)/account-type" />;
}