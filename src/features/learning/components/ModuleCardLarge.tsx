import { Pressable, StyleSheet, Text, View } from "react-native";
import { Collection } from "../types";

type Props = {
  item: Collection;
  onPress?: () => void;
};

const toneMap: Record<Collection["tone"], string> = {
  red: "#311319",
  purple: "#23153A",
  blue: "#13263A",
  green: "#163221",
};

export function ModuleCardLarge({ item, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: toneMap[item.tone] }, pressed && styles.pressed]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {item.subtitle}
      </Text>
      <Text style={styles.count}>{item.moduleCount} modules</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 22,
    padding: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  pressed: { opacity: 0.94 },
  title: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  subtitle: { color: "#D8D8D8", marginTop: 6, fontSize: 13 },
  count: { color: "#FFFFFF", marginTop: 16, fontWeight: "700", fontSize: 12 },
});
