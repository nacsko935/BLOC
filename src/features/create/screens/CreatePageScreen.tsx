import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, Easing,
  FlatList, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text,
  TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";

// ── Outils IA avancés (bien plus puissants que le Studio cours) ───────────────

const POWER_TOOLS = [
  {
    id: "chat",
    label: "Chat avec Claude",
    icon: "chatbubble-ellipses",
    color: "#7B6CFF",
    gradient: ["#7B6CFF", "#5040E0"] as [string, string],
    description: "Pose n'importe quelle question à Claude",
    badge: "IA",
  },
  {
    id: "explain",
    label: "Explique-moi",
    icon: "bulb",
    color: "#FF9500",
    gradient: ["#FF9500", "#E67E00"] as [string, string],
    description: "Comprendre un concept difficile",
    badge: null,
  },
  {
    id: "correct",
    label: "Corrige mon texte",
    icon: "checkmark-circle",
    color: "#34C759",
    gradient: ["#34C759", "#28A745"] as [string, string],
    description: "Orthographe, grammaire, style",
    badge: null,
  },
  {
    id: "translate",
    label: "Traducteur IA",
    icon: "language",
    color: "#FF2D55",
    gradient: ["#FF2D55", "#C0182A"] as [string, string],
    description: "Traduis dans n'importe quelle langue",
    badge: null,
  },
  {
    id: "plan",
    label: "Plan de cours",
    icon: "list",
    color: "#AF52DE",
    gradient: ["#AF52DE", "#8B3FC2"] as [string, string],
    description: "Structure un cours complet",
    badge: null,
  },
  {
    id: "oral",
    label: "Prépare l'oral",
    icon: "mic-circle",
    color: "#00C7BE",
    gradient: ["#00C7BE", "#009A93"] as [string, string],
    description: "Arguments, plan, exemples",
    badge: null,
  },
  {
    id: "math",
    label: "Résous ce problème",
    icon: "calculator",
    color: "#4DA3FF",
    gradient: ["#4DA3FF", "#2980FF"] as [string, string],
    description: "Maths, physique, logique",
    badge: null,
  },
  {
    id: "essay",
    label: "Rédige un essai",
    icon: "document-text",
    color: "#FF6B6B",
    gradient: ["#FF6B6B", "#E63535"] as [string, string],
    description: "Introduction, développement, conclusion",
    badge: null,
  },
];

const QUICK_TOOLS = [
  { id: "flash", label: "Flashcards", icon: "layers-outline", color: "#007AFF", route: "/(modals)/flashcards" },
  { id: "pomo",  label: "Pomodoro",   icon: "timer-outline",  color: "#FF9500", route: "/(modals)/pomodoro" },
  { id: "dead",  label: "Deadlines",  icon: "calendar-outline", color: "#34C759", route: "/(modals)/deadlines" },
  { id: "quiz",  label: "Quiz",       icon: "help-circle-outline", color: "#7B6CFF", route: "/studio" },
  { id: "notes", label: "Note",       icon: "pencil-outline",  color: "#AF52DE", route: "/(modals)/note-new" },
  { id: "prog",  label: "Progression",icon: "trending-up-outline", color: "#00C7BE", route: "/progress" },
];

// ── Prompts système par outil ─────────────────────────────────────────────────

function getSystemPrompt(toolId: string): string {
  switch (toolId) {
    case "chat":
      return "Tu es Claude, un assistant IA intelligent et bienveillant. Réponds de façon claire, précise et utile en français. Tu peux parler de n'importe quel sujet.";
    case "explain":
      return "Tu es un professeur expert. Explique le concept demandé de façon claire, avec des exemples concrets et des analogies. Utilise un langage accessible. Réponds en français.";
    case "correct":
      return "Tu es un correcteur professionnel. Corrige l'orthographe, la grammaire et le style du texte fourni. Donne la version corrigée puis explique les principales corrections. Réponds en français.";
    case "translate":
      return "Tu es un traducteur expert. Traduis le texte fourni dans la langue demandée avec précision et naturel. Si la langue cible n'est pas précisée, traduis en anglais.";
    case "plan":
      return "Tu es un expert en pédagogie. Crée un plan de cours détaillé et structuré sur le sujet demandé. Inclus : objectifs, plan en parties et sous-parties, ressources suggérées. Réponds en français.";
    case "oral":
      return "Tu es un coach en prise de parole. Aide à préparer un oral avec : plan structuré, arguments clés, exemples percutants, introduction et conclusion mémorables. Réponds en français.";
    case "math":
      return "Tu es un tuteur expert en sciences. Résous le problème étape par étape avec des explications claires. Montre le raisonnement complet. Réponds en français.";
    case "essay":
      return "Tu es un expert en rédaction académique. Rédige un essai structuré et argumenté sur le sujet demandé. Format : introduction avec problématique, 2-3 parties développées, conclusion. Réponds en français.";
    default:
      return "Tu es Claude, un assistant IA. Réponds de façon utile et précise en français.";
  }
}

