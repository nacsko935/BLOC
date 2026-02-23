import { View } from "react-native";
import { Avatar } from "../../../core/ui/Avatar";
import { AppText } from "../../../core/ui/AppText";
import { ProgressBar } from "../../../core/ui/ProgressBar";
import Card from "../../../core/ui/Card";
import { Course } from "../coursesData";

export function CourseHeader({ course }: { course: Course }) {
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={course.name} size={54} />
        <View style={{ flex: 1 }}>
          <AppText style={{ fontWeight: "800" }}>{course.name}</AppText>
          <AppText muted variant="caption" style={{ marginTop: 4 }}>
            {course.professor.name}
          </AppText>
        </View>
        <AppText>{course.icon}</AppText>
      </View>
      <View style={{ marginTop: 12 }}>
        <ProgressBar value={course.stats.progress} color={course.color} />
      </View>
    </Card>
  );
}
