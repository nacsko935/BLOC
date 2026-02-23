import { ScrollView, Pressable, View } from "react-native";
import { Pill } from "../../../core/ui/Pill";
import { HomeTabKey } from "../types";

export function HomeTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: HomeTabKey[];
  active: HomeTabKey;
  onChange: (tab: HomeTabKey) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {tabs.map((tab) => (
          <Pressable key={tab} onPress={() => onChange(tab)}>
            <Pill active={active === tab}>{tab.replace("Abonne", "Abonne")}</Pill>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
