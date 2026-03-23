import { useCallback, useEffect, useState } from "react";
import {
  Alert, FlatList, Pressable, ScrollView, Text, View, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { getCourseById } from "../coursesRepo";
import { getStudioWorks, deleteStudioWork, StudioWork, StudioWorkType } from "../../../../lib/services/studioService";
import type { Course } from "../coursesData";

type TabKey = "Tout" | "Résumés" | "Fiches" | "QCM" | "Cartes" | "Rapports";

const TABS: { key: TabKey; types: StudioWorkType[] | null }[] = [
  { key: "Tout",     types: null },
  { key: "Résumés",  types: ["resume", "resume_audio", "resume_video"] },
  { key: "Fiches",   types: ["fiche"] },
  { key: "QCM",      types: ["qcm"] },
  { key: "Cartes",   types: ["carte_mentale"] },
  { key: "Rapports", types: ["rapport", "infographie", "tableau"] },
];

const TYPE_META: Record<StudioWorkType, { icon: string; color: string; label: string }> = {
  resume:        { icon: "document-text",   color: "#7B6CFF", label: "Résumé" },
  resume_audio:  { icon: "musical-notes",   color: "#5B8DEF", label: "Résumé audio" },
  resume_video:  { icon: "videocam",        color: "#34C759", label: "Résumé vidéo" },
  rapport:       { icon: "reader",          color: "#AF52DE", label: "Rapport" },
  carte_mentale: { icon: "git-network",     color: "#FF9500", label: "Carte mentale" },
  fiche:         { icon: "layers",          color: "#FF6B6B", label: "Fiche" },
  qcm:           { icon: "help-circle",     color: "#7B6CFF", label: "Quiz" },
  infographie:   { icon: "bar-chart",       color: "#00C7BE", label: "Infographie" },
  tableau:       { icon: "grid",            color: "#FFD700", label: "Tableau" },
};

function WorkCard({ work, onPress, onDelete, c }: { work: StudioWork; onPress: () => void; onDelete: () => void; c: any }) {
  const meta = TYPE_META[work.type] ?? { icon: "document", color: "#7B6CFF", label: work.type };
  const date = new Date(work.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => Alert.alert("Supprimer", `Supprimer "${work.title}" ?`, [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: onDelete },
      ])}
      style={({ pressed }) => [{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 14, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: meta.color + "22", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={meta.icon as any} size={20} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 14 }} numberOfLines={1}>{work.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 }}>
            <Text style={{ color: meta.color, fontSize: 11, fontWeight: "700" }}>{meta.label}</Text>
            <Text style={{ color: c.textSecondary, fontSize: 11 }}>·</Text>
            <Text style={{ color: c.textSecondary, fontSize: 11 }}>{date}</Text>
            {work.type === "qcm" && work.score != null && work.totalQuestions != null && (
              <>
                <Text style={{ color: c.textSecondary, fontSize: 11 }}>·</Text>
                <Text style={{ color: work.score / work.totalQuestions >= 0.6 ? "#34C759" : "#FF9500", fontSize: 11, fontWeight: "700" }}>
                  {work.score}/{work.totalQuestions}
                </Text>
              </>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
      </View>
    </Pressable>
  );
}

function WorkModal({ work, onClose, c }: { work: StudioWork; onClose: () => void; c: any }) {
  const insets = useSafeAreaInsets();
  const meta = TYPE_META[work.type] ?? { icon: "document", color: "#7B6CFF", label: work.type };
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.background, zIndex: 100 }}>
      <LinearGradient colors={["#0F0A2A", "#000"]}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: insets.top + 14, paddingBottom: 16 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: meta.color + "22", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={meta.icon as any} size={18} color={meta.color} />
        </View>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16, flex: 1, textAlign: "center", marginHorizontal: 8 }} numberOfLines={1}>{meta.label}</Text>
        <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 18, marginBottom: 16 }}>{work.title}</Text>
        <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16 }}>
          <Text style={{ color: c.textPrimary, fontSize: 14, lineHeight: 22 }}>{work.content}</Text>
        </View>
        {work.type === "qcm" && work.score != null && (
          <View style={{ marginTop: 16, backgroundColor: "rgba(123,108,255,0.12)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(123,108,255,0.3)", padding: 16, alignItems: "center" }}>
            <Text style={{ color: "#8B7DFF", fontSize: 28, fontWeight: "900" }}>{Math.round((work.score / (work.totalQuestions || 1)) * 100)}%</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{work.score}/{work.totalQuestions} bonnes réponses</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function CourseDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [works, setWorks] = useState<StudioWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("Tout");
  const [selectedWork, setSelectedWork] = useState<StudioWork | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [courseData, worksData] = await Promise.all([getCourseById(id), getStudioWorks(id)]);
      setCourse(courseData);
      setWorks(worksData);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const filteredWorks = works.filter(w => {
    const tab = TABS.find(t => t.key === activeTab);
    if (!tab || !tab.types) return true;
    return tab.types.includes(w.type);
  });

  const handleDelete = async (work: StudioWork) => {
    await deleteStudioWork(work.id, id!).catch(() => null);
    setWorks(prev => prev.filter(w => w.id !== work.id));
  };

  if (!course && !loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: c.textPrimary, fontWeight: "700" }}>Cours introuvable</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: c.accentPurple, fontWeight: "800" }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <LinearGradient colors={["#0F0A2A", c.background]}
        style={{ paddingTop: insets.top + 14, paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          {course && (
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: course.color + "22", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 20 }}>{course.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 17 }} numberOfLines={1}>{course.name}</Text>
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{course.semester} · {course.professor.name}</Text>
              </View>
            </View>
          )}
          <Pressable
            onPress={() => router.push({ pathname: "/studio", params: { courseId: id } } as any)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#7B6CFF", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Studio</Text>
          </Pressable>
        </View>
        {course && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            {[
              { label: "Travaux", val: works.length },
              { label: "QCM",     val: works.filter(w => w.type === "qcm").length },
              { label: "Résumés", val: works.filter(w => ["resume","resume_audio","resume_video"].includes(w.type)).length },
            ].map(stat => (
              <View key={stat.label} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 10, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>{stat.val}</Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      <View style={{ height: 48 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: "center" }}>
          {TABS.map(tab => (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
                backgroundColor: activeTab === tab.key ? c.accentPurple : c.cardAlt,
                borderWidth: 1, borderColor: activeTab === tab.key ? c.accentPurple : c.border }}>
              <Text style={{ color: activeTab === tab.key ? "#fff" : c.textSecondary, fontWeight: "700", fontSize: 13 }}>
                {tab.key}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={c.accentPurple} size="large" />
        </View>
      ) : filteredWorks.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.accentPurple + "22", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="sparkles-outline" size={32} color={c.accentPurple} />
          </View>
          <Text style={{ color: c.textPrimary, fontSize: 18, fontWeight: "800", textAlign: "center" }}>Aucun travail ici</Text>
          <Text style={{ color: c.textSecondary, textAlign: "center", fontSize: 14 }}>Lance le Studio IA pour générer des résumés, QCM, fiches et plus encore.</Text>
          <Pressable onPress={() => router.push({ pathname: "/studio", params: { courseId: id } } as any)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 46, borderRadius: 999, paddingHorizontal: 24, backgroundColor: c.accentPurple }}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Ouvrir le Studio IA</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredWorks}
          keyExtractor={w => w.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <WorkCard work={item} c={c} onPress={() => setSelectedWork(item)} onDelete={() => handleDelete(item)} />
          )}
          ListFooterComponent={
            <Pressable onPress={() => router.push({ pathname: "/studio", params: { courseId: id } } as any)}
              style={({ pressed }) => [{ height: 50, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: c.accentPurple, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 4, opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="sparkles" size={18} color={c.accentPurple} />
              <Text style={{ color: c.accentPurple, fontWeight: "800", fontSize: 14 }}>Nouveau travail IA</Text>
            </Pressable>
          }
        />
      )}

      {selectedWork && <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} c={c} />}
    </View>
  );
}
