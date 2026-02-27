import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../../src/core/ui/AppButton";
import { PlanCard } from "../../src/features/plan/components/PlanCard";
import { PlanListRow } from "../../src/features/plan/components/PlanListRow";
import { PlanPill } from "../../src/features/plan/components/PlanPill";
import { PlanSectionHeader } from "../../src/features/plan/components/PlanSectionHeader";
import { daysUntil } from "../../src/features/plan/services";
import { Deadline } from "../../src/features/plan/types";
import { usePlanStore } from "../../state/usePlanStore";

function weekGroupLabel(deadline: Deadline) {
  const d = daysUntil(deadline.date);
  if (d <= 7) return "Cette semaine";
  if (d <= 14) return "Semaine prochaine";
  return "Plus tard";
}

export default function PlanDeadlinesScreen() {
  const params = useLocalSearchParams<{ create?: string }>();
  const router = useRouter();
  const { initialized, loadAll, deadlines, addDeadline, autoCreateGoalsForDeadline } = usePlanStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<Deadline["type"]>("exam");
  const [importance, setImportance] = useState<Deadline["importance"]>("med");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!initialized) loadAll().catch(() => null);
  }, [initialized, loadAll]);

  useEffect(() => {
    if (params.create === "1") setModalVisible(true);
  }, [params.create]);

  const grouped = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const d of deadlines) {
      const key = weekGroupLabel(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries());
  }, [deadlines]);

  const onCreate = async () => {
    if (!title.trim() || !subject.trim() || !date.trim()) return;
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return;
    await addDeadline({
      title: title.trim(),
      subject: subject.trim(),
      date: parsed.toISOString(),
      type,
      importance,
      notes: notes.trim() || undefined,
    });
    setTitle("");
    setSubject("");
    setDate("");
    setNotes("");
    setType("exam");
    setImportance("med");
    setModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Deadlines</Text>
        <Text style={styles.subtitle}>Timeline des examens, rendus et échéances clés</Text>

        <PlanCard>
          <PlanSectionHeader title="Échéances" actionLabel="Ajouter" onPressAction={() => setModalVisible(true)} />
          {deadlines.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucune deadline</Text>
              <Text style={styles.emptyText}>Ajoute une date de rendu ou un examen pour préparer ton planning.</Text>
              <AppButton style={styles.primaryBtn} onPress={() => setModalVisible(true)}>Ajouter une deadline</AppButton>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {grouped.map(([groupName, entries]) => (
                <View key={groupName} style={{ gap: 8 }}>
                  <Text style={styles.groupTitle}>{groupName}</Text>
                  {entries.map((deadline) => {
                    const leftDate = new Date(deadline.date);
                    return (
                      <View key={deadline.id} style={{ gap: 7 }}>
                        <PlanListRow
                          title={deadline.title}
                          subtitle={`${deadline.subject} • ${deadline.type}`}
                          right={
                            <View style={{ alignItems: "flex-end", gap: 4 }}>
                              <Text style={styles.dateText}>{leftDate.toLocaleDateString("fr-FR")}</Text>
                              <PlanPill label={`J-${Math.max(0, daysUntil(deadline.date))}`} tone={daysUntil(deadline.date) <= 3 ? "urgent" : "default"} />
                            </View>
                          }
                        >
                          <View style={{ marginTop: 7, flexDirection: "row", gap: 8 }}>
                            <PlanPill label={deadline.importance.toUpperCase()} tone={deadline.importance === "high" ? "urgent" : "default"} />
                          </View>
                        </PlanListRow>
                        <AppButton
                          variant="secondary"
                          onPress={async () => {
                            const created = await autoCreateGoalsForDeadline(deadline.id);
                            Alert.alert("Objectifs générés", `${created} objectifs proposés ont été ajoutés.`);
                            router.push("/(plan)/goals");
                          }}
                        >
                          Ajouter objectifs
                        </AppButton>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </PlanCard>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Ajouter une deadline</Text>

            <TextInput style={styles.input} placeholder="Titre" placeholderTextColor="#7D8390" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Matière" placeholderTextColor="#7D8390" value={subject} onChangeText={setSubject} />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#7D8390"
              value={date}
              onChangeText={setDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Notes (optionnel)"
              placeholderTextColor="#7D8390"
              value={notes}
              onChangeText={setNotes}
            />

            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.rowWrap}>
              <PlanPill label="Exam" active={type === "exam"} onPress={() => setType("exam")} />
              <PlanPill label="Rendu" active={type === "assignment"} onPress={() => setType("assignment")} />
              <PlanPill label="Autre" active={type === "other"} onPress={() => setType("other")} />
            </View>

            <Text style={styles.inputLabel}>Importance</Text>
            <View style={styles.rowWrap}>
              <PlanPill label="Low" active={importance === "low"} onPress={() => setImportance("low")} />
              <PlanPill label="Med" active={importance === "med"} onPress={() => setImportance("med")} />
              <PlanPill label="High" active={importance === "high"} tone="urgent" onPress={() => setImportance("high")} />
            </View>

            <View style={styles.sheetActions}>
              <AppButton variant="secondary" style={styles.flexBtn} onPress={() => setModalVisible(false)}>Annuler</AppButton>
              <AppButton style={[styles.flexBtn, styles.primaryBtn]} onPress={onCreate}>Créer</AppButton>
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
  groupTitle: { color: "#D4DAE5", fontWeight: "800", marginTop: 6 },
  dateText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  emptyBox: { paddingTop: 6 },
  emptyTitle: { color: "#FFF", fontWeight: "800" },
  emptyText: { color: "#9298A2", marginTop: 6, lineHeight: 18 },
  primaryBtn: { backgroundColor: "#5B4CFF" },
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
  inputLabel: { color: "#D8DCE2", fontWeight: "700" },
  rowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sheetActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  flexBtn: { flex: 1 },
});
