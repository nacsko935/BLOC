import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../../../src/core/ui/AppButton";
import { PlanCard } from "../../../src/features/plan/components/PlanCard";
import { PlanListRow } from "../../../src/features/plan/components/PlanListRow";
import { PlanProgressBar } from "../../../src/features/plan/components/PlanProgressBar";
import { PlanSectionHeader } from "../../../src/features/plan/components/PlanSectionHeader";
import { usePlanStore } from "../../../state/usePlanStore";

export default function PlanProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Array.isArray(id) ? id[0] : id;

  const { initialized, loadAll, getProjectDataById } = usePlanStore();

  useEffect(() => {
    if (!initialized) loadAll().catch(() => null);
  }, [initialized, loadAll]);

  const { project, goals, deadlines, libraryItems } = useMemo(() => {
    if (!projectId) return { project: undefined, goals: [], deadlines: [], libraryItems: [] };
    return getProjectDataById(projectId);
  }, [projectId, getProjectDataById, initialized]);

  const suggestions = useMemo(() => {
    const next: string[] = [];
    if (goals.some((g) => g.status !== "done")) next.push("Finaliser 1 objectif prioritaire aujourd'hui");
    if (deadlines.length > 0) next.push("Préparer les livrables de la prochaine deadline");
    if (libraryItems.length < 2) next.push("Ajouter 2 ressources utiles depuis la bibliothèque");
    if (next.length === 0) next.push("Créer un nouvel objectif pour maintenir la dynamique");
    return next.slice(0, 3);
  }, [goals, deadlines, libraryItems]);

  if (!project) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Projet introuvable</Text>
          <AppButton style={styles.primaryBtn} onPress={() => router.replace("/(plan)/projects")}>Retour aux projets</AppButton>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.subtitle}>{project.description || "Détail du projet"}</Text>

        <PlanCard>
          <PlanSectionHeader title="Progression globale" />
          <PlanProgressBar value={project.progress} color="#60A5FA" />
          <Text style={styles.progressText}>{project.progress}% • {project.subjectTags.join(" • ")}</Text>
        </PlanCard>

        <PlanCard>
          <PlanSectionHeader title="Objectifs liés" />
          {goals.length === 0 ? (
            <Text style={styles.muted}>Aucun objectif lié.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {goals.map((goal) => (
                <PlanListRow key={goal.id} title={goal.title} subtitle={`${goal.subject} • ${goal.status}`} />
              ))}
            </View>
          )}
        </PlanCard>

        <PlanCard>
          <PlanSectionHeader title="Ressources liées" />
          {libraryItems.length === 0 ? (
            <Text style={styles.muted}>Aucune ressource liée.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {libraryItems.map((item) => (
                <PlanListRow key={item.id} title={item.title} subtitle={`${item.subject} • ${item.type}`} />
              ))}
            </View>
          )}
        </PlanCard>

        <PlanCard>
          <PlanSectionHeader title="Prochaines actions" />
          <View style={{ gap: 8 }}>
            {suggestions.map((s) => (
              <Text key={s} style={styles.suggestion}>• {s}</Text>
            ))}
          </View>
          <View style={styles.actionsRow}>
            <AppButton style={[styles.primaryBtn, styles.actionBtn]} onPress={() => router.push({ pathname: "/(plan)/goals", params: { create: "1" } })}>
              Ajouter objectif
            </AppButton>
            <AppButton variant="secondary" style={styles.actionBtn} onPress={() => router.push({ pathname: "/(plan)/deadlines", params: { create: "1" } })}>
              Ajouter deadline
            </AppButton>
          </View>
          <AppButton variant="secondary" onPress={() => router.push("/(plan)/library")}>Ajouter ressource</AppButton>
        </PlanCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 58, paddingHorizontal: 14, paddingBottom: 24, gap: 12 },
  title: { color: "#FFF", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#8F949D" },
  progressText: { color: "#9BBFEA", marginTop: 8, fontWeight: "700" },
  muted: { color: "#9CA4B1" },
  suggestion: { color: "#D7DEE9" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: { flex: 1 },
  primaryBtn: { backgroundColor: "#5B4CFF" },
});
