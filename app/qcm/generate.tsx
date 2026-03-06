import { useState, useRef } from "react";
import {
  ActivityIndicator, Alert, Animated, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Step = "subject" | "content" | "summary" | "quiz" | "result" | "saving";

type QCMQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const MATIERES = [
  { id:"math",  label:"Mathématiques",  icon:"📐", color:"#7B6CFF" },
  { id:"info",  label:"Informatique",   icon:"💻", color:"#4DA3FF" },
  { id:"phys",  label:"Physique",       icon:"⚛️", color:"#FF8C00" },
  { id:"eco",   label:"Économie",       icon:"📊", color:"#34C759" },
  { id:"hist",  label:"Histoire/Géo",   icon:"🌍", color:"#FF6B6B" },
  { id:"lang",  label:"Langues",        icon:"🗣️", color:"#AF52DE" },
  { id:"sci",   label:"Sciences",       icon:"🔬", color:"#00C7BE" },
  { id:"autre", label:"Autre matière",  icon:"📖", color:"#FFD700" },
];

async function callClaude(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clé API Anthropic manquante.\n\nAjoute dans ton fichier .env :\nEXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-..."
    );
  }
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
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

export default function GenerateQCMScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  const [step, setStep] = useState<Step>("subject");
  const [selectedSubject, setSelectedSubject] = useState<typeof MATIERES[0] | null>(null);
  const [customSubject, setCustomSubject] = useState("");
  const [courseText, setCourseText] = useState("");
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState<QCMQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");

  const progressAnim = useRef(new Animated.Value(0)).current;

  const subjectLabel = selectedSubject
    ? (selectedSubject.id === "autre" ? customSubject || "Autre" : selectedSubject.label)
    : "";

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["text/plain", "application/pdf"] });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFileInfo(asset.name);
        // Try to read text content from URI if possible
        try {
          const response = await fetch(asset.uri);
          const text = await response.text();
          setCourseText(text.slice(0, 4000));
        } catch {
          setCourseText(`[Document: ${asset.name}] — Fichier importé, contenu à analyser.`);
        }
      }
    } catch { Alert.alert("Erreur", "Impossible d'ouvrir le fichier."); }
  };

  const pickPhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) { Alert.alert("Permission requise", "Autorise l'accès à la caméra."); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
      if (!result.canceled && result.assets[0]) {
        setFileInfo("📸 Photo de cours");
        setCourseText("[Photo de cours prise] — L'IA va analyser le contenu de l'image et générer un résumé et des questions.");
      }
    } catch { Alert.alert("Erreur", "Impossible de prendre la photo."); }
  };

  const generateSummary = async () => {
    if (!courseText.trim()) { Alert.alert("Contenu requis", "Ajoute du contenu à analyser."); return; }
    setLoading(true);
    try {
      const result = await callClaude(
        `Matière: ${subjectLabel}\n\nContenu du cours:\n${courseText}`,
        `Tu es un assistant pédagogique expert. Génère un résumé clair et structuré du cours fourni en matière de ${subjectLabel}.
Le résumé doit:
- Commencer par les points clés (5-7 bullet points)
- Avoir des sections bien délimitées par des titres
- Être compréhensible et mémorisable pour un étudiant
- Être en français
- Faire entre 200 et 400 mots
Réponds uniquement avec le résumé formaté, sans introduction ni conclusion.`
      );
      setSummary(result);
      setStep("summary");
    } catch (e: any) {
      Alert.alert("Erreur IA", e?.message || "Impossible de générer le résumé.");
    } finally { setLoading(false); }
  };

  const generateQCM = async () => {
    setLoading(true);
    try {
      const result = await callClaude(
        `Matière: ${subjectLabel}\n\nRésumé du cours:\n${summary}`,
        `Tu es un assistant pédagogique expert. Génère exactement 5 questions QCM basées sur le résumé du cours de ${subjectLabel}.
Réponds UNIQUEMENT avec un JSON valide sans markdown ni backticks:
{"questions":[{"question":"...","options":["A...","B...","C...","D..."],"correctIndex":0,"explanation":"..."}]}
- correctIndex est l'index (0-3) de la bonne réponse
- Les questions doivent tester la compréhension réelle, pas juste la mémorisation
- Les options incorrectes doivent être plausibles
- L'explication doit être pédagogique`
      );
      const clean = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed.questions || []);
      setCurrentQ(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setStep("quiz");
      Animated.timing(progressAnim, { toValue: 0, duration: 0, useNativeDriver: false }).start();
    } catch (e: any) {
      Alert.alert("Erreur IA", "Impossible de générer le QCM. Réessaie.");
    } finally { setLoading(false); }
  };

  const answerQuestion = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
  };

  const nextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer!];
    setAnswers(newAnswers);
    const progress = (currentQ + 1) / questions.length;
    Animated.timing(progressAnim, { toValue: progress, duration: 400, useNativeDriver: false }).start();
    if (currentQ + 1 >= questions.length) {
      setAnswers(newAnswers);
      setStep("result");
    } else {
      setCurrentQ(v => v + 1);
      setSelectedAnswer(null);
    }
  };

  const saveToNotes = async () => {
    const title = saveTitle.trim() || `${subjectLabel} — ${new Date().toLocaleDateString("fr-FR")}`;
    const key = `bloc.notes.${Date.now()}`;
    const note = {
      id: key,
      title,
      subject: subjectLabel,
      summary,
      score: correctCount,
      total: questions.length,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(note));
    const index = JSON.parse(await AsyncStorage.getItem("bloc.notes.index") || "[]");
    index.push(key);
    await AsyncStorage.setItem("bloc.notes.index", JSON.stringify(index));
    Alert.alert("✅ Sauvegardé", `"${title}" ajouté à tes notes.`, [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  const correctCount = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const scorePct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const barWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  // ── SUBJECT SELECTION ──────────────────────────────────────────────────────
  if (step === "subject") {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <LinearGradient colors={["#1A0A3B","#000"]} style={[s.header,{paddingTop:insets.top+14}]}>
          <Pressable onPress={()=>router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff"/>
          </Pressable>
          <Text style={s.headerTitle}>BLOC IA — Cours</Text>
          <View style={{width:36}}/>
        </LinearGradient>
        <ScrollView contentContainerStyle={{padding:20,paddingBottom:60}}>
          <Text style={[s.stepTitle,{color:c.textPrimary}]}>Dans quelle matière travailles-tu ?</Text>
          <Text style={{color:c.textSecondary,fontSize:15,marginBottom:24}}>
            L'IA va adapter le résumé et les questions à ta matière.
          </Text>
          <View style={{flexDirection:"row",flexWrap:"wrap",gap:12}}>
            {MATIERES.map(m=>(
              <Pressable key={m.id} onPress={()=>setSelectedSubject(m)}
                style={[s.subjectCard,{
                  borderColor:selectedSubject?.id===m.id?m.color:c.border,
                  backgroundColor:selectedSubject?.id===m.id?m.color+"18":c.card,
                }]}>
                <Text style={{fontSize:28}}>{m.icon}</Text>
                <Text style={{color:selectedSubject?.id===m.id?m.color:c.textPrimary,fontWeight:"700",fontSize:13,textAlign:"center"}}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {selectedSubject?.id==="autre"&&(
            <TextInput value={customSubject} onChangeText={setCustomSubject}
              placeholder="Précise la matière..." placeholderTextColor={c.textSecondary}
              style={[s.input,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary,marginTop:16}]}/>
          )}
          <Pressable onPress={()=>setStep("content")}
            disabled={!selectedSubject||(selectedSubject.id==="autre"&&!customSubject.trim())}
            style={{marginTop:24,opacity:(!selectedSubject||(selectedSubject?.id==="autre"&&!customSubject.trim()))?0.4:1}}>
            <LinearGradient colors={["#8B7DFF","#5040E0"]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.primaryBtn}>
              <Text style={s.primaryBtnTxt}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff"/>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── CONTENT INPUT ──────────────────────────────────────────────────────────
  if (step === "content") {
    return (
      <View style={{flex:1,backgroundColor:c.background}}>
        <LinearGradient colors={["#1A0A3B","#000"]} style={[s.header,{paddingTop:insets.top+14}]}>
          <Pressable onPress={()=>setStep("subject")} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff"/>
          </Pressable>
          <Text style={s.headerTitle}>{selectedSubject?.icon} {subjectLabel}</Text>
          <View style={{width:36}}/>
        </LinearGradient>
        <ScrollView contentContainerStyle={{padding:20,paddingBottom:60}}>
          <Text style={[s.stepTitle,{color:c.textPrimary}]}>Ajoute le contenu du cours</Text>
          <Text style={{color:c.textSecondary,fontSize:14,marginBottom:20}}>
            Upload un fichier, prends une photo de tes notes, ou colle ton texte de cours.
          </Text>

          <View style={{flexDirection:"row",gap:10,marginBottom:16}}>
            <Pressable onPress={pickDocument} style={[s.importBtn,{borderColor:c.border,backgroundColor:c.card}]}>
              <Ionicons name="document-outline" size={22} color="#4DA3FF"/>
              <Text style={{color:"#4DA3FF",fontWeight:"700",fontSize:13}}>Fichier PDF/TXT</Text>
            </Pressable>
            <Pressable onPress={pickPhoto} style={[s.importBtn,{borderColor:c.border,backgroundColor:c.card}]}>
              <Ionicons name="camera-outline" size={22} color="#FF8C00"/>
              <Text style={{color:"#FF8C00",fontWeight:"700",fontSize:13}}>Photo de cours</Text>
            </Pressable>
          </View>

          {fileInfo&&(
            <View style={[s.fileChip,{backgroundColor:c.card,borderColor:"#34C759"}]}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759"/>
              <Text style={{color:"#34C759",fontWeight:"700",fontSize:13}}>{fileInfo}</Text>
            </View>
          )}

          <Text style={{color:c.textSecondary,fontSize:13,textAlign:"center",marginVertical:14}}>— ou colle ton texte —</Text>

          <TextInput value={courseText} onChangeText={setCourseText}
            multiline placeholder="Colle ici le contenu de ton cours, tes notes, ou un chapitre de livre..."
            placeholderTextColor={c.textSecondary}
            style={[s.bigInput,{borderColor:c.border,backgroundColor:c.card,color:c.textPrimary}]}/>

          <Pressable onPress={generateSummary} disabled={loading||!courseText.trim()}
            style={{marginTop:20,opacity:loading||!courseText.trim()?0.5:1}}>
            <LinearGradient colors={["#8B7DFF","#5040E0"]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.primaryBtn}>
              {loading?<ActivityIndicator color="#fff"/>:<>
                <Ionicons name="sparkles" size={18} color="#fff"/>
                <Text style={s.primaryBtnTxt}>Générer le résumé IA</Text>
              </>}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  if (step === "summary") {
    return (
      <View style={{flex:1,backgroundColor:c.background}}>
        <LinearGradient colors={["#1A0A3B","#000"]} style={[s.header,{paddingTop:insets.top+14}]}>
          <Pressable onPress={()=>setStep("content")} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff"/>
          </Pressable>
          <Text style={s.headerTitle}>Résumé IA — {subjectLabel}</Text>
          <View style={{width:36}}/>
        </LinearGradient>
        <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}}>
          <Text style={[s.stepTitle,{color:c.textPrimary}]}>📖 Résumé de ton cours</Text>
          <Text style={{color:c.textSecondary,fontSize:13,marginBottom:16}}>
            Lis ce résumé avant de passer le QCM.
          </Text>
          <View style={{backgroundColor:c.card,borderRadius:20,borderWidth:1,borderColor:c.border,padding:18,marginBottom:20}}>
            <Text style={{color:c.textPrimary,fontSize:15,lineHeight:24}}>{summary}</Text>
          </View>
          <View style={{gap:12}}>
            <Pressable onPress={generateQCM} disabled={loading}>
              <LinearGradient colors={["#8B7DFF","#5040E0"]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.primaryBtn}>
                {loading?<ActivityIndicator color="#fff"/>:<>
                  <Ionicons name="flash" size={18} color="#fff"/>
                  <Text style={s.primaryBtnTxt}>Passer le QCM</Text>
                </>}
              </LinearGradient>
            </Pressable>
            <Pressable onPress={()=>setStep("saving")}
              style={[s.outlineBtn,{borderColor:"#34C759"}]}>
              <Ionicons name="save-outline" size={16} color="#34C759"/>
              <Text style={{color:"#34C759",fontWeight:"700",fontSize:14}}>Sauvegarder ce résumé</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── SAVE SUMMARY ───────────────────────────────────────────────────────────
  if (step === "saving") {
    return (
      <View style={{flex:1,backgroundColor:c.background,padding:24,paddingTop:insets.top+20}}>
        <Pressable onPress={()=>setStep("summary")} style={{marginBottom:20}}>
          <Ionicons name="chevron-back" size={24} color={c.textPrimary}/>
        </Pressable>
        <Text style={[s.stepTitle,{color:c.textPrimary}]}>Sauvegarder dans mes cours</Text>
        <TextInput value={saveTitle} onChangeText={setSaveTitle}
          placeholder={`${subjectLabel} — ${new Date().toLocaleDateString("fr-FR")}`}
          placeholderTextColor={c.textSecondary}
          style={[s.input,{borderColor:c.border,backgroundColor:c.card,color:c.textPrimary,marginTop:20,marginBottom:16}]}/>
        <Pressable onPress={saveToNotes}>
          <LinearGradient colors={["#34C759","#28A745"]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.primaryBtn}>
            <Ionicons name="save" size={18} color="#fff"/>
            <Text style={s.primaryBtnTxt}>Enregistrer</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  // ── QUIZ ────────────────────────────────────────────────────────────────────
  if (step === "quiz" && questions.length > 0) {
    const q = questions[currentQ];
    const total = questions.length;
    return (
      <View style={{flex:1,backgroundColor:c.background}}>
        <LinearGradient colors={["#1A0A3B","#000"]} style={[s.header,{paddingTop:insets.top+14}]}>
          <Pressable onPress={()=>setStep("summary")} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff"/>
          </Pressable>
          <Text style={s.headerTitle}>QCM — {currentQ+1}/{total}</Text>
          <View style={{width:36}}/>
        </LinearGradient>

        {/* Progress bar */}
        <View style={{height:4,backgroundColor:c.cardAlt}}>
          <Animated.View style={{height:4,width:barWidth as any,backgroundColor:"#7B6CFF"}}/>
        </View>

        <ScrollView contentContainerStyle={{padding:20,paddingBottom:80}}>
          <View style={[s.questionCard,{backgroundColor:c.card,borderColor:c.border}]}>
            <Text style={{color:c.textSecondary,fontSize:12,fontWeight:"700",marginBottom:8}}>
              Question {currentQ+1} sur {total}
            </Text>
            <Text style={{color:c.textPrimary,fontSize:18,fontWeight:"800",lineHeight:26}}>{q.question}</Text>
          </View>

          <View style={{gap:10,marginTop:16}}>
            {q.options.map((opt, i) => {
              let bg = c.card, border = c.border, textCol = c.textPrimary;
              if (selectedAnswer !== null) {
                if (i === q.correctIndex) { bg="#34C75918"; border="#34C759"; textCol="#34C759"; }
                else if (i === selectedAnswer && i !== q.correctIndex) { bg="#FF3B3018"; border="#FF3B30"; textCol="#FF3B30"; }
              } else if (selectedAnswer === null) {
                // hoverable
              }
              return (
                <Pressable key={i} onPress={()=>answerQuestion(i)} disabled={selectedAnswer!==null}
                  style={[s.optionCard,{backgroundColor:bg,borderColor:border}]}>
                  <View style={[s.optionLetter,{
                    backgroundColor:selectedAnswer!==null&&i===q.correctIndex?"#34C759":
                      selectedAnswer!==null&&i===selectedAnswer&&i!==q.correctIndex?"#FF3B30":"#7B6CFF",
                  }]}>
                    <Text style={{color:"#fff",fontWeight:"900",fontSize:13}}>
                      {["A","B","C","D"][i]}
                    </Text>
                  </View>
                  <Text style={{color:textCol,fontSize:15,flex:1,fontWeight:"600"}}>{opt}</Text>
                  {selectedAnswer!==null&&i===q.correctIndex&&<Ionicons name="checkmark-circle" size={20} color="#34C759"/>}
                  {selectedAnswer!==null&&i===selectedAnswer&&i!==q.correctIndex&&<Ionicons name="close-circle" size={20} color="#FF3B30"/>}
                </Pressable>
              );
            })}
          </View>

          {selectedAnswer!==null&&(
            <View style={[s.explanationCard,{backgroundColor:c.card,borderColor:c.border}]}>
              <Ionicons name="bulb-outline" size={16} color="#FF9500"/>
              <Text style={{color:c.textPrimary,fontSize:14,lineHeight:21,flex:1}}>{q.explanation}</Text>
            </View>
          )}

          {selectedAnswer!==null&&(
            <Pressable onPress={nextQuestion} style={{marginTop:16}}>
              <LinearGradient colors={["#8B7DFF","#5040E0"]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.primaryBtn}>
                <Text style={s.primaryBtnTxt}>
                  {currentQ+1<total?"Question suivante →":"Voir mes résultats 🏆"}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (step === "result") {
    const emoji = scorePct>=80?"🏆":scorePct>=60?"⭐":scorePct>=40?"📚":"💪";
    const msg = scorePct>=80?"Excellent travail !":scorePct>=60?"Bien joué !":scorePct>=40?"Continue à réviser":
      "Il faut retravailler ce cours";
    return (
      <View style={{flex:1,backgroundColor:c.background}}>
        <LinearGradient colors={["#1A0A3B","#000"]} style={[s.header,{paddingTop:insets.top+14}]}>
          <Pressable onPress={()=>router.back()} style={s.backBtn}>
            <Ionicons name="close" size={20} color="#fff"/>
          </Pressable>
          <Text style={s.headerTitle}>Résultats</Text>
          <View style={{width:36}}/>
        </LinearGradient>
        <ScrollView contentContainerStyle={{padding:24,paddingBottom:80,alignItems:"center"}}>
          <Text style={{fontSize:72,marginVertical:16}}>{emoji}</Text>
          <Text style={{color:"#fff",fontSize:28,fontWeight:"900",textAlign:"center"}}>{msg}</Text>
          <View style={[s.scoreCard,{backgroundColor:"rgba(123,108,255,0.15)",borderColor:"rgba(123,108,255,0.35)"}]}>
            <Text style={{color:"#8B7DFF",fontSize:56,fontWeight:"900"}}>{scorePct}%</Text>
            <Text style={{color:"rgba(255,255,255,0.6)",fontSize:16}}>
              {correctCount} / {questions.length} bonnes réponses
            </Text>
            <Text style={{color:"#7B6CFF",fontWeight:"700",fontSize:14,marginTop:4}}>
              Matière: {subjectLabel}
            </Text>
          </View>

          {/* Per-question recap */}
          <View style={{width:"100%",gap:8,marginTop:20}}>
            {questions.map((q,i)=>{
              const correct = answers[i]===q.correctIndex;
              return (
                <View key={i} style={[s.recapCard,{
                  backgroundColor:correct?"#34C75912":"#FF3B3012",
                  borderColor:correct?"#34C75940":"#FF3B3040",
                }]}>
                  <Ionicons name={correct?"checkmark-circle":"close-circle"} size={18}
                    color={correct?"#34C759":"#FF3B30"}/>
                  <Text style={{color:c.textPrimary,fontSize:13,flex:1,lineHeight:18}}>{q.question}</Text>
                </View>
              );
            })}
          </View>

          <View style={{width:"100%",gap:12,marginTop:24}}>
            <Pressable onPress={()=>setStep("saving")}>
              <LinearGradient colors={["#34C759","#28A745"]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.primaryBtn}>
                <Ionicons name="save-outline" size={18} color="#fff"/>
                <Text style={s.primaryBtnTxt}>Sauvegarder dans mes cours</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={()=>{setStep("quiz");setCurrentQ(0);setAnswers([]);setSelectedAnswer(null);}}
              style={[s.outlineBtn,{borderColor:c.border}]}>
              <Ionicons name="refresh-outline" size={16} color={c.textPrimary}/>
              <Text style={{color:c.textPrimary,fontWeight:"700",fontSize:14}}>Refaire le QCM</Text>
            </Pressable>
            <Pressable onPress={()=>router.back()} style={[s.outlineBtn,{borderColor:c.border}]}>
              <Text style={{color:c.textSecondary,fontWeight:"600",fontSize:14}}>Terminer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:16,paddingBottom:16},
  backBtn:{width:36,height:36,borderRadius:18,backgroundColor:"rgba(255,255,255,0.12)",alignItems:"center",justifyContent:"center"},
  headerTitle:{color:"#fff",fontSize:17,fontWeight:"800"},
  stepTitle:{fontSize:22,fontWeight:"900",letterSpacing:-0.3,marginBottom:8},
  subjectCard:{width:"45%",padding:16,borderRadius:18,borderWidth:1.5,alignItems:"center",gap:8},
  importBtn:{flex:1,flexDirection:"row",alignItems:"center",gap:8,borderRadius:14,borderWidth:1,padding:14,justifyContent:"center"},
  fileChip:{flexDirection:"row",alignItems:"center",gap:8,borderRadius:10,borderWidth:1,padding:10},
  input:{minHeight:48,borderRadius:14,borderWidth:1,paddingHorizontal:14,fontSize:15},
  bigInput:{minHeight:200,borderRadius:16,borderWidth:1,paddingHorizontal:16,paddingVertical:14,textAlignVertical:"top",fontSize:15},
  primaryBtn:{height:54,borderRadius:16,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:10},
  primaryBtnTxt:{color:"#fff",fontWeight:"800",fontSize:16},
  outlineBtn:{height:50,borderRadius:16,borderWidth:1.5,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},
  questionCard:{borderRadius:20,borderWidth:1,padding:20,marginBottom:4},
  optionCard:{flexDirection:"row",alignItems:"center",gap:12,borderRadius:16,borderWidth:1.5,padding:14},
  optionLetter:{width:30,height:30,borderRadius:10,alignItems:"center",justifyContent:"center"},
  explanationCard:{flexDirection:"row",alignItems:"flex-start",gap:10,borderRadius:14,borderWidth:1,padding:14,marginTop:12},
  scoreCard:{width:"100%",borderRadius:24,borderWidth:1,padding:24,alignItems:"center",gap:8,marginTop:12},
  recapCard:{flexDirection:"row",alignItems:"flex-start",gap:10,borderRadius:12,borderWidth:1,padding:12},
});
