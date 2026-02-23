import { Pressable, View } from "react-native";
import { Pill } from "../../../core/ui/Pill";

export type CourseTabKey = "Notes" | "QCM" | "Files" | "Revision";

export function CourseTabs({
  active,
  onChange,
}: {
  active: CourseTabKey;
  onChange: (tab: CourseTabKey) => void;
}) {
  const tabs: CourseTabKey[] = ["Notes", "QCM", "Files", "Revision"];
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      {tabs.map((tab) => (
        <Pressable key={tab} onPress={() => onChange(tab)}>
          <Pill active={active === tab}>{tab}</Pill>
        </Pressable>
      ))}
    </View>
  );
}
