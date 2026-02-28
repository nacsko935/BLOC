import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../state/useAuthStore";

export default function Index() {
  const { initAuth, loading, session } = useAuthStore();

  useEffect(() => {
    initAuth().catch(() => null);
  }, [initAuth]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: "#7B6CFF", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#FFFFFF" size="small" />
        </View>
      </View>
    );
  }

  if (session) return <Redirect href="/(tabs)/home" />;
  return <Redirect href="/(auth)/account-type" />;
}
