import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { getAllCourses } from "../coursesRepo";
import { mockCourses, Course } from "../coursesData";
import { useAuthStore } from "../../../../state/useAuthStore";
import { fetchProgressionStatsFromSupabase } from "../../../../lib/services/progressionService";

const SEMESTERS = ["Tous", "S1", "S2"];

export default function CoursesListScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c }   = useTheme();
  const { user } = useAuthStore();
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [sem,      setSem]      = useState("Tous");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string|null>(null);
  const [remoteProgress, setRemoteProgress] = useState<Partial<{
    streak: number;
    objectiveCurrent: number;
    objectiveTarget: number;
    modulesDone: number;
    flashcardsCreated: number;
  }> | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const uid = user?.id;
      const db = await getAllCourses(uid);
      // Never show mockCourses — user starts with empty list
      setCourses(db);
    } catch {
      setError("Impossible de charger les cours.");
      setCourses([]);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [user?.id]);

  const filtered = useMemo(()=> sem === "Tous" ? courses : courses.filter(c=>c.semester===sem), [sem, courses]);
  const allCourses = useMemo(() => courses, [courses]);
  const modulesDone = useMemo(
    () => allCourses.filter((course) => course.stats.progress >= 100).length,
    [allCourses]
  );
  const avgProgress = useMemo(() => {
    if (!allCourses.length) return 0;
    const total = allCourses.reduce((sum, course) => sum + (course.stats.progress || 0), 0);
    return Math.max(0, Math.min(100, Math.round(total / allCourses.length)));
  }, [allCourses]);
  const flashcardsCount = useMemo(
    () => allCourses.reduce((sum, course) => sum + (course.stats.notesCount || 0), 0),
    [allCourses]
  );
  const streakFallback = 9;
  const objectiveTargetFallback = Math.max(10, allCourses.length * 3 || 10);
  const objectiveCurrentFallback = Math.round((avgProgress / 100) * objectiveTargetFallback);

  const streak = remoteProgress?.streak ?? streakFallback;
  const modulesDoneValue = remoteProgress?.modulesDone ?? modulesDone;
  const flashcardsCountValue = remoteProgress?.flashcardsCreated ?? flashcardsCount;
  const objectiveCurrent = remoteProgress?.objectiveCurrent ?? objectiveCurrentFallback;
  const objectiveTarget = Math.max(1, remoteProgress?.objectiveTarget ?? objectiveTargetFallback);
  const objectivePercent = Math.max(5, Math.min(100, Math.round((objectiveCurrent / objectiveTarget) * 100)));

  useEffect(() => {
    const uid = user?.id;
    if (!uid) {
      setRemoteProgress(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const stats = await fetchProgressionStatsFromSupabase(uid);
      if (!cancelled) {
        setRemoteProgress(stats ?? null);
      }
    })().catch(() => {
      if (!cancelled) setRemoteProgress(null);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <View style={{ flex:1, backgroundColor:c.background, paddingTop:insets.top }}>
      {/* Header */}
      <View style={{ paddingHorizontal:20, paddingTop:14, paddingBottom:10,
        borderBottomWidth:1, borderBottomColor:c.border,
        flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
        <View>
          <Text style={{ fontSize:28, fontWeight:"800", color:c.textPrimary }}>Mes Cours</Text>
          <Text style={{ color:c.textSecondary, fontSize:13, marginTop:2 }}>
            {loading ? "Chargement…" : `${filtered.length} matière${filtered.length>1?"s":""}`}
          </Text>
        </View>
        <Pressable onPress={()=>router.push("/studio" as any)}
          style={({ pressed })=>[{ height:42, paddingHorizontal:14, borderRadius:21,
            backgroundColor:"rgba(110,92,255,0.15)", borderWidth:1, borderColor:"#6E5CFF",
            alignItems:"center", justifyContent:"center", flexDirection:"row", gap:6 },
            pressed&&{opacity:0.8}]}>
          <Ionicons name="sparkles" size={16} color="#6E5CFF" />
          <Text style={{ color:"#6E5CFF", fontWeight:"700", fontSize:13 }}>Studio IA</Text>
        </Pressable>
        <Pressable onPress={()=>router.push("/(modals)/course-new")}
          style={({ pressed })=>[{ width:42, height:42, borderRadius:21,
            backgroundColor:c.accentPurple, alignItems:"center", justifyContent:"center" },
            pressed&&{opacity:0.8}]}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Filtres semestre */}
      <View style={{ flexDirection:"row", gap:8, paddingHorizontal:20, paddingTop:14, paddingBottom:8 }}>
        {SEMESTERS.map(s=>(
          <Pressable key={s} onPress={()=>setSem(s)}
            style={{ paddingHorizontal:16, paddingVertical:8, borderRadius:999,
              backgroundColor: sem===s ? c.accentPurple : c.cardAlt,
              borderWidth:1, borderColor: sem===s ? c.accentPurple : c.border }}>
            <Text style={{ color: sem===s ? "#fff" : c.textSecondary, fontWeight:"700", fontSize:13 }}>{s}</Text>
          </Pressable>
        ))}
      </View>

      {/* Progression (deplacee depuis Profil) */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={[styles.progressCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.sectionTitle}>Progression</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{streak}</Text>
              <Text style={styles.progressLabel}>Streak</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{modulesDoneValue}</Text>
              <Text style={styles.progressLabel}>Modules termines</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{flashcardsCountValue}</Text>
              <Text style={styles.progressLabel}>Flashcards creees</Text>
            </View>
          </View>
          <Text style={[styles.monthTitle, { color: c.textPrimary }]}>Objectif du mois</Text>
          <Text style={[styles.monthSub, { color: c.textSecondary }]}>
            {objectiveCurrent}/{objectiveTarget} objectifs valides ({objectivePercent}%)
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: c.cardAlt }]}>
            <View style={[styles.progressFill, { width: `${objectivePercent}%` }]} />
          </View>
        </View>
      </View>

      {/* Contenu */}
      {loading ? (
        <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
          <ActivityIndicator color={c.accentPurple} size="large" />
        </View>
      ) : error ? (
        <View style={{ flex:1, alignItems:"center", justifyContent:"center", gap:12, paddingHorizontal:32 }}>
          <Ionicons name="warning-outline" size={44} color={c.danger} />
          <Text style={{ color:c.textPrimary, fontWeight:"700", textAlign:"center" }}>{error}</Text>
          <Pressable onPress={load} style={{ height:42, borderRadius:999, paddingHorizontal:24,
            backgroundColor:c.accentPurple, alignItems:"center", justifyContent:"center" }}>
            <Text style={{ color:"#fff", fontWeight:"800" }}>Réessayer</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex:1, alignItems:"center", justifyContent:"center", gap:14, paddingHorizontal:32 }}>
          <View style={{ width:72, height:72, borderRadius:36, backgroundColor:c.accentPurple+"22",
            alignItems:"center", justifyContent:"center" }}>
            <Ionicons name="book-outline" size={32} color={c.accentPurple} />
          </View>
          <Text style={{ color:c.textPrimary, fontSize:18, fontWeight:"800", textAlign:"center" }}>Aucun cours</Text>
          <Text style={{ color:c.textSecondary, textAlign:"center" }}>Ajoute une matière pour commencer.</Text>
          <Pressable onPress={()=>router.push("/(modals)/course-new")}
            style={{ height:44, borderRadius:999, paddingHorizontal:28,
              backgroundColor:c.accentPurple, alignItems:"center", justifyContent:"center" }}>
            <Text style={{ color:"#fff", fontWeight:"800" }}>Nouveau cours</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered} keyExtractor={i=>i.id}
          contentContainerStyle={{ paddingHorizontal:16, paddingTop:8, paddingBottom:120, gap:12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable onPress={()=>router.push(`/course/${item.id}`)}
              style={({ pressed })=>[{ backgroundColor:c.card, borderRadius:20, padding:16,
                borderWidth:1, borderColor:c.border, borderLeftWidth:4,
                borderLeftColor:item.color,
                shadowColor:"#000", shadowOpacity:0.05, shadowRadius:8, elevation:2 },
                pressed&&{opacity:0.9}]}>
              {/* Titre + semestre */}
              <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
                <View style={{ flexDirection:"row", alignItems:"center", gap:10, flex:1 }}>
                  <Text style={{ fontSize:26 }}>{item.icon}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:c.textPrimary, fontWeight:"800", fontSize:16 }} numberOfLines={1}>{item.name}</Text>
                    <Text style={{ color:c.textSecondary, fontSize:12, marginTop:2 }}>{item.professor.name}</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal:10, paddingVertical:5, borderRadius:999,
                  backgroundColor:c.cardAlt, borderWidth:1, borderColor:c.border }}>
                  <Text style={{ color:c.textSecondary, fontWeight:"700", fontSize:12 }}>{item.semester}</Text>
                </View>
              </View>
              {/* Progress */}
              <View style={{ marginTop:14 }}>
                <View style={{ height:6, backgroundColor:c.cardAlt, borderRadius:999, overflow:"hidden" }}>
                  <View style={{ width:`${item.stats.progress}%`, height:"100%", backgroundColor:item.color, borderRadius:999 }} />
                </View>
                <Text style={{ color:c.textSecondary, fontSize:11, marginTop:5 }}>{item.stats.progress}% complété</Text>
              </View>
              {/* Stats */}
              <View style={{ flexDirection:"row", gap:10, marginTop:12 }}>
                {[
                  { label:"Notes",  val:item.stats.notesCount },
                  { label:"QCM",    val:item.stats.qcmCount },
                ].map(s=>(
                  <View key={s.label} style={{ flex:1, backgroundColor:c.cardAlt, borderRadius:12,
                    padding:10, borderWidth:1, borderColor:c.border }}>
                    <Text style={{ color:c.textSecondary, fontSize:11 }}>{s.label}</Text>
                    <Text style={{ color:c.textPrimary, fontWeight:"800", fontSize:18, marginTop:2 }}>{s.val}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable onPress={()=>router.push("/(modals)/course-new")}
              style={({ pressed })=>[{ height:50, borderRadius:16, borderWidth:2,
                borderColor:c.accentPurple, borderStyle:"dashed",
                alignItems:"center", justifyContent:"center", flexDirection:"row", gap:8 },
                pressed&&{opacity:0.7}]}>
              <Ionicons name="add-circle-outline" size={20} color={c.accentPurple} />
              <Text style={{ color:c.accentPurple, fontWeight:"800", fontSize:15 }}>Ajouter un cours</Text>
            </Pressable>
          }
        />
      )}
    </View>
  );
}

const styles = {
  progressCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 } as const,
    elevation: 3,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800" as const,
    marginBottom: 10,
  },
  progressGrid: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  progressItem: {
    alignItems: "flex-start" as const,
    gap: 2,
  },
  progressValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900" as const,
  },
  progressLabel: {
    color: "#9A9AA6",
    fontSize: 12,
  },
  monthTitle: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "800" as const,
  },
  monthSub: {
    marginTop: 3,
    fontSize: 12,
  },
  progressTrack: {
    marginTop: 8,
    width: "100%" as const,
    height: 8,
    borderRadius: 999,
    overflow: "hidden" as const,
  },
  progressFill: {
    height: "100%" as const,
    borderRadius: 999,
    backgroundColor: "#6E5CFF",
  },
};
