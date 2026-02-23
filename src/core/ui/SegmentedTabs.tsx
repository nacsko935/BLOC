import { View, Text, Pressable } from "react-native";
import { theme } from "./theme";

export type SegmentedItem = { key: string; label: string };

export default function SegmentedTabs({
  items,
  value,
  onChange,
}: {
  items: SegmentedItem[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 18 }}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)}>
            <View
              style={{
                paddingBottom: 6,
                borderBottomWidth: 2,
                borderBottomColor: active ? theme.colors.text : "transparent",
              }}
            >
              <Text
                style={{
                  color: active ? theme.colors.text : "rgba(255,255,255,0.55)",
                  fontWeight: "700",
                }}
              >
                {item.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
