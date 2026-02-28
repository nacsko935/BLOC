import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { getAllCourses } from "../coursesRepo";
import { mockCourses, Course } from "../coursesData";

const SEMESTERS = ["Tous", "S1", "S2"];

export default function CoursesListScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c }   = useTheme();
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [sem,      setSem]      = useState("Tous");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string|null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const db = await getAllCourses();
      setCourses(db.length > 0 ? db : mockCourses);
    } catch {
      setError("Impossible de charger les cours."); setCourses(mockCourses);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const filtered = useMemo(()=> sem === "Tous" ? courses : courses.filter(c=>c.semester===sem), [sem, courses]);

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
