import React, { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../state/useAuthStore";
import { upsertMyProfile } from "../../lib/services/profileService";
import { BlocLogo } from "../../src/components/BlocLogo";

type AccountType = "student" | "professor" | "school";
const TYPES: { value: AccountType; label: string; icon: string; color: string; desc: string }[] = [
  { value:"student",   label:"Étudiant",   icon:"school-outline",   color:"#7B6CFF", desc:"Apprends et progresse" },
  { value:"professor", label:"Professeur", icon:"person-outline",   color:"#FF8C00", desc:"Partage ton savoir" },
  { value:"school",    label:"École",      icon:"business-outline", color:"#00C7BE", desc:"Gère ta communauté" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuthStore();

  const [type,    setType]    = useState<AccountType>("student");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pwd,     setPwd]     = useState("");
  const [pwd2,    setPwd2]    = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error,   setError]   = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !pwd.trim()) { setError("Remplis tous les champs."); return; }
    if (pwd !== pwd2) { setError("Les mots de passe ne correspondent pas."); return; }
    if (pwd.length < 8) { setError("Mot de passe : 8 caractères minimum."); return; }
    setLoading(true); setError("");
    try {
      await signUp(email.trim().toLowerCase(), pwd);
      await upsertMyProfile({
        full_name: name.trim(),
        username: email.trim().split("@")[0],
        account_type: type,
        role: type,
        niveau: type === "professor" ? "Professeur" : type === "school" ? "Etablissement" : "Etudiant",
        is_first_login: true,
      }).catch(() => null);
      // Mark this email as "first login pending" (cleared after welcome screen)
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const userKey = `bloc.welcomed.${email.trim().toLowerCase()}`;
      await AsyncStorage.removeItem(userKey).catch(() => null);
      setEmailSent(true);
    } catch (e: any) {
      setError(e?.message || "Impossible de créer le compte.");
    } finally { setLoading(false); }
  };

  const selectedType = TYPES.find(t => t.value === type)!;

  if (emailSent) {
    return (
      <View style={{ flex: 1, backgroundColor: "#07071A" }}>
        <LinearGradient colors={["#0D0820", "#060412", "#000000"]} style={StyleSheet.absoluteFillObject} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 64 }}>📧</Text>
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900", textAlign: "center", marginTop: 20, marginBottom: 12 }}>
            Confirme ton email
          </Text>
          <View style={{ backgroundColor: "rgba(123,108,255,0.12)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(123,108,255,0.30)", padding: 20, marginBottom: 28 }}>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 24, textAlign: "center" }}>
              Un email de confirmation a été envoyé à{" "}
              <Text style={{ color: "#7B6CFF", fontWeight: "800" }}>{email}</Text>
              {" — "}Clique sur le lien dans l'email pour activer ton compte, puis reviens te connecter ici.
            </Text>
          </View>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <LinearGradient colors={["#7B6CFF", "#5040E0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ height: 54, borderRadius: 16, paddingHorizontal: 32, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Aller à la connexion</Text>
            </LinearGradient>
          </Pressable>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textAlign: "center", marginTop: 20 }}>
            Tu n'as pas reçu l'email ? Vérifie tes spams ou réessaie.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={["#0A0618", "#060310", "#000000"]} style={StyleSheet.absoluteFillObject} />
      <View style={s.orbTR} /><View style={s.orbBL} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={{ alignItems: "center", marginTop: 8, marginBottom: 4 }}>
            <BlocLogo size={64} variant="dark" />
          </View>

          <Text style={s.title}>Rejoins BLOC</Text>
          <Text style={s.subtitle}>Crée ton espace d'apprentissage personnel</Text>

          {/* Account type selector */}
          <View style={s.typesRow}>
            {TYPES.map(t => {
              const active = type === t.value;
              return (
                <Pressable key={t.value} onPress={() => setType(t.value)}
                  style={[s.typeCard, active && { borderColor: t.color, backgroundColor: t.color + "14" }]}>
                  <View style={[s.typeIconBox, { backgroundColor: t.color + (active ? "28" : "14") }]}>
                    <Ionicons name={t.icon as any} size={20} color={t.color} />
                  </View>
                  <Text style={[s.typeLabel, { color: active ? t.color : "rgba(255,255,255,0.50)" }]}>{t.label}</Text>
                  {active && <View style={[s.typeCheck, { backgroundColor: t.color }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>}
                </Pressable>
              );
            })}
          </View>

          {/* Form */}
          <View style={s.card}>
            {/* Full name */}
            <View style={s.field}>
              <View style={s.fieldIcon}><Ionicons name="person-outline" size={17} color={selectedType.color} /></View>
              <TextInput value={name} onChangeText={setName} placeholder="Nom complet"
                placeholderTextColor="rgba(255,255,255,0.28)" autoCapitalize="words"
                style={s.fieldInput} />
            </View>

            {/* Email */}
            <View style={s.field}>
              <View style={s.fieldIcon}><Ionicons name="mail-outline" size={17} color={selectedType.color} /></View>
              <TextInput value={email} onChangeText={setEmail} placeholder="Adresse email"
                placeholderTextColor="rgba(255,255,255,0.28)" keyboardType="email-address"
                autoCapitalize="none" autoCorrect={false} style={s.fieldInput} />
            </View>

            {/* Password */}
            <View style={s.field}>
              <View style={s.fieldIcon}><Ionicons name="lock-closed-outline" size={17} color={selectedType.color} /></View>
              <TextInput value={pwd} onChangeText={setPwd} placeholder="Mot de passe (8+ car.)"
                placeholderTextColor="rgba(255,255,255,0.28)" secureTextEntry={!showPwd}
                autoCapitalize="none" style={[s.fieldInput, { paddingRight: 48 }]} />
              <Pressable onPress={() => setShowPwd(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(255,255,255,0.35)" />
              </Pressable>
            </View>

            {/* Confirm */}
            <View style={s.field}>
              <View style={s.fieldIcon}><Ionicons name="shield-checkmark-outline" size={17} color={selectedType.color} /></View>
              <TextInput value={pwd2} onChangeText={setPwd2} placeholder="Confirme le mot de passe"
                placeholderTextColor="rgba(255,255,255,0.28)" secureTextEntry={!showPwd}
                autoCapitalize="none" style={s.fieldInput} />
            </View>

            {/* Password strength */}
            {pwd.length > 0 && (
              <View style={s.strengthRow}>
                {[4, 6, 8, 12].map((min, i) => (
                  <View key={i} style={[s.strengthBar, { backgroundColor: pwd.length >= min ? selectedType.color : "rgba(255,255,255,0.10)" }]} />
                ))}
                <Text style={[s.strengthLabel, { color: pwd.length >= 8 ? selectedType.color : "rgba(255,255,255,0.35)" }]}>
                  {pwd.length < 6 ? "Trop court" : pwd.length < 8 ? "Presque" : pwd.length < 12 ? "Bon" : "Excellent"}
                </Text>
              </View>
            )}

            {!!error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color="#FF6B6B" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Pressable onPress={handleSignUp} disabled={loading}>
              <LinearGradient
                colors={loading ? ["#333","#222"] : [selectedType.color, selectedType.color + "CC"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <>
                  <Text style={s.submitText}>Créer mon compte</Text>
                  <Ionicons name="rocket-outline" size={18} color="#fff" />
                </>}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable onPress={() => router.replace("/(auth)/login")} style={s.loginRow}>
            <Text style={s.loginLabel}>Déjà un compte ?</Text>
            <Text style={[s.loginLink, { color: selectedType.color }]}>Se connecter</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07071A" },
  scroll: { paddingHorizontal: 24, paddingBottom: 60, flexGrow: 1 },
  orbTR: { position:"absolute", top:-60, right:-70, width:250, height:250, borderRadius:125, backgroundColor:"#7B6CFF", opacity:0.10 },
  orbBL: { position:"absolute", bottom:80, left:-80, width:200, height:200, borderRadius:100, backgroundColor:"#FF8C00", opacity:0.07 },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:"rgba(255,255,255,0.06)", borderWidth:1, borderColor:"rgba(255,255,255,0.09)", alignItems:"center", justifyContent:"center" },
  title: { color:"#fff", fontSize:26, fontWeight:"800", letterSpacing:-0.5, textAlign:"center", marginTop:28, marginBottom:6 },
  subtitle: { color:"rgba(255,255,255,0.42)", fontSize:15, textAlign:"center", marginBottom:24 },
  typesRow: { flexDirection:"row", gap:10, marginBottom:20 },
  typeCard: { flex:1, borderRadius:16, borderWidth:1.5, borderColor:"rgba(255,255,255,0.09)", backgroundColor:"rgba(255,255,255,0.03)", padding:12, alignItems:"center", gap:8, position:"relative" },
  typeIconBox: { width:44, height:44, borderRadius:14, alignItems:"center", justifyContent:"center" },
  typeLabel: { fontSize:12, fontWeight:"700", textAlign:"center" },
  typeCheck: { position:"absolute", top:-5, right:-5, width:18, height:18, borderRadius:9, alignItems:"center", justifyContent:"center" },
  card: { backgroundColor:"rgba(255,255,255,0.04)", borderRadius:24, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", padding:18, gap:12 },
  field: { flexDirection:"row", alignItems:"center", backgroundColor:"rgba(255,255,255,0.05)", borderRadius:14, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", minHeight:52, overflow:"hidden" },
  fieldIcon: { width:48, alignItems:"center", justifyContent:"center", borderRightWidth:1, borderRightColor:"rgba(255,255,255,0.06)", alignSelf:"stretch" },
  fieldInput: { flex:1, color:"#fff", fontSize:15, paddingHorizontal:14, paddingVertical:14 },
  eyeBtn: { position:"absolute", right:12, width:34, height:34, alignItems:"center", justifyContent:"center" },
  strengthRow: { flexDirection:"row", alignItems:"center", gap:6 },
  strengthBar: { flex:1, height:4, borderRadius:2 },
  strengthLabel: { fontSize:11, fontWeight:"700", minWidth:56, textAlign:"right" },
  errorBox: { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:"rgba(255,107,107,0.10)", borderRadius:12, padding:12, borderWidth:1, borderColor:"rgba(255,107,107,0.22)" },
  errorText: { color:"#FF6B6B", fontSize:13, fontWeight:"600", flex:1 },
  submitBtn: { height:54, borderRadius:16, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:10 },
  submitText: { color:"#fff", fontWeight:"800", fontSize:16 },
  loginRow: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, marginTop:24 },
  loginLabel: { color:"rgba(255,255,255,0.42)", fontSize:14 },
  loginLink: { fontWeight:"800", fontSize:14 },
});
