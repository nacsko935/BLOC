import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export type SegmentedItem<T extends string = string> = { key: T; label: string };
type Props<T extends string> = { items: SegmentedItem<T>[]; value: T; onChange: (key: T) => void };

export default function SegmentedTabs<T extends string>({ items, value, onChange }: Props<T>) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 0 }}>
      {items.map(item => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [{ flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: active ? c.accentPurple : "transparent" }, pressed && { opacity: 0.75 }]}
          >
            <Text style={{ color: active ? c.accentPurple : c.textSecondary, fontWeight: active ? "800" : "600", fontSize: 14 }}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
