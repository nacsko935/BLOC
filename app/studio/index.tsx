import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, FlatList,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { useAuthStore } from "../../state/useAuthStore";
import { getAllCourses } from "../../src/features/courses/coursesRepo";
import { saveStudioWork, StudioWorkType } from "../../lib/services/studioService";
import type { Course } from "../../src/features/courses/coursesData";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "pick_tool" | "pick_course" | "input" | "generating" | "result" | "saving";

type Tool = {
  id: StudioWorkType;
  label: string;
  icon: string;
  color: string;
  description: string;
  beta?: boolean;
};

type QCMQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

// ── Outils disponibles (identique à NotebookLM) ───────────────────────────────

const TOOLS: Tool[] = [
  { id: "resume_audio",  label: "Résumé audio",    icon: "musical-notes",    color: "#5B8DEF", description: "Résumé narratif à écouter" },
  { id: "resume_video",  label: "Résumé vidéo",    icon: "videocam",         color: "#34C759", description: "Script de présentation vidéo" },
  { id: "rapport",       label: "Rapport",          icon: "document-text",   color: "#AF52DE", description: "Rapport structuré du cours" },
  { id: "carte_mentale", label: "Carte mentale",    icon: "git-network",     color: "#FF9500", description: "Carte mentale hiérarchique" },
  { id: "fiche",         label: "Fiches…",          icon: "layers",          color: "#FF6B6B", description: "Fiches de révision condensées" },
  { id: "qcm",           label: "Quiz",             icon: "help-circle",     color: "#7B6CFF", description: "QCM interactif avec correction" },
  { id: "infographie",   label: "Infographie",      icon: "bar-chart",       color: "#00C7BE", description: "Données clés visuelles", beta: true },
  { id: "tableau",       label: "Tableau de données",icon: "grid",           color: "#FFD700", description: "Synthèse en tableau structuré" },
];

// ── Appel Claude API ──────────────────────────────────────────────────────────

