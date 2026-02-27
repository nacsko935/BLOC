import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AppButton } from "../../src/core/ui/AppButton";
import { PlanCard } from "../../src/features/plan/components/PlanCard";
import { PlanListRow } from "../../src/features/plan/components/PlanListRow";
import { PlanPill } from "../../src/features/plan/components/PlanPill";
import { PlanSectionHeader } from "../../src/features/plan/components/PlanSectionHeader";
import { GoalsFilter } from "../../src/features/plan/types";
import { usePlanStore } from "../../state/usePlanStore";

export default function PlanGoalsScreen() {
  const params = useLocalSearchParams<{ create?: string }>();
  const {
    initialized,
    loadAll,
    getGoals,
    projects,
    addGoal,
    setGoalStatus,
    postponeGoalByOneDay,
    prioritizeGoalHigh,
  } = usePlanStore();

  const [segment, setSegment] = useState<GoalsFilter>("today");
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [durationMin, setDurationMin] = useState(25);
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [dueInput, setDueInput] = useState("");

  useEffect(() => {
    if (!initialized) loadAll().catch(() => null);
  }, [initialized, loadAll]);

  useEffect(() => {
    if (params.create === "1") {
      setModalVisible(true);
    }
  }, [params.create]);

  const items = useMemo(() => getGoals(segment), [getGoals, segment, initialized]);

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setDurationMin(25);
    setPriority("med");
    setProjectId(undefined);
    setDueInput("");
  };

  const onCreateGoal = async () => {
    if (!title.trim() || !subject.trim()) return;
    let dueAt: string | undefined;
    if (dueInput.trim()) {
      const parsed = new Date(dueInput);
      if (Number.isNaN(parsed.getTime())) return;
      dueAt = parsed.toISOString();
    }

    await addGoal({
      title: title.trim(),
      subject: subject.trim(),
      durationMin,
      priority,
      dueAt,
      projectId,
    });

    resetForm();
    setModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Objectifs</Text>
        <Text style={styles.subtitle}>Planifie, priorise, termine en une action</Text>

        <View style={styles.segmentRow}>
          <PlanPill label="Aujourd'hui" active={segment === "today"} onPress={() => setSegment("today")} />
          <PlanPill label="Cette semaine" active={segment === "week"} onPress={() => setSegment("week")} />
          <PlanPill label="Termine" active={segment === "done"} onPress={() => setSegment("done")} />
        </View>

        <PlanCard>
          <PlanSectionHeader title="Mes objectifs" actionLabel="Ajouter" onPressAction={() => setModalVisible(true)} />
          {items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucun objectif dans cette vue</Text>
              <Text style={styles.emptyText}>Ajoute un objectif pour garder un plan clair.</Text>
              <AppButton style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
                Ajouter un objectif
              </AppButton>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {items.map((goal) => (
                <View key={goal.id} style={{ gap: 8 }}>
                  <PlanListRow
                    title={goal.title}
                    subtitle={`${goal.subject} • ${goal.durationMin} min`}
                    right={<PlanPill label={goal.status === "done" ? "Termine" : goal.status === "doing" ? "En cours" : "A faire"} />}
                  >
                    <View style={styles.metaRow}>
                      <PlanPill label={goal.priority.toUpperCase()} tone={goal.priority === "high" ? "urgent" : "default"} />
                      {goal.dueAt ? <Text style={styles.dueText}>Due: {new Date(goal.dueAt).toLocaleDateString("fr-FR")}</Text> : null}
                    </View>
                  </PlanListRow>
                  <View style={styles.actionsRow}>
                    <AppButton variant="secondary" style={styles.actionBtn} onPress={() => setGoalStatus(goal.id, "done")}>Terminer</AppButton>
                    <AppButton variant="secondary" style={styles.actionBtn} onPress={() => postponeGoalByOneDay(goal.id)}>Reporter</AppButton>
                    <AppButton variant="secondary" style={styles.actionBtn} onPress={() => prioritizeGoalHigh(goal.id)}>Prioriser</AppButton>
                  </View>
                </View>
              ))}
            </View>
          )}
        </PlanCard>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Ajouter un objectif</Text>

            <TextInput style={styles.input} placeholder="Titre" placeholderTextColor="#7D8390" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Matiere" placeholderTextColor="#7D8390" value={subject} onChangeText={setSubject} />
            <TextInput
              style={styles.input}
              placeholder="Deadline (YYYY-MM-DD)"
              placeholderTextColor="#7D8390"
              value={dueInput}
              onChangeText={setDueInput}
            />

            <Text style={styles.inputLabel}>Durée</Text>
            <View style={styles.segmentRow}>
              {[15, 25, 45, 60].map((d) => (
                <PlanPill key={d} label={`${d} min`} active={durationMin === d} onPress={() => setDurationMin(d)} />
              ))}
            </View>

            <Text style={styles.inputLabel}>Priorité</Text>
            <View style={styles.segmentRow}>
              <PlanPill label="Low" active={priority === "low"} onPress={() => setPriority("low")} />
              <PlanPill label="Med" active={priority === "med"} onPress={() => setPriority("med")} />
              <PlanPill label="High" active={priority === "high"} onPress={() => setPriority("high")} tone="urgent" />
            </View>

            <Text style={styles.inputLabel}>Projet lié (optionnel)</Text>
            <View style={styles.segmentRow}>
              {projects.slice(0, 3).map((p) => (
                <PlanPill key={p.id} label={p.name} active={projectId === p.id} onPress={() => setProjectId(projectId === p.id ? undefined : p.id)} />
              ))}
            </View>

            <View style={styles.sheetActions}>
              <AppButton variant="secondary" style={styles.flexBtn} onPress={() => setModalVisible(false)}>Annuler</AppButton>
              <AppButton style={[styles.flexBtn, styles.primaryBtn]} onPress={onCreateGoal}>Créer</AppButton>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 58, paddingHorizontal: 14, paddingBottom: 24, gap: 12 },
  title: { color: "#FFF", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#8F949D" },
  segmentRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  emptyBox: { paddingTop: 6 },
  emptyTitle: { color: "#FFF", fontWeight: "800" },
  emptyText: { color: "#9298A2", marginTop: 6 },
  primaryBtn: { backgroundColor: "#5B4CFF" },
  metaRow: { marginTop: 7, flexDirection: "row", gap: 8, alignItems: "center" },
  dueText: { color: "#A5ADBA", fontSize: 12, fontWeight: "700" },
  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    padding: 14,
  },
  sheet: {
    backgroundColor: "#0F1013",
    borderColor: "#25272C",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  sheetTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  input: {
    backgroundColor: "#14161A",
    borderWidth: 1,
    borderColor: "#282B31",
    borderRadius: 14,
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputLabel: { color: "#D8DCE2", fontWeight: "700", marginTop: 2 },
  sheetActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  flexBtn: { flex: 1 },
});
