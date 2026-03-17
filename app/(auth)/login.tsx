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
import { BlocLogo } from "../../src/components/BlocLogo";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Remplis tous les champs."); return; }
    setLoading(true); setError("");
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Source de vérité : is_first_login dans Supabase (plus fiable qu'AsyncStorage)
      const { useAuthStore: authStore } = await import("../../state/useAuthStore");
      const profile = authStore.getState().profile;
      if (profile?.is_first_login === true) {
        router.replace("/welcome");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (e: any) {
      setError(e?.message || "Email ou mot de passe incorrect.");
    } finally { setLoading(false); }
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={["#0D0820", "#060412", "#000000"]} style={StyleSheet.absoluteFillObject} />
      <View style={s.orbTR} /><View style={s.orbBL} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={s.topHeader}>
            <Pressable onPress={() => router.back()} style={[s.backBtn, s.backBtnOverlay]}>
              <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>

            <View style={s.logoAreaTop}>
              <BlocLogo size={80} variant="dark" />
              <View style={s.logoGlow} />
            </View>
          </View>

          <Text style={s.title}>Content de te revoir 👋</Text>
          <Text style={s.subtitle}>Connecte-toi à ton espace BLOC</Text>

          <View style={s.card}>
            <View style={s.field}>
              <View style={s.fieldIcon}><Ionicons name="mail-outline" size={17} color="#7B6CFF" /></View>
              <TextInput value={email} onChangeText={setEmail} placeholder="Adresse email"
                placeholderTextColor="rgba(255,255,255,0.28)" keyboardType="email-address"
                autoCapitalize="none" autoCorrect={false} style={s.fieldInput} />
            </View>

            <View style={s.field}>
              <View style={s.fieldIcon}><Ionicons name="lock-closed-outline" size={17} color="#7B6CFF" /></View>
              <TextInput value={password} onChangeText={setPassword} placeholder="Mot de passe"
                placeholderTextColor="rgba(255,255,255,0.28)" secureTextEntry={!showPwd}
                autoCapitalize="none" style={[s.fieldInput, { paddingRight: 48 }]} />
              <Pressable onPress={() => setShowPwd(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(255,255,255,0.35)" />
              </Pressable>
            </View>

            {!!error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color="#FF6B6B" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Pressable onPress={handleLogin} disabled={loading}>
              <LinearGradient colors={loading ? ["#333","#222"] : ["#8B7DFF","#5040E0"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <>
                  <Text style={s.submitText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>}
              </LinearGradient>
            </Pressable>
          </View>

          <View style={s.divider}>
            <View style={s.divLine} /><Text style={s.divText}>ou</Text><View style={s.divLine} />
          </View>

          <Pressable onPress={() => router.push("/(auth)/register")} style={s.signupRow}>
            <Text style={s.signupLabel}>Pas encore de compte ?</Text>
            <Text style={s.signupLink}>S'inscrire</Text>
            <Ionicons name="chevron-forward" size={14} color="#7B6CFF" />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07071A" },
  scroll: { paddingHorizontal: 24, paddingBottom: 60, flexGrow: 1 },
  orbTR: { position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:140, backgroundColor:"#7B6CFF", opacity:0.11 },
  orbBL: { position:"absolute", bottom:40, left:-100, width:240, height:240, borderRadius:120, backgroundColor:"#4B3BDF", opacity:0.09 },
  topHeader: { height: 64, justifyContent: "center", alignItems: "center", marginTop: 4, marginBottom: 24, position: "relative" },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:"rgba(255,255,255,0.06)", borderWidth:1, borderColor:"rgba(255,255,255,0.09)", alignItems:"center", justifyContent:"center" },
  backBtnOverlay: { position: "absolute", left: 0, top: 12 },
  logoAreaTop: { alignItems:"center", position:"relative" },
  logoBox: { width:76, height:76, borderRadius:24, alignItems:"center", justifyContent:"center", shadowColor:"#7B6CFF", shadowOpacity:0.55, shadowRadius:22, shadowOffset:{width:0,height:0}, elevation:12 },
  logoLetter: { color:"#fff", fontSize:38, fontWeight:"900", letterSpacing:-1 },
  logoGlow: { position:"absolute", width:110, height:110, borderRadius:55, backgroundColor:"#7B6CFF", opacity:0.14, zIndex:-1 },
  title: { color:"#fff", fontSize:26, fontWeight:"800", letterSpacing:-0.5, textAlign:"center", marginBottom:6 },
  subtitle: { color:"rgba(255,255,255,0.42)", fontSize:15, textAlign:"center", marginBottom:30 },
  card: { backgroundColor:"rgba(255,255,255,0.04)", borderRadius:24, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", padding:18, gap:12 },
  field: { flexDirection:"row", alignItems:"center", backgroundColor:"rgba(255,255,255,0.05)", borderRadius:14, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", minHeight:54, overflow:"hidden" },
  fieldIcon: { width:48, alignItems:"center", justifyContent:"center", borderRightWidth:1, borderRightColor:"rgba(255,255,255,0.06)", alignSelf:"stretch" },
  fieldInput: { flex:1, color:"#fff", fontSize:15, paddingHorizontal:14, paddingVertical:15 },
  eyeBtn: { position:"absolute", right:12, width:34, height:34, alignItems:"center", justifyContent:"center" },
  errorBox: { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:"rgba(255,107,107,0.10)", borderRadius:12, padding:12, borderWidth:1, borderColor:"rgba(255,107,107,0.22)" },
  errorText: { color:"#FF6B6B", fontSize:13, fontWeight:"600", flex:1 },
  submitBtn: { height:54, borderRadius:16, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:10 },
  submitText: { color:"#fff", fontWeight:"800", fontSize:16, letterSpacing:0.2 },
  divider: { flexDirection:"row", alignItems:"center", gap:12, marginVertical:24 },
  divLine: { flex:1, height:1, backgroundColor:"rgba(255,255,255,0.08)" },
  divText: { color:"rgba(255,255,255,0.28)", fontSize:13 },
  signupRow: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6 },
  signupLabel: { color:"rgba(255,255,255,0.42)", fontSize:14 },
  signupLink: { color:"#7B6CFF", fontWeight:"800", fontSize:14 },
});
