import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../../core/ui/Screen";
import Card from "../../../core/ui/Card";
import { AppText } from "../../../core/ui/AppText";
import { AppButton } from "../../../core/ui/AppButton";
import { CourseHeader } from "../components/CourseHeader";
import { CourseTabs, CourseTabKey } from "../components/CourseTabs";
import { CourseStat } from "../components/CourseStat";
import { useCourse } from "../hooks/useCourse";

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { course, notes, qcms, deadlines } = useCourse(id);
  const [activeTab, setActiveTab] = useState<CourseTabKey>("Notes");

  const files = useMemo(() => notes.filter((n) => n.type === "pdf" || n.type === "audio" || n.type === "video"), [notes]);

  if (!course) {
    return (
      <Screen>
        <AppText>Cours non trouve</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText variant="title">Cours</AppText>
          <AppButton variant="secondary" onPress={() => router.back()}>Retour</AppButton>
        </View>

        <CourseHeader course={course} />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <CourseStat label="Notes" value={course.stats.notesCount} icon="??" />
          <CourseStat label="QCM" value={course.stats.qcmCount} icon="??" />
          <CourseStat label="Completion" value={`${course.stats.progress}%`} icon="?" />
        </View>

        <CourseTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === "Notes" ? (
          <View style={{ gap: 8 }}>
            {notes.map((n) => (
              <Card key={n.id}>
                <AppText>{n.title}</AppText>
                <AppText muted variant="caption" style={{ marginTop: 4 }}>{n.updatedAt}</AppText>
              </Card>
            ))}
          </View>
        ) : null}

        {activeTab === "QCM" ? (
          <View style={{ gap: 8 }}>
            {qcms.map((q) => (
              <Card key={q.id}>
                <AppText>{q.title}</AppText>
                <AppText muted variant="caption" style={{ marginTop: 4 }}>
                  {q.questionsCount} questions · {q.duration} min
                </AppText>
              </Card>
            ))}
          </View>
        ) : null}

        {activeTab === "Files" ? (
          <View style={{ gap: 8 }}>
            {files.map((f) => (
              <Card key={f.id}>
                <AppText>{f.title}</AppText>
                <AppText muted variant="caption" style={{ marginTop: 4 }}>{f.type.toUpperCase()}</AppText>
              </Card>
            ))}
          </View>
        ) : null}

        {activeTab === "Revision" ? (
          <View style={{ gap: 8 }}>
            {deadlines.map((d) => (
              <Card key={d.id}>
                <AppText>{d.title}</AppText>
                <AppText muted variant="caption" style={{ marginTop: 4 }}>{d.date}</AppText>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
