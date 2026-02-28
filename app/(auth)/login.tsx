import React, { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../state/useAuthStore";

export default function LoginScreen() {
  const router      = useRouter();
  const { signIn }  = useAuthStore();
  const { accountType } = useLocalSearchParams<{ accountType?: string }>();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPwd,  setShowPwd]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Remplis tous les champs."); return; }
    setLoading(true); setError("");
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e?.message || "Impossible de se connecter.");
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">

            {/* Back */}
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#111111", alignItems: "center", justifyContent: "center", marginTop: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }, pressed && { opacity: 0.7 }]}>
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </Pressable>

            {/* Logo + titre */}
            <View style={{ marginTop: 32, marginBottom: 36, gap: 8 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#5B4CFF", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "900", letterSpacing: 0.5 }}>BLOC</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800", letterSpacing: -0.5 }}>Connexion</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Bon retour 👋</Text>
            </View>

            {/* Champs */}
            <View style={{ gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>Email</Text>
                <TextInput
                  value={email} onChangeText={setEmail}
                  placeholder="votre@email.com" placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                  style={{ backgroundColor: "#111111", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>Mot de passe</Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={password} onChangeText={setPassword}
                    placeholder="••••••••" placeholderTextColor="rgba(255,255,255,0.3)"
                    secureTextEntry={!showPwd} autoCapitalize="none"
                    style={{ backgroundColor: "#111111", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, paddingRight: 48, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                  />
                  <Pressable onPress={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 14, top: 14 }}>
                    <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={{ backgroundColor: "rgba(255,59,48,0.12)", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "rgba(255,59,48,0.25)" }}>
                  <Text style={{ color: "#FF6B6B", fontSize: 13, fontWeight: "600" }}>{error}</Text>
                </View>
              ) : null}

              {/* Bouton connexion */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [{ borderRadius: 14, overflow: "hidden", marginTop: 6, opacity: loading ? 0.7 : pressed ? 0.9 : 1 }]}
              >
                <LinearGradient colors={["#7B6CFF", "#5B4CFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 52, alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Se connecter</Text>
                  }
                </LinearGradient>
              </Pressable>

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 4 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Pas encore de compte ?</Text>
                <Pressable onPress={() => router.push({ pathname: "/(auth)/register", params: { accountType: accountType || "student" } })}>
                  <Text style={{ color: "#7B6CFF", fontWeight: "800", fontSize: 14 }}>S'inscrire</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
