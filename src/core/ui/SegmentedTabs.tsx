import { Pressable, StyleSheet, Text, View } from "react-native";

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
    backgroundColor: "#111115",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#202029",
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: {
    backgroundColor: "#2B2670",
  },
  label: {
    color: "#8E8E99",
    fontSize: 13,
    fontWeight: "700",
  },
  labelActive: {
    color: "#F2F1FF",
  },
  pressed: {
    opacity: 0.85,
  },
});
