import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { View, Text } from "react-native";
import { getSessionUser } from "../src/features/auth/authRepo";
import { isOnboardingComplete } from "../src/features/profile/services/onboardingService";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getSessionUser();
      setSignedIn(!!user);
      setOnboardingDone(await isOnboardingComplete());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0b0f", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "rgba(255,255,255,0.7)" }}>Chargement…</Text>
      </View>
    );
  }

  if (signedIn) {
    if (!onboardingDone) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)/home" />;
  }

  router.replace("/(auth)/account-type");
  return null;
}
