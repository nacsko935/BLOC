import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../../../src/core/ui/AppButton";
import { PlanCard } from "../../../src/features/plan/components/PlanCard";
import { PlanProgressBar } from "../../../src/features/plan/components/PlanProgressBar";
import { PlanSectionHeader } from "../../../src/features/plan/components/PlanSectionHeader";
import { usePlanStore } from "../../../state/usePlanStore";

export default function PlanProjectsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ create?: string }>();
  const { initialized, loadAll, projects, addProject } = usePlanStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (!initialized) loadAll().catch(() => null);
  }, [initialized, loadAll]);

  useEffect(() => {
    if (params.create === "1") setModalVisible(true);
  }, [params.create]);

  const totalGoals = useMemo(() => projects.reduce((acc, p) => acc + p.goalIds.length, 0), [projects]);

  const onCreateProject = async () => {
    if (!name.trim()) return;
    await addProject({
      name: name.trim(),
      description: description.trim() || undefined,
      subjectTags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setName("");
    setDescription("");
    setTagsInput("");
    setModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Projets</Text>
        <Text style={styles.subtitle}>Suivi des projets déjà lancés et prochaines actions</Text>

        <PlanCard>
          <PlanSectionHeader title="Mes projets" actionLabel="Créer" onPressAction={() => setModalVisible(true)} />
          <Text style={styles.meta}>Objectifs liés: {totalGoals}</Text>
          {projects.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucun projet</Text>
              <Text style={styles.emptyText}>Crée un projet pour regrouper deadlines, objectifs et ressources.</Text>
              <AppButton style={styles.primaryBtn} onPress={() => setModalVisible(true)}>Créer un projet</AppButton>
            </View>
          ) : (
            <View style={{ gap: 10, marginTop: 10 }}>
              {projects.map((project) => (
                <Pressable key={project.id} style={styles.projectCard} onPress={() => router.push({ pathname: "/(plan)/projects/[id]", params: { id: project.id } })}>
                  <Text style={styles.projectTitle}>{project.name}</Text>
                  <Text style={styles.projectSubtitle}>{project.description || project.subjectTags.join(" • ")}</Text>
                  <View style={{ marginTop: 10 }}>
                    <PlanProgressBar value={project.progress} color="#60A5FA" />
                  </View>
                  <View style={styles.projectMetaRow}>
                    <Text style={styles.projectMeta}>{project.goalIds.length} objectifs</Text>
                    <Text style={styles.projectMeta}>{project.deadlineIds.length} deadlines</Text>
                    <Text style={styles.projectMeta}>{project.progress}%</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </PlanCard>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Créer un projet</Text>
            <TextInput style={styles.input} placeholder="Nom du projet" placeholderTextColor="#7D8390" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#7D8390" value={description} onChangeText={setDescription} />
            <TextInput
              style={styles.input}
              placeholder="Tags matières (ex: droit, ia)"
              placeholderTextColor="#7D8390"
              value={tagsInput}
              onChangeText={setTagsInput}
            />
            <View style={styles.sheetActions}>
              <AppButton variant="secondary" style={styles.flexBtn} onPress={() => setModalVisible(false)}>Annuler</AppButton>
              <AppButton style={[styles.flexBtn, styles.primaryBtn]} onPress={onCreateProject}>Créer</AppButton>
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
  meta: { color: "#9FA6B2", marginTop: 4 },
  emptyBox: { paddingTop: 6 },
  emptyTitle: { color: "#FFF", fontWeight: "800" },
  emptyText: { color: "#9298A2", marginTop: 6, lineHeight: 18 },
  primaryBtn: { backgroundColor: "#5B4CFF" },
  projectCard: {
    backgroundColor: "#121418",
    borderColor: "#282B31",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  projectTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  projectSubtitle: { color: "#9EA6B3", marginTop: 5 },
  projectMetaRow: { marginTop: 10, flexDirection: "row", gap: 10 },
  projectMeta: { color: "#B6C2D3", fontSize: 12, fontWeight: "700" },
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
  sheetActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  flexBtn: { flex: 1 },
});