async function callClaude(messages: { role: "user" | "assistant"; content: string }[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Clé API Anthropic manquante. Ajoute EXPO_PUBLIC_ANTHROPIC_API_KEY dans ton fichier .env");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages,
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erreur API (${resp.status})`);
  }
  const data = await resp.json();
  return data.content?.map((b: any) => b.text || "").join("") || "";
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; loading?: boolean };
type ActiveTool = typeof POWER_TOOLS[0] | null;

// ── Composant principal ───────────────────────────────────────────────────────

export function CreatePageScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark } = useTheme();

  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);

  const listRef     = useRef<FlatList>(null);
  const enterOpacity    = useRef(new Animated.Value(0)).current;
  const enterTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity,    { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(enterTranslateY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const openTool = (tool: typeof POWER_TOOLS[0]) => {
    setActiveTool(tool);
    setMessages([]);
    setInput("");
    // Message d'accueil
    const welcomes: Record<string, string> = {
      chat:      "Bonjour ! Je suis Claude. Tu peux me poser n'importe quelle question — je suis là pour t'aider 👋",
      explain:   "Quel concept veux-tu que j'explique ? Donne-moi un sujet et je vais te l'expliquer clairement avec des exemples.",
      correct:   "Colle ton texte et je vais le corriger : orthographe, grammaire, style et clarté.",
      translate: "Envoie-moi le texte à traduire. Précise la langue cible si besoin (ex: \"traduis en anglais\").",
      plan:      "Sur quel sujet veux-tu que je construise un plan de cours ? Précise le niveau si besoin.",
      oral:      "Pour quel sujet prépares-tu ton oral ? Je vais t'aider à structurer et argumenter.",
      math:      "Envoie-moi le problème à résoudre. Je vais l'expliquer étape par étape.",
      essay:     "Sur quel sujet veux-tu que je rédige un essai ? Précise le niveau et la longueur souhaitée.",
    };
    const welcome = welcomes[tool.id] || "Comment puis-je t'aider ?";
    setMessages([{ id: "welcome", role: "assistant", content: welcome }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !activeTool) return;
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: "user", content: input.trim() };
    const loadingMsg: ChatMessage = { id: `l${Date.now()}`, role: "assistant", content: "", loading: true };
    const currentInput = input.trim();
    setInput("");
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setSending(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Construire l'historique sans le message welcome et sans loading
      const history = [...messages, userMsg]
        .filter(m => m.id !== "welcome" && !m.loading)
        .map(m => ({ role: m.role, content: m.content }));

      const reply = await callClaude(history, getSystemPrompt(activeTool.id));
      setMessages(prev => prev.map(m => m.id === loadingMsg.id
        ? { ...m, content: reply, loading: false }
        : m
      ));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setMessages(prev => prev.filter(m => m.id !== loadingMsg.id));
      Alert.alert("Erreur", e?.message || "Impossible de contacter Claude.");
    } finally {
      setSending(false);
    }
  };

  // ── Vue chat (outil actif) ────────────────────────────────────────────────

  if (activeTool) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        {/* Header */}
        <LinearGradient colors={["#1A0A3B", "#000"]}
          style={{ paddingTop: insets.top + 14, paddingHorizontal: 16, paddingBottom: 14,
            flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => setActiveTool(null)}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          <LinearGradient colors={activeTool.gradient}
            style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={activeTool.icon as any} size={18} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>{activeTool.label}</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{activeTool.description}</Text>
          </View>
          <Pressable onPress={() => { setMessages([]); openTool(activeTool); }}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="refresh" size={16} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </LinearGradient>

        {/* Messages */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{
                alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}>
                {item.loading ? (
                  <View style={{ backgroundColor: c.card, borderRadius: 18, borderBottomLeftRadius: 4,
                    padding: 14, borderWidth: 1, borderColor: c.border }}>
                    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                      {[0,1,2].map(i => (
                        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#7B6CFF", opacity: 0.6 + i * 0.2 }} />
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={{
                    backgroundColor: item.role === "user" ? "#7B6CFF" : c.card,
                    borderRadius: 18,
                    borderBottomRightRadius: item.role === "user" ? 4 : 18,
                    borderBottomLeftRadius: item.role === "assistant" ? 4 : 18,
                    padding: 14,
                    borderWidth: item.role === "assistant" ? 1 : 0,
                    borderColor: c.border,
                  }}>
                    <Text style={{ color: item.role === "user" ? "#fff" : c.textPrimary, fontSize: 14, lineHeight: 21 }}>
                      {item.content}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />

          {/* Input */}
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10,
            paddingHorizontal: 16, paddingVertical: 12,
            borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.background }}>
            <TextInput
              value={input} onChangeText={setInput}
              placeholder={activeTool.id === "chat" ? "Écris ton message…" : "Tape ici…"}
              placeholderTextColor={c.textSecondary}
              multiline
              onSubmitEditing={sendMessage}
              style={{ flex: 1, backgroundColor: c.cardAlt, borderRadius: 20, borderWidth: 1,
                borderColor: c.border, color: c.textPrimary, paddingHorizontal: 16, paddingVertical: 10,
                fontSize: 15, maxHeight: 120 }}
            />
            <Pressable onPress={sendMessage} disabled={!input.trim() || sending}
              style={{ width: 44, height: 44, borderRadius: 22,
                backgroundColor: !input.trim() || sending ? c.cardAlt : "#7B6CFF",
                alignItems: "center", justifyContent: "center" }}>
              {sending
                ? <ActivityIndicator size="small" color="#7B6CFF" />
                : <Ionicons name="send" size={18} color={!input.trim() ? c.textSecondary : "#fff"} />
              }
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── Vue principale ────────────────────────────────────────────────────────

  return (
    <Animated.View style={{ flex: 1, backgroundColor: c.background,
      opacity: enterOpacity, transform: [{ translateY: enterTranslateY }] }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <LinearGradient colors={isDark ? ["#1A0A3B", "#000"] : ["#EDE9FE", "#fff"]}
          style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <LinearGradient colors={["#7B6CFF", "#5040E0"]}
              style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="sparkles" size={22} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ color: c.textPrimary, fontSize: 26, fontWeight: "900", letterSpacing: -0.5 }}>BLOC IA</Text>
              <Text style={{ color: c.textSecondary, fontSize: 13 }}>Ton assistant personnel propulsé par Claude</Text>
            </View>
          </View>

          {/* Bouton Chat rapide */}
          <Pressable onPress={() => openTool(POWER_TOOLS[0])}
            style={({ pressed }) => [{ borderRadius: 18, overflow: "hidden", opacity: pressed ? 0.9 : 1 }]}>
            <LinearGradient colors={["#7B6CFF", "#5040E0", "#3A2BB0"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 18 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>Chat avec Claude</Text>
                  <View style={{ backgroundColor: "#34C759", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                    flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" }} />
                    <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>EN LIGNE</Text>
                  </View>
                </View>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 16 }}>
                  Pose n'importe quelle question — Claude répond instantanément
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* Outils puissants */}
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 20,
          borderBottomWidth: 1, borderBottomColor: c.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "900" }}>Outils IA avancés</Text>
            <View style={{ backgroundColor: "rgba(123,108,255,0.18)", borderRadius: 8, borderWidth: 1,
              borderColor: "rgba(123,108,255,0.35)", paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: "#7B6CFF", fontSize: 10, fontWeight: "800" }}>CLAUDE SONNET</Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {POWER_TOOLS.filter(t => t.id !== "chat").map(tool => (
              <Pressable key={tool.id} onPress={() => openTool(tool)}
                style={({ pressed }) => [{
                  flexDirection: "row", alignItems: "center", gap: 14,
                  backgroundColor: c.card, borderRadius: 16, borderWidth: 1,
                  borderColor: c.border, padding: 14, opacity: pressed ? 0.85 : 1,
                }]}>
                <LinearGradient colors={tool.gradient}
                  style={{ width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={tool.icon as any} size={20} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 15 }}>{tool.label}</Text>
                  <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>{tool.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Outils rapides */}
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "900", marginBottom: 14 }}>Outils rapides</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {QUICK_TOOLS.map(tool => (
              <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
                style={({ pressed }) => [{
                  width: "30%", alignItems: "center", gap: 8,
                  backgroundColor: c.card, borderRadius: 16, borderWidth: 1,
                  borderColor: c.border, padding: 14, opacity: pressed ? 0.8 : 1,
                }]}>
                <View style={{ width: 44, height: 44, borderRadius: 13,
                  backgroundColor: tool.color + "22", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={tool.icon as any} size={22} color={tool.color} />
                </View>
                <Text style={{ color: c.textPrimary, fontSize: 12, fontWeight: "700", textAlign: "center" }}>
                  {tool.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({});

export default CreatePageScreen;
