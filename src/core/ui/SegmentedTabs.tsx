import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "./theme";

export type SegmentedItem<T extends string = string> = { key: T; label: string };

type Props<T extends string> = {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (key: T) => void;
};

export default function SegmentedTabs<T extends string>({ items, value, onChange }: Props<T>) {
  return (
    <View style={styles.root}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.pressed]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: {
    backgroundColor: theme.colors.accentSoft,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  labelActive: {
    color: "#F2F1FF",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
