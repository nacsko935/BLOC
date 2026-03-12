import { useEffect, useRef, useState } from "react";
import {
  Alert, Animated, Easing, FlatList, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { getProjects, Project } from "../../../../lib/services/projectsService";

const TRACK_TYPES = [
  { id:"post",   label:"Publication", icon:"create-outline",       gradient:["#34C759","#28A745"] as [string,string], route:"/create/index" },
  { id:"audio",  label:"Voix/Audio",  icon:"mic-outline",          gradient:["#FF3B30","#C0392B"] as [string,string], route:"/create/audio" },
  { id:"qcm",    label:"QCM IA",      icon:"flash-outline",        gradient:["#7B6CFF","#5040E0"] as [string,string], route:"/qcm/generate" },
  { id:"pdf",    label:"PDF",         icon:"document-outline",     gradient:["#007AFF","#0056B3"] as [string,string], route:"/create/pdf" },
  { id:"import", label:"Importer",    icon:"cloud-upload-outline",  gradient:["#AF52DE","#8B3FC2"] as [string,string], route:"/create/import" },
];

const AI_TOOLS: { id:string; label:string; icon:string; color:string; route:string }[] = [
  { id:"qcm",      label:"QCM Auto",       icon:"flash-outline",           color:"#7B6CFF", route:"/qcm/generate" },
  { id:"resume",   label:"Résumé IA",      icon:"sparkles-outline",        color:"#FF6B6B", route:"/qcm/generate" },
  { id:"fiche",    label:"Fiche révision", icon:"document-text-outline",   color:"#4DA3FF", route:"/qcm/generate" },
  { id:"expliquer",label:"Explique-moi",   icon:"bulb-outline",            color:"#FF9500", route:"/qcm/generate" },
  { id:"correct",  label:"Correcteur",     icon:"checkmark-circle-outline",color:"#34C759", route:"/qcm/generate" },
  { id:"plan",     label:"Plan de cours",  icon:"list-outline",            color:"#AF52DE", route:"/qcm/generate" },
  { id:"trad",     label:"Traducteur",     icon:"language-outline",        color:"#FF2D55", route:"/qcm/generate" },
  { id:"oral",     label:"Prépare l'oral", icon:"mic-circle-outline",      color:"#00C7BE", route:"/qcm/generate" },
];

const COURSE_TOOLS = [
  { id:"flash", label:"Flashcards", icon:"layers-outline",        color:"#007AFF", route:"/(modals)/flashcards" },
  { id:"note",  label:"Note audio", icon:"mic-outline",           color:"#FF3B30", route:"/create/audio" },
  { id:"pomo",  label:"Pomodoro",   icon:"timer-outline",         color:"#FF9500", route:"/(modals)/pomodoro" },
  { id:"dead",  label:"Deadlines",  icon:"calendar-outline",      color:"#34C759", route:"/(modals)/deadlines" },
  { id:"notes", label:"Notes",      icon:"pencil-outline",        color:"#AF52DE", route:"/create/index" },
  { id:"prog",  label:"Progression",icon:"trending-up-outline",   color:"#00C7BE", route:"/progress" },
  { id:"ecole", label:"Lier école", icon:"school-outline",        color:"#FF6B6B", route:"/create/index" },
  { id:"studio",label:"Studio",     icon:"musical-notes-outline", color:"#FFD700", route:"/create/index" },
];

export function CreatePageScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  const [iaOpen, setIaOpen] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    getProjects().then((all) => setRecentProjects(all.slice(0, 3))).catch(() => null);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(enterTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [enterOpacity, enterTranslateY]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: c.background,
        opacity: enterOpacity,
        transform: [{ translateY: enterTranslateY }],
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Header ── */}
        <LinearGradient colors={isDark ? ["#1A0A3B","#000"] : ["#EDE9FE","#fff"]}
          style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ color: c.textPrimary, fontSize: 28, fontWeight: "900", letterSpacing: -0.5 }}>Créer</Text>
          <Text style={{ color: c.textSecondary, fontSize: 14, marginTop: 2 }}>Posts, cours, outils IA — tout est ici</Text>
        </LinearGradient>

        {/* ── BLOC IA bouton principal ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Pressable onPress={() => router.push("/qcm/generate" as any)}
            style={({ pressed }) => [{ borderRadius: 20, overflow: "hidden" }, pressed && { opacity: 0.88 }]}>
            <LinearGradient colors={["#7B6CFF", "#5040E0", "#3A2BB0"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.blocBtn}>
              {/* Icon container - properly centered */}
              <View style={styles.blocIconWrap}>
                <Ionicons name="flash" size={28} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Text style={styles.blocTitle}>BLOC IA</Text>
                  <View style={styles.blocLiveBadge}>
                    <View style={styles.blocLiveDot} />
                    <Text style={styles.blocLiveText}>ACTIF</Text>
                  </View>
                </View>
                <Text style={styles.blocSubtitle}>Upload un cours → QCM auto · Résumé · Fiche</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── Projets récents ── */}
        {recentProjects.length > 0 && (
          <View style={{ paddingTop: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary, paddingHorizontal: 20 }]}>Projets récents</Text>
            <FlatList data={recentProjects} horizontal keyExtractor={i => i.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginTop: 12 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => router.push("/(tabs)/profile" as any)}
                  style={({ pressed }) => [{
                    flexDirection:"row", alignItems:"center", gap:12,
                    backgroundColor:c.card, borderRadius:16, padding:12,
                    borderWidth:1, borderColor:c.border, minWidth:200,
                  }, pressed && { opacity:0.85 }]}>
                  <View style={{ width:44,height:44,borderRadius:12,backgroundColor:c.cardAlt,alignItems:"center",justifyContent:"center" }}>
                    <Text style={{ fontSize:22 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:c.textPrimary,fontWeight:"700" }} numberOfLines={1}>{item.title}</Text>
                    <Text style={{ color:c.textSecondary,fontSize:12,marginTop:2 }}>
                      {item.objectives.filter(o => o.done).length}/{item.objectives.length} objectifs
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={c.textSecondary}/>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ── Type de piste ── */}
        <View style={{ paddingTop:20, borderBottomWidth:1, borderBottomColor:c.border, paddingBottom:20 }}>
          <Text style={[styles.sectionTitle, { color:c.textPrimary, paddingHorizontal:20, marginBottom:12 }]}>Créer du contenu</Text>
          <FlatList data={TRACK_TYPES} horizontal keyExtractor={i => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal:20, gap:10 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(item.route as any)}
                style={({ pressed }) => [{ width:116,height:96,borderRadius:18,overflow:"hidden" }, pressed&&{opacity:0.85}]}>
                <LinearGradient colors={item.gradient} style={{ width:"100%",height:"100%",padding:14,justifyContent:"space-between" }}>
                  <Ionicons name={item.icon as any} size={26} color="rgba(255,255,255,0.92)"/>
                  <Text style={{ color:"#fff",fontWeight:"800",fontSize:13 }}>{item.label}</Text>
                </LinearGradient>
              </Pressable>
            )}
          />
        </View>

        {/* ── Outils IA ── */}
        <View style={{ paddingTop:20, paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:c.border, paddingBottom:20 }}>
          <Pressable onPress={() => setIaOpen(v => !v)}
            style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom: iaOpen ? 14 : 0 }}>
            <View style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
              <LinearGradient colors={["#7B6CFF","#5040E0"]} style={{ width:28, height:20, borderRadius:6, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:"#fff", fontSize:9, fontWeight:"900" }}>AI</Text>
              </LinearGradient>
              <Text style={{ color:c.textPrimary, fontSize:16, fontWeight:"800" }}>Outils BLOC IA</Text>
              <View style={{ paddingHorizontal:8, paddingVertical:3, borderRadius:8, backgroundColor:"rgba(123,108,255,0.18)", borderWidth:1, borderColor:"rgba(123,108,255,0.35)" }}>
                <Text style={{ color:"#7B6CFF", fontSize:10, fontWeight:"800" }}>FONCTIONNEL</Text>
              </View>
            </View>
            <Ionicons name={iaOpen ? "chevron-up" : "chevron-down"} size={18} color={c.textSecondary}/>
          </Pressable>

          {iaOpen && (
            <View style={styles.aiGrid}>
              {AI_TOOLS.map(tool => (
                <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
                  style={({ pressed }) => [styles.aiTool, pressed && { opacity:0.75 }]}>
                  {/* Icon - properly sized and centered */}
                  <View style={[styles.aiIconBox, { backgroundColor:tool.color+"22", borderColor:tool.color+"44" }]}>
                    <Ionicons name={tool.icon as any} size={22} color={tool.color}/>
                  </View>
                  <Text style={{ color:c.textPrimary, fontSize:10, fontWeight:"700", textAlign:"center" }} numberOfLines={2}>
                    {tool.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Outils de cours ── */}
        <View style={{ paddingTop:20, paddingHorizontal:20, paddingBottom:16 }}>
          <Text style={[styles.sectionTitle, { color:c.textPrimary, marginBottom:14 }]}>Outils de cours</Text>
          <View style={{ flexDirection:"row", flexWrap:"wrap", gap:16 }}>
            {COURSE_TOOLS.map(tool => (
              <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
                style={({ pressed }) => [styles.aiTool, pressed && { opacity:0.75 }]}>
                <View style={[styles.aiIconBox, { backgroundColor:tool.color+"22", borderColor:tool.color+"44" }]}>
                  <Ionicons name={tool.icon as any} size={22} color={tool.color}/>
                </View>
                <Text style={{ color:"#fff", fontSize:10, fontWeight:"700", textAlign:"center" }} numberOfLines={2}>
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

const styles = StyleSheet.create({
  blocBtn: {
    flexDirection:"row", alignItems:"center", padding:18, gap:16,
    minHeight:84,
  },
  blocIconWrap: {
    width:56, height:56, borderRadius:18,
    backgroundColor:"rgba(255,255,255,0.18)",
    alignItems:"center", justifyContent:"center",
  },
  blocTitle: { color:"#fff", fontSize:20, fontWeight:"900", letterSpacing:-0.3 },
  blocSubtitle: { color:"rgba(255,255,255,0.72)", fontSize:12, lineHeight:16 },
  blocLiveBadge: { flexDirection:"row", alignItems:"center", gap:4, backgroundColor:"rgba(255,255,255,0.18)", borderRadius:6, paddingHorizontal:6, paddingVertical:2 },
  blocLiveDot: { width:6, height:6, borderRadius:3, backgroundColor:"#34C759" },
  blocLiveText: { color:"#fff", fontSize:9, fontWeight:"900" },
  sectionTitle: { fontSize:16, fontWeight:"800" },
  aiGrid: { flexDirection:"row", flexWrap:"wrap", gap:16 },
  aiTool: { width:"22%", alignItems:"center", gap:7 },
  aiIconBox: {
    width:56, height:56, borderRadius:16,
    alignItems:"center", justifyContent:"center",
    borderWidth:1,
  },
});

export default CreatePageScreen;
