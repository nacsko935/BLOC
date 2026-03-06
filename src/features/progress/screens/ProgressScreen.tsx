import { useEffect, useRef, useState } from "react";
import {
  Animated, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { getProgressState, computeLevel, ProgressState, completeMission } from "../services/progressService";

export default function ProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const [state, setState] = useState<ProgressState | null>(null);
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProgressState().then(s => {
      setState(s);
      const { level, nextXp, prevXp } = computeLevel(s.xp);
      const pct = nextXp > prevXp ? (s.xp - prevXp) / (nextXp - prevXp) : 1;
      Animated.timing(barAnim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
    });
  }, []);

  const handleMission = async (id: string) => {
    const next = await completeMission(id);
    setState(next);
  };

  if (!state) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff" }}>Chargement...</Text>
      </View>
    );
  }

  const { level, title, icon, nextXp, prevXp } = computeLevel(state.xp);
  const pctNum = nextXp > prevXp ? Math.round(((state.xp - prevXp) / (nextXp - prevXp)) * 100) : 100;
  const xpToNext = Math.max(0, nextXp - state.xp);
  const unlockedBadges = state.badges.filter(b => b.unlocked);
  const lockedBadges   = state.badges.filter(b => !b.unlocked);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Header gradient */}
      <LinearGradient colors={["#1A0A3B", "#0A0520", "#000000"]} style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>Ma Progression</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero level card */}
        <LinearGradient colors={["#1A0A3B", "#0D0620"]} style={s.heroCard}>
          <View style={s.heroTop}>
            {/* XP ring */}
            <View style={s.ringOuter}>
              <LinearGradient colors={["#8B7DFF", "#5040E0"]} style={s.ringGrad} />
              <View style={s.ringInner}>
                <Text style={s.ringIcon}>{icon}</Text>
                <Text style={s.ringLevel}>Niv. {level}</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 20 }}>
              <Text style={s.levelTitle}>{title}</Text>
              <Text style={s.xpText}>{state.xp} XP total</Text>
              <View style={s.streakRow}>
                <Ionicons name="flame" size={14} color="#FF8C00" />
                <Text style={s.streakText}>{state.streak} jour{state.streak > 1 ? "s" : ""} de suite</Text>
              </View>
            </View>
          </View>

          {/* XP progress bar */}
          <View style={s.xpBarWrap}>
            <View style={s.xpBarTrack}>
              <Animated.View style={{ height: "100%", width: barWidth as any, borderRadius: 999, overflow: "hidden" }}>
                <LinearGradient colors={["#8B7DFF", "#5040E0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              </Animated.View>
            </View>
            <View style={s.xpBarLabels}>
              <Text style={s.xpBarLabel}>{state.xp} XP</Text>
              <Text style={s.xpBarLabel}>{pctNum}% · encore {xpToNext} XP</Text>
              <Text style={s.xpBarLabel}>{nextXp} XP</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statNum}>{state.totalPosts || 0}</Text>
              <Text style={s.statLabel}>Posts</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={s.statNum}>{state.totalReposts || 0}</Text>
              <Text style={s.statLabel}>Reposts</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={s.statNum}>{state.totalShares || 0}</Text>
              <Text style={s.statLabel}>Partages</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={s.statNum}>{state.totalLikes || 0}</Text>
              <Text style={s.statLabel}>J'aimes</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Missions du jour */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎯 Missions du jour</Text>
          <Text style={[s.sectionSub, { color: c.textSecondary }]}>Complète-les pour gagner des XP</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            {state.missions.map(m => {
              const done = m.progress >= m.target;
              const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
              return (
                <Pressable key={m.id} onPress={() => !done && handleMission(m.id)}
                  style={[s.missionCard, { backgroundColor: c.card, borderColor: done ? "#34C759" : c.border }]}>
                  <View style={[s.missionIcon, { backgroundColor: done ? "#34C75922" : "rgba(123,108,255,0.12)" }]}>
                    <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={[s.missionTitle, { color: done ? "#34C759" : "#fff" }]}>{m.title}</Text>
                      <View style={[s.xpChip, { backgroundColor: done ? "#34C75922" : "rgba(123,108,255,0.15)" }]}>
                        <Text style={{ color: done ? "#34C759" : "#7B6CFF", fontSize: 11, fontWeight: "800" }}>+{m.xp} XP</Text>
                      </View>
                    </View>
                    <View style={[s.missionBar, { backgroundColor: c.cardAlt, marginTop: 6 }]}>
                      <View style={[s.missionFill, { width: `${pct}%` as any, backgroundColor: done ? "#34C759" : "#7B6CFF" }]} />
                    </View>
                    <Text style={[s.missionProgress, { color: c.textSecondary }]}>{m.progress}/{m.target}</Text>
                  </View>
                  {done && <Ionicons name="checkmark-circle" size={22} color="#34C759" style={{ marginLeft: 8 }} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Badges obtenus */}
        {unlockedBadges.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🏅 Badges obtenus</Text>
            <View style={s.badgesGrid}>
              {unlockedBadges.map(b => (
                <View key={b.id} style={[s.badgeCard, { backgroundColor: c.card, borderColor: "#7B6CFF" }]}>
                  <Text style={{ fontSize: 30 }}>{b.icon}</Text>
                  <Text style={s.badgeName}>{b.name}</Text>
                  <Text style={[s.badgeDesc, { color: c.textSecondary }]}>{b.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges à débloquer */}
        {lockedBadges.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🔒 À débloquer</Text>
            <View style={s.badgesGrid}>
              {lockedBadges.map(b => (
                <View key={b.id} style={[s.badgeCard, { backgroundColor: c.card, borderColor: c.border, opacity: 0.55 }]}>
                  <Text style={{ fontSize: 30, opacity: 0.4 }}>🔒</Text>
                  <Text style={s.badgeName}>{b.name}</Text>
                  <Text style={[s.badgeDesc, { color: c.textSecondary }]}>{b.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How to earn XP */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💡 Comment gagner des XP</Text>
          <View style={[s.tipsCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {[
              { icon: "📝", label: "Publier un post",     xp: "+20 XP" },
              { icon: "🔁", label: "Republier",           xp: "+10 XP" },
              { icon: "↗️", label: "Partager",            xp: "+10 XP" },
              { icon: "🤖", label: "Compléter un QCM IA", xp: "+30 XP" },
              { icon: "🔖", label: "Enregistrer un post", xp: "+5 XP" },
            ].map((tip, i) => (
              <View key={i} style={[s.tipRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}>
                <Text style={{ fontSize: 20 }}>{tip.icon}</Text>
                <Text style={{ color: "#fff", fontSize: 14, flex: 1, fontWeight: "600" }}>{tip.label}</Text>
                <Text style={{ color: "#7B6CFF", fontSize: 13, fontWeight: "800" }}>{tip.xp}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingBottom:16 },
  backBtn: { width:36, height:36, borderRadius:18, backgroundColor:"rgba(255,255,255,0.12)", alignItems:"center", justifyContent:"center" },
  headerTitle: { color:"#fff", fontSize:18, fontWeight:"800" },
  heroCard: { margin:16, borderRadius:24, padding:20, gap:16, borderWidth:1, borderColor:"rgba(123,108,255,0.25)" },
  heroTop: { flexDirection:"row", alignItems:"center" },
  ringOuter: { width:90, height:90, borderRadius:45, position:"relative", alignItems:"center", justifyContent:"center" },
  ringGrad: { position:"absolute", width:90, height:90, borderRadius:45, opacity:0.3 },
  ringInner: { width:76, height:76, borderRadius:38, backgroundColor:"#1A1A2E", alignItems:"center", justifyContent:"center", gap:2 },
  ringIcon: { fontSize:28 },
  ringLevel: { color:"#8B7DFF", fontSize:11, fontWeight:"800" },
  levelTitle: { color:"#fff", fontSize:22, fontWeight:"900", letterSpacing:-0.3 },
  xpText: { color:"#8B7DFF", fontSize:14, fontWeight:"700", marginTop:2 },
  streakRow: { flexDirection:"row", alignItems:"center", gap:4, marginTop:6 },
  streakText: { color:"#FF8C00", fontSize:13, fontWeight:"700" },
  xpBarWrap: { gap:6 },
  xpBarTrack: { height:8, borderRadius:999, backgroundColor:"rgba(255,255,255,0.10)", overflow:"hidden" },
  xpBarLabels: { flexDirection:"row", justifyContent:"space-between" },
  xpBarLabel: { color:"rgba(255,255,255,0.40)", fontSize:10 },
  statsRow: { flexDirection:"row", backgroundColor:"rgba(255,255,255,0.05)", borderRadius:14, paddingVertical:12 },
  statItem: { flex:1, alignItems:"center", gap:2 },
  statNum: { color:"#fff", fontSize:18, fontWeight:"900" },
  statLabel: { color:"rgba(255,255,255,0.45)", fontSize:11 },
  statDiv: { width:1, backgroundColor:"rgba(255,255,255,0.08)", marginVertical:4 },
  section: { paddingHorizontal:16, paddingTop:20, gap:4 },
  sectionTitle: { color:"#fff", fontSize:17, fontWeight:"800" },
  sectionSub: { fontSize:13 },
  missionCard: { flexDirection:"row", alignItems:"center", gap:12, borderRadius:16, borderWidth:1, padding:14 },
  missionIcon: { width:46, height:46, borderRadius:14, alignItems:"center", justifyContent:"center" },
  missionTitle: { fontSize:14, fontWeight:"700" },
  xpChip: { borderRadius:8, paddingHorizontal:8, paddingVertical:3 },
  missionBar: { height:4, borderRadius:999, overflow:"hidden" },
  missionFill: { height:"100%", borderRadius:999 },
  missionProgress: { fontSize:11, marginTop:3 },
  badgesGrid: { flexDirection:"row", flexWrap:"wrap", gap:10, marginTop:10 },
  badgeCard: { width:"30%", borderRadius:16, borderWidth:1, padding:12, alignItems:"center", gap:4 },
  badgeName: { color:"#fff", fontSize:12, fontWeight:"800", textAlign:"center" },
  badgeDesc: { fontSize:10, textAlign:"center" },
  tipsCard: { borderRadius:16, borderWidth:1, marginTop:10, overflow:"hidden" },
  tipRow: { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:14, paddingVertical:12 },
});
