import { Pressable, StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "./ProgressBar";

type Props = {
  title: string;
  lessonLabel: string;
  percent: number;
  onPress: () => void;
};

export function ContinueCard({ title, lessonLabel, percent, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <Text style={styles.lesson}>{lessonLabel}</Text>
      <ProgressBar value={percent} />
      <Text style={styles.resume}>Reprendre</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#FFF", fontSize: 16, fontWeight: "800", flex: 1, paddingRight: 8 },
  percent: { color: "#FF737F", fontSize: 12, fontWeight: "800" },
  lesson: { color: "#9A9A9A", marginTop: 6, marginBottom: 10 },
  resume: { color: "#FFFFFF", fontSize: 13, marginTop: 9, fontWeight: "700" },
});
