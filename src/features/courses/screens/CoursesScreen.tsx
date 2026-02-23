import { useEffect, useMemo, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../../core/ui/Screen";
import { AppHeader } from "../../../core/ui/AppHeader";
import { AppText } from "../../../core/ui/AppText";
import Card from "../../../core/ui/Card";
import { Pill } from "../../../core/ui/Pill";
import { PressableScale } from "../../../core/ui/PressableScale";
import { PrimaryButton } from "../../../core/ui/Buttons";
import { ProgressBar } from "../../../core/ui/ProgressBar";
import { SkeletonCard } from "../../../core/ui/SkeletonCard";
import { EmptyState } from "../../../core/ui/EmptyStateNew";
import { ErrorState } from "../../../core/ui/ErrorState";
import { getAllCourses } from "../coursesRepo";
import { mockCourses, Course } from "../coursesData";

const semesters = ["Tous", "S1", "S2"];

export default function CoursesListScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSemester, setActiveSemester] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const fromDb = await getAllCourses();
      setCourses(fromDb.length > 0 ? fromDb : mockCourses);
    } catch {
      setError("Impossible de charger les cours.");
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return activeSemester === "Tous" ? courses : courses.filter((c) => c.semester === activeSemester);
  }, [activeSemester, courses]);

  return (
    <Screen>
      <AppHeader
        title="Mes Cours"
        subtitle={loading ? "Chargement..." : `${filtered.length} matiere${filtered.length > 1 ? "s" : ""}`}
        rightLabel="💬"
        onRightPress={() => router.push("/messages")}
      />

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        {semesters.map((s) => (
          <PressableScale key={s} onPress={() => setActiveSemester(s)}>
            <Pill active={activeSemester === s} tone="blue">{s}</Pill>
          </PressableScale>
        ))}
      </View>

      {loading ? (
        <View style={{ gap: 10 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun cours" description="Ajoute une matiere pour commencer." actionLabel="Nouveau cours" onAction={() => router.push("/(modals)/course-new")} />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PressableScale onPress={() => router.push(`/course/${item.id}`)}>
              <Card variant="elevated" accentColor={item.color} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <AppText style={{ fontSize: 26 }}>{item.icon}</AppText>
                    <View style={{ flex: 1 }}>
                      <AppText variant="h3" numberOfLines={1}>{item.name}</AppText>
                      <AppText muted variant="caption" style={{ marginTop: 2 }}>{item.professor.name}</AppText>
                    </View>
                  </View>
                  <Pill>{item.semester}</Pill>
                </View>

                <View style={{ marginTop: 12 }}>
                  <ProgressBar value={item.stats.progress} color={item.color} />
                  <AppText muted variant="micro" style={{ marginTop: 6 }}>{item.stats.progress}% completion</AppText>
                </View>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                  <Card variant="outlined" style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
                    <AppText variant="micro" muted>Notes</AppText>
                    <AppText variant="h3">{item.stats.notesCount}</AppText>
                  </Card>
                  <Card variant="outlined" style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
                    <AppText variant="micro" muted>QCM</AppText>
                    <AppText variant="h3">{item.stats.qcmCount}</AppText>
                  </Card>
                </View>
              </Card>
            </PressableScale>
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}

      {!loading && !error && filtered.length > 0 ? (
        <PrimaryButton onPress={() => router.push("/(modals)/course-new")} style={{ marginTop: 10 }}>
          Ajouter un cours
        </PrimaryButton>
      ) : null}
    </Screen>
  );
}
