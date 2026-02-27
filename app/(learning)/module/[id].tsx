import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../../../src/core/ui/AppButton";
import { getLessons, getModule, getMyProgress } from "../../../src/features/learning/services";
import { LearningModule, Lesson, Progress } from "../../../src/features/learning/types";
import { ProgressBar } from "../../../src/features/learning/components/ProgressBar";

export default function LearningModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const moduleId = useMemo(() => (Array.isArray(id) ? id[0] : id) ?? "", [id]);
  const router = useRouter();

  const [moduleData, setModuleData] = useState<LearningModule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    getModule(moduleId).then(setModuleData).catch(() => setModuleData(null));
    getLessons(moduleId).then(setLessons).catch(() => setLessons([]));
    getMyProgress()
      .then((rows) => setProgress(rows.find((p) => p.moduleId === moduleId) ?? null))
      .catch(() => setProgress(null));
  }, [moduleId]);

  const percent = progress?.percent ?? 0;
  const cta = percent > 0 ? "Reprendre le module" : "Demarrer le module";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{moduleData?.title ?? "Module"}</Text>
        <Text style={styles.subtitle}>{moduleData?.subtitle ?? "Parcours structure en lecons et quiz."}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apercu</Text>
          <Text style={styles.meta}>
            {moduleData?.authorName ?? "Auteur"} - {moduleData?.certified ? "Certifie" : "Community"}
          </Text>
          <Text style={styles.meta}>
            {lessons.length} lecons - {Math.round((moduleData?.durationMinutes ?? 0) / 60)}h - {moduleData?.ratingAvg.toFixed(1)} / 5
          </Text>
          <View style={{ marginTop: 10 }}>
            <ProgressBar value={percent} />
          </View>
          <Text style={styles.progressLabel}>Progression: {percent}%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Programme</Text>
          {lessons.map((lesson) => (
            <Text key={lesson.id} style={styles.lessonLine}>
              {lesson.order}. {lesson.title}
            </Text>
          ))}
        </View>

        <AppButton style={{ backgroundColor: "#FF4D5E" }} onPress={() => router.push({ pathname: "/(learning)/player/[moduleId]", params: { moduleId } })}>
          {cta}
        </AppButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 58, paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900" },
  subtitle: { color: "#9A9A9A", lineHeight: 19 },
  card: { backgroundColor: "#111", borderColor: "#222", borderWidth: 1, borderRadius: 20, padding: 14 },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  meta: { color: "#BEBEBE", marginTop: 7 },
  progressLabel: { color: "#FF9BA4", marginTop: 8, fontWeight: "700", fontSize: 12 },
  lessonLine: { color: "#E7E7E7", marginTop: 8 },
});
