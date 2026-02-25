import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { getSupabaseOrThrow, isSupabaseConfigured, supabaseConfigError } from "../lib/supabase";
import { seedPosts } from "../lib/dev/seed";

export default function DebugSupabase() {
  const [email, setEmail] = useState("test" + Date.now() + "@bloc.dev");
  const [password, setPassword] = useState("Test1234!");
  const [log, setLog] = useState<string>("");

  const signup = async () => {
    const supabase = getSupabaseOrThrow();
    setLog("Signing up...");
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLog(JSON.stringify({ data, error }, null, 2));
  };

  const signin = async () => {
    const supabase = getSupabaseOrThrow();
    setLog("Signing in...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLog(JSON.stringify({ data, error }, null, 2));
  };

  const session = async () => {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase.auth.getSession();
    setLog(JSON.stringify({ data, error }, null, 2));
  };

  const signout = async () => {
    const supabase = getSupabaseOrThrow();
    const { error } = await supabase.auth.signOut();
    setLog(JSON.stringify({ ok: !error, error }, null, 2));
  };

  const seed = async () => {
    try {
      const n = await seedPosts(10);
      Alert.alert("Seed", `${n} posts inseres`);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Seed impossible");
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: "#000", justifyContent: "center" }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Debug Supabase</Text>
        <Text style={{ color: "#f87171", lineHeight: 22 }}>{supabaseConfigError}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#000" }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Debug Supabase
      </Text>

      <Text style={{ color: "#aaa", marginBottom: 6 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 12, marginBottom: 12 }}
      />

      <Text style={{ color: "#aaa", marginBottom: 6 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 12, marginBottom: 12 }}
      />

      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <Pressable onPress={signup} style={{ backgroundColor: "#4f46e5", padding: 12, borderRadius: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Sign Up</Text>
        </Pressable>

        <Pressable onPress={signin} style={{ backgroundColor: "#333", padding: 12, borderRadius: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Sign In</Text>
        </Pressable>

        <Pressable onPress={session} style={{ backgroundColor: "#333", padding: 12, borderRadius: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Get Session</Text>
        </Pressable>

        <Pressable onPress={signout} style={{ backgroundColor: "#b91c1c", padding: 12, borderRadius: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Sign Out</Text>
        </Pressable>

        <Pressable onPress={seed} style={{ backgroundColor: "#0f766e", padding: 12, borderRadius: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Seed Posts</Text>
        </Pressable>
      </View>

      <Text style={{ color: "#aaa", marginTop: 16, marginBottom: 8 }}>Log</Text>
      <Text style={{ color: "#fff", fontFamily: "monospace" }}>{log}</Text>
    </View>
  );
}
