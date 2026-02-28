import { useState } from "react";
import {
  Alert, FlatList, Pressable, ScrollView, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";

// ── Données ──────────────────────────────────────────────────────────────────

const RECENT_PROJECTS = [
  { id: "1", title: "QCM Réseaux – Sécurité",  date: "il y a 2j",  icon: "📡" },
  { id: "2", title: "Fiche React Native",       date: "il y a 5j",  icon: "📱" },
];

const TRACK_TYPES = [
  { id: "post",    label: "Publication", icon: "create-outline",      gradient: ["#34C759","#28A745"] as [string,string] },
  { id: "audio",   label: "Voix/Audio",  icon: "mic-outline",         gradient: ["#FF3B30","#C0392B"] as [string,string] },
  { id: "qcm",     label: "QCM",         icon: "help-circle-outline", gradient: ["#FF9500","#E07A00"] as [string,string] },
  { id: "pdf",     label: "PDF",         icon: "document-outline",    gradient: ["#007AFF","#0056B3"] as [string,string] },
  { id: "import",  label: "Importer",    icon: "cloud-upload-outline", gradient: ["#AF52DE","#8B3FC2"] as [string,string] },
];

const AI_TOOLS = [
  { id:"resume",   label:"Résumé IA",     icon:"sparkles-outline",        color:"#7B6CFF", badge:"AI" },
  { id:"qcm",      label:"QCM Auto",      icon:"help-circle-outline",     color:"#FF6B6B", badge:"AI" },
  { id:"fiche",    label:"Fiche révision",icon:"document-text-outline",   color:"#4DA3FF", badge:"AI" },
  { id:"expliquer",label:"Explique-moi",  icon:"bulb-outline",            color:"#FF9500", badge:"AI" },
  { id:"correct",  label:"Correcteur",    icon:"checkmark-circle-outline",color:"#34C759", badge:"AI" },
  { id:"plan",     label:"Plan de cours", icon:"list-outline",            color:"#AF52DE", badge:"AI" },
  { id:"trad",     label:"Traducteur",    icon:"language-outline",        color:"#FF2D55", badge:"AI" },
  { id:"oral",     label:"Prépare l'oral",icon:"mic-circle-outline",      color:"#00C7BE", badge:"AI" },
];

const COURSE_TOOLS = [
  { id:"flash",    label:"Flashcards",   icon:"layers-outline",          color:"#007AFF", route:"/(modals)/flashcards" },
  { id:"note",     label:"Note audio",   icon:"mic-outline",             color:"#FF3B30", route:"/create/audio" },
  { id:"pomo",     label:"Pomodoro",     icon:"timer-outline",           color:"#FF9500", route:"/(modals)/pomodoro" },
  { id:"dead",     label:"Deadlines",    icon:"calendar-outline",        color:"#34C759", route:"/(modals)/deadlines" },
  { id:"notes",    label:"Notes",        icon:"pencil-outline",          color:"#AF52DE", route:"/create/index" },
  { id:"prog",     label:"Progression",  icon:"trending-up-outline",     color:"#00C7BE", route:"/create/index" },
  { id:"ecole",    label:"Lier école",   icon:"school-outline",          color:"#FF6B6B", route:"/create/index" },
  { id:"studio",   label:"Studio",       icon:"musical-notes-outline",   color:"#FFD700", route:"/create/index" },
];

// ── Composant principal ───────────────────────────────────────────────────────

export function CreatePageScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  const [iaOpen, setIaOpen] = useState(true);

  const handleTrack = (id: string) => {
    const routes: Record<string,string> = {
      post:   "/create/index",
      audio:  "/create/audio",
      qcm:    "/(modals)/create-new",
      pdf:    "/create/pdf",
      import: "/create/import",
    };
    router.push(routes[id] as any);
  };

  const handleAITool = (label: string) => {
    Alert.alert(
      `🤖 ${label}`,
      "Cet outil IA sera disponible dans la prochaine mise à jour.\n\nNos équipes travaillent sur l'intégration IA pour vous offrir la meilleure expérience.",
      [{ text: "Super, j'attends !", style: "cancel" }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Header ── */}
        <View style={{
          paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 14,
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          borderBottomWidth: 1, borderBottomColor: c.border,
        }}>
          <Text style={{ fontSize: 30, fontWeight: "800", color: c.textPrimary }}>Créer</Text>
          <Pressable style={({ pressed }) => [{
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
            backgroundColor: "#FF9500", flexDirection: "row", alignItems: "center", gap: 6,
          }, pressed && { opacity: 0.85 }]}>
            <Ionicons name="trophy-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Premium</Text>
          </Pressable>
        </View>

        {/* ── Projets récents ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
          borderBottomWidth: 1, borderBottomColor: c.border }}>
          <Text style={{ color: c.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
            Projets récents
          </Text>
          <FlatList
            data={RECENT_PROJECTS} horizontal keyExtractor={i => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <Pressable style={({ pressed }) => [{
                flexDirection: "row", alignItems: "center", gap: 12,
                backgroundColor: c.card, borderRadius: 14, padding: 12,
                borderWidth: 1, borderColor: c.border, minWidth: 200,
              }, pressed && { opacity: 0.85 }]}>
                <View style={{ width: 44, height: 44, borderRadius: 10,
                  backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.textPrimary, fontWeight: "700" }} numberOfLines={1}>{item.title}</Text>
                  <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>{item.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
              </Pressable>
            )}
          />
        </View>

        {/* ── Type de piste ── */}
        <View style={{ paddingTop: 20, borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 20 }}>
          <Text style={{ color: c.textPrimary, fontSize: 16, fontWeight: "700",
            paddingHorizontal: 20, marginBottom: 12 }}>Type de piste</Text>
          <FlatList
            data={TRACK_TYPES} horizontal keyExtractor={i => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleTrack(item.id)}
                style={({ pressed }) => [{ width: 120, height: 100, borderRadius: 16, overflow: "hidden" }, pressed && { opacity: 0.85 }]}>
                <LinearGradient colors={item.gradient} style={{ width: "100%", height: "100%",
                  alignItems: "flex-start", justifyContent: "space-between", padding: 12 }}>
                  <Ionicons name={item.icon as any} size={28} color="rgba(255,255,255,0.9)" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{item.label}</Text>
                </LinearGradient>
              </Pressable>
            )}
          />
        </View>

        {/* ── Outils IA ── */}
        <View style={{ paddingTop: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 20 }}>
          <Pressable onPress={() => setIaOpen(v => !v)}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 28, height: 18, borderRadius: 5, backgroundColor: c.accentPurple,
                alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>AI</Text>
              </View>
              <Text style={{ color: c.textPrimary, fontSize: 16, fontWeight: "700" }}>Outils IA</Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                backgroundColor: "#FF9500" }}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>BIENTÔT</Text>
              </View>
            </View>
            <Ionicons name={iaOpen ? "chevron-up" : "chevron-down"} size={18} color={c.textSecondary} />
          </Pressable>

          {iaOpen && (
            <LinearGradient
              colors={isDark ? ["#1A0A3B", "#0C0620"] : ["#EDE9FE", "#F5F3FF"]}
              style={{ borderRadius: 20, padding: 16, borderWidth: 1,
                borderColor: isDark ? "rgba(123,108,255,0.25)" : "rgba(91,76,255,0.15)" }}>
              {/* Banner dev */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10,
                backgroundColor: isDark ? "rgba(123,108,255,0.15)" : "rgba(91,76,255,0.10)",
                borderRadius: 12, padding: 10, marginBottom: 16 }}>
                <Ionicons name="code-slash-outline" size={18} color={c.accentPurple} />
                <Text style={{ color: c.accentPurple, fontSize: 12, fontWeight: "700", flex: 1 }}>
                  Zone développeur IA — Intégration en cours
                </Text>
              </View>
              {/* Grille 4×2 */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
                {AI_TOOLS.map(tool => (
                  <Pressable key={tool.id} onPress={() => handleAITool(tool.label)}
                    style={({ pressed }) => [{
                      width: "22%", alignItems: "center", gap: 6,
                    }, pressed && { opacity: 0.75 }]}>
                    <View style={{ width: 58, height: 58, borderRadius: 29,
                      backgroundColor: tool.color + "22", alignItems: "center", justifyContent: "center",
                      borderWidth: 1, borderColor: tool.color + "44", position: "relative" }}>
                      <Ionicons name={tool.icon as any} size={24} color={tool.color} />
                      <View style={{ position: "absolute", top: -4, right: -4, width: 18, height: 12,
                        borderRadius: 4, backgroundColor: c.accentPurple, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 7, fontWeight: "800" }}>AI</Text>
                      </View>
                    </View>
                    <Text style={{ color: c.textPrimary, fontSize: 10, fontWeight: "600", textAlign: "center" }}
                      numberOfLines={2}>{tool.label}</Text>
                  </Pressable>
                ))}
              </View>
            </LinearGradient>
          )}
        </View>

        {/* ── Outils de cours ── */}
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text style={{ color: c.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 14 }}>
            Outils de cours
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {COURSE_TOOLS.map(tool => (
              <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
                style={({ pressed }) => [{
                  width: "22%", alignItems: "center", gap: 6,
                }, pressed && { opacity: 0.75 }]}>
                <View style={{ width: 58, height: 58, borderRadius: 29,
                  backgroundColor: tool.color + "22", alignItems: "center", justifyContent: "center",
                  borderWidth: 1, borderColor: tool.color + "44" }}>
                  <Ionicons name={tool.icon as any} size={24} color={tool.color} />
                </View>
                <Text style={{ color: c.textPrimary, fontSize: 10, fontWeight: "600", textAlign: "center" }}
                  numberOfLines={2}>{tool.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Ouvrir Studio ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Pressable onPress={() => Alert.alert("Studio", "Le Studio sera disponible dans la prochaine version.")}
            style={({ pressed }) => [{ borderRadius: 18, overflow: "hidden" }, pressed && { opacity: 0.85 }]}>
            <LinearGradient colors={["#FF4500", "#FF6B35"]} style={{ height: 58, borderRadius: 18,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Ionicons name="musical-notes-outline" size={22} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>Ouvrir Studio</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export default CreatePageScreen;
