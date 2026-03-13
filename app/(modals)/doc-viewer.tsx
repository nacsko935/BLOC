import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Animated, Linking,
  Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { getSupabaseOrThrow } from "../../lib/supabase";

function asStr(v: string | string[] | undefined, fallback = "") {
  return Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);
}

// Dummy QCM questions when a post has type=qcm but no real question data
const DEMO_QCM = [
  { q: "Quelle est la commande Git pour créer une branche ?", choices: ["git new", "git branch", "git checkout -b", "git fork"], answer: 2 },
  { q: "Que fait `git stash` ?", choices: ["Supprime les commits", "Sauvegarde les modifs locales", "Fusionne deux branches", "Rebase la branche"], answer: 1 },
  { q: "Quel mot-clé TypeScript déclare un type générique ?", choices: ["any", "generic", "<T>", "typeof"], answer: 2 },
];

function QcmView({ c }: { c: any }) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? DEMO_QCM.filter((q, i) => selected[i] === q.answer).length
    : 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 60 }}>
      <View style={{ alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Ionicons name="flash" size={36} color="#F59E0B" />
        <Text style={{ color: c.textPrimary, fontWeight: "900", fontSize: 18 }}>QCM</Text>
        <Text style={{ color: c.textSecondary, fontSize: 13 }}>Réponds aux questions</Text>
      </View>

      {submitted && (
        <View style={{ borderRadius: 16, padding: 16, backgroundColor: score >= 2 ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.12)", borderWidth: 1, borderColor: score >= 2 ? "#34C759" : "#FF3B30", alignItems: "center" }}>
          <Text style={{ color: score >= 2 ? "#34C759" : "#FF3B30", fontWeight: "900", fontSize: 22 }}>
            {score}/{DEMO_QCM.length} ✓
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4 }}>
            {score === DEMO_QCM.length ? "Parfait !" : score >= 2 ? "Bien joué !" : "Réessaie !"}
          </Text>
        </View>
      )}

      {DEMO_QCM.map((item, qi) => {
        const sel = selected[qi];
        const isCorrect = submitted && sel === item.answer;
        const isWrong = submitted && sel !== undefined && sel !== item.answer;
        return (
          <View key={qi} style={[st.qBlock, { backgroundColor: c.card, borderColor: submitted ? (isCorrect ? "#34C759" : isWrong ? "#FF3B30" : c.border) : c.border }]}>
            <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 14, marginBottom: 12 }}>
              {qi + 1}. {item.q}
            </Text>
            {item.choices.map((choice, ci) => {
              const isSelected = sel === ci;
              const isAnswer = submitted && ci === item.answer;
              return (
                <Pressable key={ci} onPress={() => { if (!submitted) setSelected(s => ({ ...s, [qi]: ci })); }}
                  style={[st.choice, {
                    borderColor: isAnswer ? "#34C759" : isSelected && !submitted ? "#7B6CFF" : isSelected && submitted ? "#FF3B30" : c.border,
                    backgroundColor: isAnswer ? "rgba(52,199,89,0.10)" : isSelected && !submitted ? "rgba(123,108,255,0.12)" : c.cardAlt,
                  }]}>
                  <View style={[st.choiceDot, { borderColor: isSelected ? "#7B6CFF" : c.border, backgroundColor: isSelected ? "#7B6CFF" : "transparent" }]}>
                    {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />}
                  </View>
                  <Text style={{ color: c.textPrimary, flex: 1, fontSize: 13 }}>{choice}</Text>
                  {isAnswer && <Ionicons name="checkmark-circle" size={16} color="#34C759" />}
                </Pressable>
              );
            })}
          </View>
        );
      })}

      {!submitted ? (
        <Pressable onPress={() => setSubmitted(true)}
          style={{ height: 50, borderRadius: 999, backgroundColor: "#7B6CFF", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>Valider mes réponses</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => { setSelected({}); setSubmitted(false); }}
          style={{ height: 50, borderRadius: 999, borderWidth: 1, borderColor: c.border, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 14 }}>Recommencer</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function PdfView({ url, title, c }: { url: string; title: string; c: any }) {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setOpening(true);
    try {
      await Linking.openURL(url);
    } catch {
      // silencieux
    } finally {
      setOpening(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 20 }}>
      <View style={[st.pdfIcon, { backgroundColor: "rgba(123,108,255,0.12)", borderColor: "rgba(123,108,255,0.3)" }]}>
        <Ionicons name="document-text" size={56} color="#7B6CFF" />
      </View>
      <Text style={{ color: c.textPrimary, fontWeight: "900", fontSize: 18, textAlign: "center" }}>{title}</Text>
      <Text style={{ color: c.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
        Ce document s'ouvre dans le lecteur par défaut de ton appareil.
      </Text>
      <Pressable onPress={open} disabled={opening}
        style={[st.openBtn, { backgroundColor: "#7B6CFF" }]}>
        {opening
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Ouvrir le document</Text>
            </>
        }
      </Pressable>
    </View>
  );
}

function NoDocView({ c }: { c: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 }}>
      <Ionicons name="document-outline" size={64} color="rgba(255,255,255,0.12)" />
      <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 17 }}>Document non disponible</Text>
      <Text style={{ color: c.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
        Ce document n'a pas encore été mis en ligne par l'auteur.
      </Text>
    </View>
  );
}

export default function DocViewerModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { url, title, type, postId } = useLocalSearchParams<{
    url?: string | string[];
    title?: string | string[];
    type?: string | string[];
    postId?: string | string[];
  }>();

  const docUrl   = asStr(url);
  const docTitle = asStr(title, "Document");
  const docType  = asStr(type, "pdf");

  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const typeIcon = docType === "qcm" ? "flash" : "document-text";
  const typeLabel = docType === "qcm" ? "QCM" : "Document";
  const typeColor = docType === "qcm" ? "#F59E0B" : "#7B6CFF";

  return (
    <Animated.View style={[st.root, { backgroundColor: c.background, opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Tab header */}
      <LinearGradient colors={["#1A0A3B", "#0A0A1A"]}
        style={[st.tabBar, { paddingTop: insets.top + 8 }]}>
        <View style={st.tabPill}>
          <Ionicons name={typeIcon as any} size={14} color={typeColor} />
          <Text style={[st.tabType, { color: typeColor }]}>{typeLabel}</Text>
          <Text style={[st.tabTitle, { color: "rgba(255,255,255,0.85)" }]} numberOfLines={1}>
            {docTitle}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={st.closeBtn}>
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </LinearGradient>

      {/* Content */}
      <View style={{ flex: 1, backgroundColor: c.background }}>
        {docType === "qcm" ? (
          <QcmView c={c} />
        ) : docUrl ? (
          <PdfView url={docUrl} title={docTitle} c={c} />
        ) : (
          <NoDocView c={c} />
        )}
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },

  tabBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12, gap: 10,
  },
  tabPill: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  tabType:  { fontWeight: "800", fontSize: 11, letterSpacing: 0.5 },
  tabTitle: { fontSize: 13, fontWeight: "600", flex: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },

  qBlock: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  choice: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 12,
  },
  choiceDot: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },

  pdfIcon: {
    width: 110, height: 110, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  openBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 52, borderRadius: 999, paddingHorizontal: 28,
  },
});
