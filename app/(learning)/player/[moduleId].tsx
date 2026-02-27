import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../../../src/core/ui/AppButton";
import { completeLesson, finishModule, getLessons, getModule, getMyProgress } from "../../../src/features/learning/services";
import { LearningModule, Lesson, Progress } from "../../../src/features/learning/types";
import { ProgressBar } from "../../../src/features/learning/components/ProgressBar";

export default function LearningPlayerScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const id = useMemo(() => (Array.isArray(moduleId) ? moduleId[0] : moduleId) ?? "", [moduleId]);
  const router = useRouter();

  const [moduleData, setModuleData] = useState<LearningModule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    if (!id) return;
    const [m, l, p] = await Promise.all([getModule(id), getLessons(id), getMyProgress()]);
    setModuleData(m);
    setLessons(l);
    setProgress(p.find((row) => row.moduleId === id) ?? null);
  };

  useEffect(() => {
    refresh().catch(() => null);
  }, [id]);

  const completedSet = new Set(progress?.completedLessonIds ?? []);
  const nextLesson = lessons.find((lesson) => !completedSet.has(lesson.id)) ?? null;
  const percent = progress?.percent ?? 0;

  const onCompleteLesson = async () => {
    if (!nextLesson) return;
    setSubmitting(true);
    try {
      const nextProgress = await completeLesson(id, nextLesson.id);
      setProgress(nextProgress);
      if (nextProgress.percent >= 100) {
        const result = await finishModule(id);
        const badgeName = result.badgeUnlocked?.name;
        Alert.alert(
          "Module termine",
          badgeName ? `+${result.xpGained} XP. Badge debloque: ${badgeName}` : `+${result.xpGained} XP.`
        );
      }
    } catch {
      Alert.alert("Erreur", "Impossible de valider cette lecon.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{moduleData?.title ?? "Player"}</Text>
        <Text style={styles.subtitle}>Progression actuelle: {percent}%</Text>
        <ProgressBar value={percent} />

        {nextLesson ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lecon en cours</Text>
            <Text style={styles.lessonTitle}>
              {nextLesson.order}. {nextLesson.title}
            </Text>
            <Text style={styles.lessonBody}>{nextLesson.content}</Text>
            <AppButton style={styles.cta} onPress={onCompleteLesson} loading={submitting}>
              Marquer comme terminee
            </AppButton>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aucune lecon restante</Text>
            <Text style={styles.lessonBody}>Bravo, tu as fini ce module.</Text>
            <AppButton style={styles.cta} onPress={() => router.push("/(learning)/badges")}>
              Voir mes badges
            </AppButton>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plan du module</Text>
          {lessons.map((lesson) => (
            <Text key={lesson.id} style={[styles.planLine, completedSet.has(lesson.id) && styles.done]}>
              {completedSet.has(lesson.id) ? "✓ " : ""} {lesson.order}. {lesson.title}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 58, paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900" },
  subtitle: { color: "#9A9A9A", marginBottom: 2 },
  card: { backgroundColor: "#111", borderColor: "#222", borderWidth: 1, borderRadius: 20, padding: 14 },
  cardTitle: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  lessonTitle: { color: "#FFF", marginTop: 8, fontSize: 15, fontWeight: "700" },
  lessonBody: { color: "#AFAFAF", marginTop: 7, lineHeight: 19 },
  cta: { marginTop: 12, backgroundColor: "#FF4D5E" },
  planLine: { color: "#DCDCDC", marginTop: 7 },
  done: { color: "#8AE39F" },
});