async function callClaude(prompt: string, system: string, maxTokens = 2000): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Clé API Anthropic manquante dans le fichier .env (EXPO_PUBLIC_ANTHROPIC_API_KEY).");
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erreur API (${resp.status})`);
  }
  const data = await resp.json();
  return data.content?.map((b: any) => b.text || "").join("") || "";
}

// ── Prompts par outil ─────────────────────────────────────────────────────────

function buildPrompt(tool: Tool, courseName: string, sourceText: string): { system: string; user: string } {
  const base = `Tu es un assistant pédagogique expert. La matière est : ${courseName}.`;
  switch (tool.id) {
    case "resume_audio":
      return {
        system: `${base} Génère un résumé narratif oral, fluide et agréable à écouter. Style podcast éducatif. Utilise des transitions naturelles. En français. 300-500 mots.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    case "resume_video":
      return {
        system: `${base} Génère un script de présentation vidéo structuré avec des slides. Format : [SLIDE 1 - Titre] puis contenu, [SLIDE 2 - Titre] etc. Max 8 slides. En français.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    case "rapport":
      return {
        system: `${base} Génère un rapport structuré professionnel avec : Introduction, Développement (3 sections), Conclusion, Points clés à retenir. En français. 400-600 mots.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    case "carte_mentale":
      return {
        system: `${base} Génère une carte mentale textuelle hiérarchique. Format strict :
CONCEPT CENTRAL
├── Branche 1
│   ├── Sous-branche 1.1
│   └── Sous-branche 1.2
├── Branche 2
│   ├── Sous-branche 2.1
│   └── Sous-branche 2.2
etc. Max 4 branches principales, 3 sous-branches chacune. En français.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    case "fiche":
      return {
        system: `${base} Génère des fiches de révision condensées. Format :
## FICHE 1 — [Titre]
**Définition :** ...
**Points clés :**
- ...
**À retenir :** ...

Génère 4-6 fiches maximum. En français.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    case "qcm":
      return {
        system: `${base} Génère exactement 6 questions QCM. Réponds UNIQUEMENT en JSON valide sans markdown :
{"questions":[{"question":"...","options":["A...","B...","C...","D..."],"correctIndex":0,"explanation":"..."}]}
Les mauvaises réponses doivent être plausibles. Explications pédagogiques.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    case "infographie":
      return {
        system: `${base} Génère une infographie textuelle avec des statistiques, chiffres clés et faits marquants. Format :
📊 INFOGRAPHIE — [Titre]

🔢 CHIFFRES CLÉS
• [chiffre 1] — [explication]
• [chiffre 2] — [explication]

📌 FAITS ESSENTIELS
• ...

🎯 CONCLUSION
...
En français.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    case "tableau":
      return {
        system: `${base} Génère un tableau de données structuré en markdown. Utilise le format :
| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| ...       | ...       | ...       |

Adapte les colonnes au contenu du cours. Minimum 5 lignes. En français.`,
        user: `Contenu du cours :\n${sourceText}`,
      };
    default:
      return { system: base, user: sourceText };
  }
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function StudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { user } = useAuthStore();
  const params = useLocalSearchParams<{ courseId?: string }>();

  const [step, setStep] = useState<Step>("pick_tool");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // QCM state
  const [questions, setQuestions] = useState<QCMQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [qcmDone, setQcmDone] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Charger les matières
  useEffect(() => {
    getAllCourses(user?.id).then(setCourses).catch(() => setCourses([]));
  }, [user?.id]);

  // Pré-sélectionner la matière si passée en params
  useEffect(() => {
    if (params.courseId && courses.length > 0) {
      const found = courses.find(c => c.id === params.courseId);
      if (found) setSelectedCourse(found);
    }
  }, [params.courseId, courses]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["text/plain", "application/pdf", "*/*"] });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFileInfo(asset.name);
        try {
          const resp = await fetch(asset.uri);
          const text = await resp.text();
          setSourceText(text.slice(0, 5000));
        } catch {
          setSourceText(`[Fichier: ${asset.name}] — Décris le contenu de ce fichier pour que l'IA puisse l'analyser.`);
        }
      }
    } catch { Alert.alert("Erreur", "Impossible d'ouvrir le fichier."); }
  };

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) { Alert.alert("Permission requise", "Autorise l'accès à ta galerie."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9 });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFileInfo(`📷 ${asset.fileName || "Image sélectionnée"}`);
        setSourceText(`[Image de cours importée depuis la galerie]
Nom: ${asset.fileName || "image"}
Dimensions: ${asset.width}×${asset.height}px

Analyse cette image de cours et génère le contenu demandé.`);
      }
    } catch { Alert.alert("Erreur", "Impossible d'ouvrir la galerie."); }
  };

  const takePhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) { Alert.alert("Permission requise", "Autorise l'accès à la caméra."); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
      if (!result.canceled && result.assets[0]) {
        setFileInfo("📸 Photo prise");
        setSourceText(`[Photo du cours prise avec la caméra]
L'IA va analyser le contenu visible sur la photo et générer le contenu demandé.`);
      }
    } catch { Alert.alert("Erreur", "Impossible d'ouvrir la caméra."); }
  };

  const generate = async () => {
    if (!sourceText.trim()) { Alert.alert("Contenu requis", "Ajoute du texte à analyser."); return; }
    if (!selectedCourse) { Alert.alert("Matière requise", "Sélectionne une matière."); return; }
    setStep("generating");
    try {
      const { system, user: userMsg } = buildPrompt(selectedTool!, selectedCourse.name, sourceText);
      const raw = await callClaude(userMsg, system, selectedTool?.id === "qcm" ? 1500 : 2500);

      if (selectedTool?.id === "qcm") {
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setQuestions(parsed.questions || []);
        setCurrentQ(0); setAnswers([]); setSelectedAnswer(null); setQcmDone(false);
      }
      setResult(raw);
      setStep("result");
      setSaveTitle(`${selectedTool!.label} — ${selectedCourse.name} — ${new Date().toLocaleDateString("fr-FR")}`);
    } catch (e: any) {
      setStep("input");
      Alert.alert("Erreur IA", e?.message || "Génération impossible. Vérifie ta clé API.");
    }
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    const correctCount = selectedTool?.id === "qcm"
      ? answers.filter((a, i) => a === questions[i]?.correctIndex).length
      : null;
    try {
      await saveStudioWork({
        courseId: selectedCourse.id,
        userId: user?.id ?? null,
        type: selectedTool!.id,
        title: saveTitle || `${selectedTool!.label} — ${selectedCourse.name}`,
        content: result,
        sourceText: sourceText.slice(0, 1000),
        score: correctCount,
        totalQuestions: selectedTool?.id === "qcm" ? questions.length : null,
      });
      Alert.alert("✅ Sauvegardé", `Ajouté dans "${selectedCourse.name}".`, [
        { text: "Voir la matière", onPress: () => router.push(`/course/${selectedCourse.id}` as any) },
        { text: "Nouveau", onPress: () => { setStep("pick_tool"); setResult(""); setSourceText(""); setFileInfo(null); setSelectedTool(null); } },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", "Impossible de sauvegarder.");
    } finally { setSaving(false); }
  };

  // QCM helpers
  const answerQ = (idx: number) => { if (selectedAnswer !== null) return; setSelectedAnswer(idx); };
  const nextQ = () => {
    const newAnswers = [...answers, selectedAnswer!];
    setAnswers(newAnswers);
    const prog = (currentQ + 1) / questions.length;
    Animated.timing(progressAnim, { toValue: prog, duration: 400, useNativeDriver: false }).start();
    if (currentQ + 1 >= questions.length) { setQcmDone(true); }
    else { setCurrentQ(v => v + 1); setSelectedAnswer(null); }
  };
  const correctCount = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const barWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  // ── STEP: pick_tool ──────────────────────────────────────────────────────────
  if (step === "pick_tool") {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <LinearGradient colors={["#0F0A2A", "#000"]} style={[s.header, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle}>Studio IA</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Text style={[s.stepTitle, { color: c.textPrimary }]}>Que veux-tu générer ?</Text>
          <Text style={{ color: c.textSecondary, fontSize: 14, marginBottom: 24 }}>
            Choisis un outil pour transformer ton cours en contenu utile.
          </Text>

          <View style={{ gap: 10 }}>
            {TOOLS.map(tool => (
              <Pressable
                key={tool.id}
                onPress={() => { setSelectedTool(tool); setStep(selectedCourse ? "input" : "pick_course"); }}
                style={({ pressed }) => [s.toolCard, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={[s.toolIconBox, { backgroundColor: tool.color + "22" }]}>
                  <Ionicons name={tool.icon as any} size={22} color={tool.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 15 }}>{tool.label}</Text>
                    {tool.beta && (
                      <View style={{ backgroundColor: "#FF9500", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }}>
                        <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>BÊTA</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>{tool.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── STEP: pick_course ────────────────────────────────────────────────────────
  if (step === "pick_course") {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <LinearGradient colors={["#0F0A2A", "#000"]} style={[s.header, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => setStep("pick_tool")} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle}>{selectedTool?.label}</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Text style={[s.stepTitle, { color: c.textPrimary }]}>Dans quelle matière ?</Text>
          <Text style={{ color: c.textSecondary, fontSize: 14, marginBottom: 20 }}>
            Le travail sera sauvegardé dans cette matière.
          </Text>

          {courses.length === 0 ? (
            <View style={{ alignItems: "center", gap: 14, paddingVertical: 40 }}>
              <Ionicons name="book-outline" size={44} color={c.textSecondary} />
              <Text style={{ color: c.textPrimary, fontWeight: "700" }}>Aucune matière créée</Text>
              <Pressable onPress={() => router.push("/(modals)/course-new" as any)}
                style={{ backgroundColor: c.accentPurple, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "800" }}>Créer une matière</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {courses.map(course => (
                <Pressable key={course.id} onPress={() => { setSelectedCourse(course); setStep("input"); }}
                  style={[s.courseRow, { backgroundColor: c.card, borderColor: c.border, borderLeftColor: course.color }]}>
                  <Text style={{ fontSize: 22 }}>{course.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 15 }}>{course.name}</Text>
                    <Text style={{ color: c.textSecondary, fontSize: 12 }}>{course.semester}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── STEP: input ──────────────────────────────────────────────────────────────
  if (step === "input") {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <LinearGradient colors={["#0F0A2A", "#000"]} style={[s.header, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => setStep("pick_course")} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>
            {selectedTool?.label} — {selectedCourse?.name}
          </Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
          <Text style={[s.stepTitle, { color: c.textPrimary }]}>Ajoute le contenu du cours</Text>
          <Text style={{ color: c.textSecondary, fontSize: 14, marginBottom: 20 }}>
            Colle ton texte, importe un fichier ou tape directement.
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
            <Pressable onPress={pickDocument} style={[s.importBtn, { borderColor: c.border, backgroundColor: c.card, flex: 1 }]}>
              <Ionicons name="document-attach-outline" size={18} color="#4DA3FF" />
              <Text style={{ color: "#4DA3FF", fontWeight: "700", fontSize: 13 }}>PDF / TXT</Text>
            </Pressable>
            <Pressable onPress={pickImage} style={[s.importBtn, { borderColor: c.border, backgroundColor: c.card, flex: 1 }]}>
              <Ionicons name="image-outline" size={18} color="#AF52DE" />
              <Text style={{ color: "#AF52DE", fontWeight: "700", fontSize: 13 }}>Galerie</Text>
            </Pressable>
            <Pressable onPress={takePhoto} style={[s.importBtn, { borderColor: c.border, backgroundColor: c.card, flex: 1 }]}>
              <Ionicons name="camera-outline" size={18} color="#FF9500" />
              <Text style={{ color: "#FF9500", fontWeight: "700", fontSize: 13 }}>Caméra</Text>
            </Pressable>
          </View>

          {fileInfo && (
            <View style={[s.fileChip, { backgroundColor: c.card, borderColor: "#34C759", marginTop: 10 }]}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={{ color: "#34C759", fontWeight: "700", fontSize: 13 }}>{fileInfo}</Text>
            </View>
          )}

          <Text style={{ color: c.textSecondary, fontSize: 13, textAlign: "center", marginVertical: 14 }}>— ou colle ton texte —</Text>

          <TextInput
            value={sourceText} onChangeText={setSourceText}
            multiline
            placeholder="Colle ici ton cours, tes notes, un chapitre…"
            placeholderTextColor={c.textSecondary}
            style={[s.bigInput, { borderColor: c.border, backgroundColor: c.card, color: c.textPrimary }]}
          />

          <Pressable onPress={generate} disabled={!sourceText.trim()} style={{ marginTop: 20, opacity: !sourceText.trim() ? 0.5 : 1 }}>
            <LinearGradient colors={["#8B7DFF", "#5040E0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
              <Ionicons name={selectedTool?.icon as any || "sparkles"} size={18} color="#fff" />
              <Text style={s.primaryBtnTxt}>Générer avec l'IA</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── STEP: generating ─────────────────────────────────────────────────────────
  if (step === "generating") {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center", gap: 20 }}>
        <ActivityIndicator size="large" color="#7B6CFF" />
        <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 18 }}>Génération en cours…</Text>
        <Text style={{ color: c.textSecondary, fontSize: 14 }}>
          L'IA analyse ton cours et crée {selectedTool?.label.toLowerCase()}
        </Text>
      </View>
    );
  }

  // ── STEP: result (QCM interactif) ────────────────────────────────────────────
  if (step === "result" && selectedTool?.id === "qcm" && questions.length > 0) {
    if (!qcmDone) {
      const q = questions[currentQ];
      return (
        <View style={{ flex: 1, backgroundColor: c.background }}>
          <LinearGradient colors={["#0F0A2A", "#000"]} style={[s.header, { paddingTop: insets.top + 14 }]}>
            <Pressable onPress={() => setStep("input")} style={s.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Quiz — {currentQ + 1}/{questions.length}</Text>
            <View style={{ width: 36 }} />
          </LinearGradient>
          <View style={{ height: 4, backgroundColor: c.cardAlt }}>
            <Animated.View style={{ height: 4, width: barWidth as any, backgroundColor: "#7B6CFF" }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
            <View style={[s.questionCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ color: c.textSecondary, fontSize: 12, fontWeight: "700", marginBottom: 8 }}>
                Question {currentQ + 1} sur {questions.length}
              </Text>
              <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "800", lineHeight: 26 }}>{q.question}</Text>
            </View>
            <View style={{ gap: 10, marginTop: 16 }}>
              {q.options.map((opt, i) => {
                let bg = c.card, border = c.border, textCol = c.textPrimary;
                if (selectedAnswer !== null) {
                  if (i === q.correctIndex) { bg = "#34C75918"; border = "#34C759"; textCol = "#34C759"; }
                  else if (i === selectedAnswer && i !== q.correctIndex) { bg = "#FF3B3018"; border = "#FF3B30"; textCol = "#FF3B30"; }
                }
                return (
                  <Pressable key={i} onPress={() => answerQ(i)} disabled={selectedAnswer !== null}
                    style={[s.optionCard, { backgroundColor: bg, borderColor: border }]}>
                    <View style={[s.optionLetter, {
                      backgroundColor: selectedAnswer !== null && i === q.correctIndex ? "#34C759"
                        : selectedAnswer !== null && i === selectedAnswer && i !== q.correctIndex ? "#FF3B30" : "#7B6CFF",
                    }]}>
                      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>{["A", "B", "C", "D"][i]}</Text>
                    </View>
                    <Text style={{ color: textCol, fontSize: 15, flex: 1, fontWeight: "600" }}>{opt}</Text>
                    {selectedAnswer !== null && i === q.correctIndex && <Ionicons name="checkmark-circle" size={20} color="#34C759" />}
                    {selectedAnswer !== null && i === selectedAnswer && i !== q.correctIndex && <Ionicons name="close-circle" size={20} color="#FF3B30" />}
                  </Pressable>
                );
              })}
            </View>
            {selectedAnswer !== null && (
              <View style={[s.explanationCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <Ionicons name="bulb-outline" size={16} color="#FF9500" />
                <Text style={{ color: c.textPrimary, fontSize: 14, lineHeight: 21, flex: 1 }}>{q.explanation}</Text>
              </View>
            )}
            {selectedAnswer !== null && (
              <Pressable onPress={nextQ} style={{ marginTop: 16 }}>
                <LinearGradient colors={["#8B7DFF", "#5040E0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                  <Text style={s.primaryBtnTxt}>{currentQ + 1 < questions.length ? "Question suivante →" : "Voir les résultats 🏆"}</Text>
                </LinearGradient>
              </Pressable>
            )}
          </ScrollView>
        </View>
      );
    }

    // Résultats QCM
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <LinearGradient colors={["#0F0A2A", "#000"]} style={[s.header, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="close" size={20} color="#fff" /></Pressable>
          <Text style={s.headerTitle}>Résultats</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 80, alignItems: "center" }}>
          <Text style={{ fontSize: 64, marginVertical: 12 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : pct >= 40 ? "📚" : "💪"}</Text>
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 4 }}>
            {pct >= 80 ? "Excellent !" : pct >= 60 ? "Bien joué !" : "Continue à réviser"}
          </Text>
          <View style={[s.scoreCard, { backgroundColor: "rgba(123,108,255,0.15)", borderColor: "rgba(123,108,255,0.35)" }]}>
            <Text style={{ color: "#8B7DFF", fontSize: 52, fontWeight: "900" }}>{pct}%</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>{correctCount} / {questions.length} bonnes réponses</Text>
          </View>
          <View style={{ width: "100%", gap: 12, marginTop: 24 }}>
            <Pressable onPress={() => setStep("saving")}>
              <LinearGradient colors={["#34C759", "#28A745"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={s.primaryBtnTxt}>Sauvegarder dans {selectedCourse?.name}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => { setCurrentQ(0); setAnswers([]); setSelectedAnswer(null); setQcmDone(false); }}
              style={[s.outlineBtn, { borderColor: c.border }]}>
              <Ionicons name="refresh" size={16} color={c.textPrimary} />
              <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 14 }}>Refaire le quiz</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── STEP: result (texte/autre) ───────────────────────────────────────────────
  if (step === "result") {
    const tool = selectedTool!;
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <LinearGradient colors={["#0F0A2A", "#000"]} style={[s.header, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => setStep("input")} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>{tool.label} généré</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {/* Chip matière */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <View style={[s.toolIconBox, { backgroundColor: tool.color + "22", width: 32, height: 32 }]}>
              <Ionicons name={tool.icon as any} size={16} color={tool.color} />
            </View>
            <Text style={{ color: c.textSecondary, fontSize: 13 }}>{selectedCourse?.name}</Text>
          </View>

          <View style={{ backgroundColor: c.card, borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 18, marginBottom: 20 }}>
            <Text style={{ color: c.textPrimary, fontSize: 14, lineHeight: 22 }}>{result}</Text>
          </View>

          <View style={{ gap: 12 }}>
            <Pressable onPress={() => setStep("saving")}>
              <LinearGradient colors={["#34C759", "#28A745"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={s.primaryBtnTxt}>Sauvegarder dans {selectedCourse?.name}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setStep("input")} style={[s.outlineBtn, { borderColor: c.border }]}>
              <Ionicons name="refresh" size={16} color={c.textPrimary} />
              <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 14 }}>Régénérer</Text>
            </Pressable>
            <Pressable onPress={() => { setStep("pick_tool"); setResult(""); setSourceText(""); setFileInfo(null); setSelectedTool(null); }}
              style={[s.outlineBtn, { borderColor: c.border }]}>
              <Text style={{ color: c.textSecondary, fontWeight: "600", fontSize: 14 }}>Nouveau Studio</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── STEP: saving ─────────────────────────────────────────────────────────────
  if (step === "saving") {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, padding: 24, paddingTop: insets.top + 20 }}>
        <Pressable onPress={() => setStep("result")} style={{ marginBottom: 20 }}>
          <Ionicons name="chevron-back" size={24} color={c.textPrimary} />
        </Pressable>
        <Text style={[s.stepTitle, { color: c.textPrimary }]}>Sauvegarder dans tes cours</Text>
        <Text style={{ color: c.textSecondary, fontSize: 14, marginBottom: 20 }}>
          Ce travail sera visible dans la matière "{selectedCourse?.name}".
        </Text>
        <TextInput
          value={saveTitle} onChangeText={setSaveTitle}
          placeholder={`${selectedTool?.label} — ${selectedCourse?.name}`}
          placeholderTextColor={c.textSecondary}
          style={[s.input, { borderColor: c.border, backgroundColor: c.card, color: c.textPrimary, marginBottom: 16 }]}
        />
        <Pressable onPress={handleSave} disabled={saving}>
          <LinearGradient colors={["#34C759", "#28A745"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
            {saving ? <ActivityIndicator color="#fff" /> : <>
              <Ionicons name="save" size={18} color="#fff" />
              <Text style={s.primaryBtnTxt}>Enregistrer</Text>
            </>}
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "800", flex: 1, textAlign: "center" },
  stepTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.3, marginBottom: 8 },
  toolCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  toolIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  courseRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, padding: 14 },
  importBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 14, justifyContent: "center" },
  fileChip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  input: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  bigInput: { minHeight: 220, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, textAlignVertical: "top", fontSize: 15 },
  primaryBtn: { height: 54, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  primaryBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
  outlineBtn: { height: 50, borderRadius: 16, borderWidth: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  questionCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
  optionCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1.5, padding: 14 },
  optionLetter: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  explanationCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 12 },
  scoreCard: { width: "100%", borderRadius: 24, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginTop: 12 },
});
