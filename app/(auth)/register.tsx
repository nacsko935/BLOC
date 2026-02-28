import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../state/useAuthStore";
import { upsertMyProfile } from "../../lib/services/profileService";

type AccountType = "student" | "professor" | "school";
const TYPES = [
  { value: "student"   as AccountType, label: "Étudiant",    icon: "school-outline"    },
  { value: "professor" as AccountType, label: "Professeur",  icon: "person-outline"    },
  { value: "school"    as AccountType, label: "École",       icon: "business-outline"  },
];

function Field({ label, value, onChange, placeholder, secure, keyboard }: any) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          value={value} onChangeText={onChange}
          placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.3)"
          secureTextEntry={secure && !show} autoCapitalize="none"
          keyboardType={keyboard || "default"}
          style={{ backgroundColor: "#111111", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, paddingRight: secure ? 48 : 16, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
        />
        {secure && (
          <Pressable onPress={() => setShow(!show)} style={{ position: "absolute", right: 14, top: 14 }}>
            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.4)" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const router    = useRouter();
  const { signUp } = useAuthStore();
  const [type,    setType]    = useState<AccountType>("student");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pwd,     setPwd]     = useState("");
  const [pwd2,    setPwd2]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !pwd.trim()) { setError("Remplis tous les champs."); return; }
    if (pwd !== pwd2) { setError("Les mots de passe ne correspondent pas."); return; }
    if (pwd.length < 8) { setError("Mot de passe trop court (8 caractères min)."); return; }
    setLoading(true); setError("");
    try {
      await signUp(email.trim().toLowerCase(), pwd);
      await upsertMyProfile({
        full_name: name.trim(),
        username:  email.trim().split("@")[0],
        niveau:    type === "professor" ? "Professeur" : type === "school" ? "Etablissement" : "Etudiant",
      }).catch(() => null);
      router.replace("/(auth)/login");
    } catch (e: any) {
      setError(e?.message || "Impossible de créer le compte.");
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#111111", alignItems: "center", justifyContent: "center", marginTop: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }, pressed && { opacity: 0.7 }]}>
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </Pressable>

            <View style={{ marginTop: 24, marginBottom: 28, gap: 6 }}>
              <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800", letterSpacing: -0.5 }}>Créer un compte</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Rejoins BLOC aujourd'hui 🚀</Text>
            </View>

            {/* Type de compte */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
              {TYPES.map(t => (
                <Pressable
                  key={t.value}
                  onPress={() => setType(t.value)}
                  style={({ pressed }) => [{ flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: type === t.value ? "#6E5CFF" : "rgba(255,255,255,0.08)", backgroundColor: type === t.value ? "#6E5CFF18" : "#111111", paddingVertical: 12, alignItems: "center", gap: 6 }, pressed && { opacity: 0.8 }]}
                >
                  <Ionicons name={t.icon as any} size={20} color={type === t.value ? "#7B6CFF" : "rgba(255,255,255,0.4)"} />
                  <Text style={{ color: type === t.value ? "#7B6CFF" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" }}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ gap: 14 }}>
              <Field label="Nom complet"      value={name}  onChange={setName}  placeholder="Marie Dupont"        />
              <Field label="Email"            value={email} onChange={setEmail} placeholder="votre@email.com"    keyboard="email-address" />
              <Field label="Mot de passe"     value={pwd}   onChange={setPwd}   placeholder="8+ caractères"      secure />
              <Field label="Confirmer"        value={pwd2}  onChange={setPwd2}  placeholder="Retape ton mot de passe" secure />

              {error ? (
                <View style={{ backgroundColor: "rgba(255,59,48,0.12)", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "rgba(255,59,48,0.25)" }}>
                  <Text style={{ color: "#FF6B6B", fontSize: 13, fontWeight: "600" }}>{error}</Text>
                </View>
              ) : null}

              <Pressable onPress={handleSignUp} disabled={loading} style={({ pressed }) => [{ borderRadius: 14, overflow: "hidden", marginTop: 6, opacity: loading ? 0.7 : pressed ? 0.9 : 1 }]}>
                <LinearGradient colors={["#7B6CFF", "#5B4CFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 52, alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Créer mon compte</Text>}
                </LinearGradient>
              </Pressable>

              <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Déjà un compte ?</Text>
                <Pressable onPress={() => router.replace("/(auth)/login")}>
                  <Text style={{ color: "#7B6CFF", fontWeight: "800", fontSize: 14 }}>Se connecter</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
