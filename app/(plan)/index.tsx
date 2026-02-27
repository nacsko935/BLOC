import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "../../src/core/ui/AppButton";
import { PlanCard } from "../../src/features/plan/components/PlanCard";
import { PlanFab } from "../../src/features/plan/components/PlanFab";
import { PlanListRow } from "../../src/features/plan/components/PlanListRow";
import { PlanPill } from "../../src/features/plan/components/PlanPill";
import { PlanProgressBar } from "../../src/features/plan/components/PlanProgressBar";
import { PlanSectionHeader } from "../../src/features/plan/components/PlanSectionHeader";
import { daysUntil } from "../../src/features/plan/services";
import { PlanWindow } from "../../src/features/plan/types";
import { usePlanStore } from "../../state/usePlanStore";

export default function PlanHomeScreen() {
  const router = useRouter();
  const [windowMode, setWindowMode] = useState<PlanWindow>("today");
  const [fabOpen, setFabOpen] = useState(false);

  const {
    initialized,
    loading,
    goals,
    deadlines,
    projects,
    libraryItems,
    coachTips,
    loadAll,
    getGoals,
    setGoalStatus,
  } = usePlanStore();

  useEffect(() => {
    if (!initialized) {
      loadAll().catch(() => null);
    }
  }, [initialized, loadAll]);

  const goalsToday = useMemo(() => getGoals("today"), [goals, getGoals]);
  const goalsWeek = useMemo(() => getGoals("week"), [goals, getGoals]);
  const goalsDone = useMemo(() => getGoals("done"), [goals, getGoals]);

  const goalsForWindow = windowMode === "today" ? goalsToday : goalsWeek;
  const top3 = goalsForWindow.filter((g) => g.status !== "done").slice(0, 3);

  const totalDuration = goalsForWindow
    .filter((g) => g.status !== "done")
    .reduce((acc, g) => acc + g.durationMin, 0);

  const timeLabel = `${Math.floor(totalDuration / 60)}h${String(totalDuration % 60).padStart(2, "0")}`;
  const upcomingDeadlines = deadlines.filter((d) => daysUntil(d.date) >= 0).slice(0, 3);
  const coach = coachTips[0];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Plan</Text>
            <Text style={styles.subtitle}>Ta progression du jour et de la semaine</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <PlanPill label="Aujourd'hui" active={windowMode === "today"} onPress={() => setWindowMode("today")} />
            <PlanPill label="Semaine" active={windowMode === "week"} onPress={() => setWindowMode("week")} />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <PlanCard style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{goalsToday.filter((g) => g.status !== "done").length}</Text>
            <Text style={styles.kpiLabel}>Objectifs du jour</Text>
          </PlanCard>
          <PlanCard style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{timeLabel}</Text>
            <Text style={styles.kpiLabel}>Temps prevu</Text>
          </PlanCard>
          <PlanCard style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{deadlines.filter((d) => daysUntil(d.date) <= 7).length}</Text>
            <Text style={styles.kpiLabel}>Deadlines proches</Text>
          </PlanCard>
        </View>

        <PlanCard>
          <PlanSectionHeader title="A faire maintenant" />
          {top3.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Rien d'urgent pour l'instant</Text>
              <Text style={styles.emptyText}>Ajoute un objectif pour garder ton rythme.</Text>
              <AppButton style={styles.ctaBtn} onPress={() => router.push({ pathname: "/(plan)/goals", params: { create: "1" } })}>
                Ajouter un objectif
              </AppButton>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {top3.map((goal) => (
                <PlanListRow
                  key={goal.id}
                  title={goal.title}
                  subtitle={`${goal.subject} • ${goal.durationMin} min`}
                  right={<PlanPill label="Demarrer" onPress={() => Alert.alert("Session", "Lancement session de travail (placeholder).")} />}
                >
                  <View style={styles.goalMetaRow}>
                    <PlanPill label={goal.priority === "high" ? "Urgent" : goal.priority === "med" ? "Important" : "Normal"} tone={goal.priority === "high" ? "urgent" : "default"} />
                    {goal.dueAt ? <Text style={styles.dueText}>J{daysUntil(goal.dueAt) >= 0 ? `-${daysUntil(goal.dueAt)}` : `+${Math.abs(daysUntil(goal.dueAt))}`}</Text> : null}
                  </View>
                </PlanListRow>
              ))}
            </View>
          )}
        </PlanCard>

        <PlanCard>
          <PlanSectionHeader title="Prochaines deadlines" actionLabel="Voir tout" onPressAction={() => router.push("/(plan)/deadlines")} />
          {upcomingDeadlines.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucune deadline proche</Text>
              <Text style={styles.emptyText}>Ajoute tes échéances pour planifier plus tôt.</Text>
              <AppButton style={styles.ctaBtn} onPress={() => router.push({ pathname: "/(plan)/deadlines", params: { create: "1" } })}>
                Ajouter une deadline
              </AppButton>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {upcomingDeadlines.map((deadline) => {
                const d = new Date(deadline.date);
                return (
                  <PlanListRow
                    key={deadline.id}
                    title={deadline.title}
                    subtitle={`${deadline.subject} • ${deadline.type}`}
                    right={
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.dateDay}>{d.getDate().toString().padStart(2, "0")}</Text>
                        <PlanPill label={`J-${Math.max(0, daysUntil(deadline.date))}`} tone={daysUntil(deadline.date) <= 3 ? "urgent" : "default"} />
                      </View>
                    }
                  />
                );
              })}
            </View>
          )}
        </PlanCard>

        <PlanCard>
          <PlanSectionHeader title="Conseil du jour" />
          <Text style={styles.coachTitle}>{coach?.title ?? "Garde le rythme"}</Text>
          <Text style={styles.coachMessage}>{coach?.message ?? "Planifie 2 objectifs courts pour maintenir ta progression."}</Text>
          <View style={styles.quickActions}>
            {(coach?.actions ?? [
              { label: "Session 25 min", action: "start_pomodoro" as const },
              { label: "Planifier 2 objectifs", action: "plan_goals" as const },
            ]).slice(0, 2).map((act) => (
              <AppButton
                key={act.label}
                variant="secondary"
                style={styles.quickBtn}
                onPress={() => {
                  if (act.action === "open_deadlines") router.push("/(plan)/deadlines");
                  else if (act.action === "open_goals" || act.action === "plan_goals") router.push("/(plan)/goals");
                  else Alert.alert("Coach", "Action rapide lancee.");
                }}
              >
                {act.label}
              </AppButton>
            ))}
          </View>
        </PlanCard>

        <PlanCard>
          <PlanSectionHeader title="Projets en cours" actionLabel="Tous les projets" onPressAction={() => router.push("/(plan)/projects")} />
          {projects.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucun projet en cours</Text>
              <Text style={styles.emptyText}>Crée un projet pour regrouper objectifs, ressources et deadlines.</Text>
              <AppButton style={styles.ctaBtn} onPress={() => router.push({ pathname: "/(plan)/projects", params: { create: "1" } })}>
                Créer un projet
              </AppButton>
            </View>
          ) : (
            <FlatList
              horizontal
              data={projects}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 6 }}
              renderItem={({ item }) => (
                <PlanCard style={styles.projectCard}>
                  <Text style={styles.projectTitle}>{item.name}</Text>
                  <Text style={styles.projectSubtitle}>{item.subjectTags.join(" • ")}</Text>
                  <View style={{ marginTop: 10 }}>
                    <PlanProgressBar value={item.progress} color="#60A5FA" />
                  </View>
                  <Text style={styles.projectProgress}>{item.progress}%</Text>
                  <AppButton variant="secondary" style={{ marginTop: 10 }} onPress={() => router.push({ pathname: "/(plan)/projects/[id]", params: { id: item.id } })}>
                    Ouvrir
                  </AppButton>
                </PlanCard>
              )}
            />
          )}
        </PlanCard>

        <PlanCard style={{ marginBottom: 84 }}>
          <PlanSectionHeader title="Bibliotheque rapide" actionLabel="Voir tout" onPressAction={() => router.push("/(plan)/library")} />
          {libraryItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Bibliothèque vide</Text>
              <Text style={styles.emptyText}>Ajoute des PDF, notes et contenus IA pour les retrouver ici.</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {libraryItems.slice(0, 5).map((item) => (
                <PlanListRow
                  key={item.id}
                  title={item.title}
                  subtitle={`${item.subject} • ${item.type}`}
                  right={<Ionicons name="chevron-forward" size={18} color="#9EA4AE" />}
                  onPress={() => router.push("/(plan)/library")}
                />
              ))}
            </View>
          )}
        </PlanCard>
      </ScrollView>

      <PlanFab
        visible={fabOpen}
        onOpen={() => setFabOpen(true)}
        onClose={() => setFabOpen(false)}
        onAddGoal={() => router.push({ pathname: "/(plan)/goals", params: { create: "1" } })}
        onAddDeadline={() => router.push({ pathname: "/(plan)/deadlines", params: { create: "1" } })}
        onAddProject={() => router.push({ pathname: "/(plan)/projects", params: { create: "1" } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 58, paddingHorizontal: 14, paddingBottom: 24, gap: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  title: { color: "#FFF", fontSize: 36, fontWeight: "900" },
  subtitle: { color: "#8F949D", marginTop: 3 },
  kpiRow: { flexDirection: "row", gap: 8 },
  kpiCard: { flex: 1, paddingVertical: 12 },
  kpiValue: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  kpiLabel: { color: "#9298A3", marginTop: 4, fontSize: 11 },
  emptyBox: { paddingTop: 4 },
  emptyTitle: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  emptyText: { color: "#8D939E", marginTop: 6, lineHeight: 18 },
  ctaBtn: { marginTop: 10, backgroundColor: "#5B4CFF" },
  goalMetaRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  dueText: { color: "#A8AFBB", fontSize: 12, fontWeight: "700" },
  dateDay: { color: "#FFF", fontWeight: "800", fontSize: 14, marginBottom: 4, textAlign: "right" },
  coachTitle: { color: "#FFF", fontSize: 16, fontWeight: "800", marginTop: 2 },
  coachMessage: { color: "#98A0AA", marginTop: 6, lineHeight: 18 },
  quickActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  quickBtn: { flex: 1 },
  projectCard: { width: 220, marginRight: 10 },
  projectTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  projectSubtitle: { color: "#95A0AF", marginTop: 6, fontSize: 12 },
  projectProgress: { color: "#8FC3FF", marginTop: 8, fontWeight: "700", fontSize: 12 },
});
