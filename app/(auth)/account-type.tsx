import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AccountTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Fond dégradé subtil */}
      <LinearGradient colors={["#000000", "#000000", "#000000"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300 }} />

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}>

        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: "#5B4CFF", alignItems: "center", justifyContent: "center", marginBottom: 20, shadowColor: "#5B4CFF", shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}>
            <Text style={{ color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: 0.5 }}>BLOC</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: -0.8, textAlign: "center" }}>Bienvenue sur BLOC</Text>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, marginTop: 10, textAlign: "center", lineHeight: 22 }}>
            La plateforme éducative qui connecte étudiants et profs
          </Text>
        </View>

        {/* Features */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 24, marginBottom: 48 }}>
          {[
            { icon: "school-outline",    label: "Cours" },
            { icon: "chatbubbles-outline", label: "Chat"  },
            { icon: "sparkles-outline",  label: "IA"    },
          ].map(f => (
            <View key={f.label} style={{ alignItems: "center", gap: 10 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "#5B4CFF20", borderWidth: 1, borderColor: "#5B4CFF40", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={f.icon as any} size={24} color="#7B6CFF" />
              </View>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" }}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={{ gap: 12, marginTop: "auto" as any }}>
          <Pressable
            onPress={() => router.push("/(auth)/register")}
            style={({ pressed }) => [{ borderRadius: 16, overflow: "hidden", opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient colors={["#7B6CFF", "#5B4CFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 56, alignItems: "center", justifyContent: "center", borderRadius: 16 }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17 }}>Créer un compte</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={({ pressed }) => [{ height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>Se connecter</Text>
          </Pressable>
        </View>

        <Text style={{ color: "rgba(255,255,255,0.25)", textAlign: "center", fontSize: 11, marginTop: 20 }}>
          En continuant, tu acceptes nos CGU et politique de confidentialité
        </Text>
      </View>
    </View>
  );
}
