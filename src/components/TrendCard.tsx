import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { TrendItem } from "../features/home/homeMock";

type TrendCardProps = {
  item: TrendItem;
  onPress: (item: TrendItem) => void;
};

export function TrendCard({ item, onPress }: TrendCardProps) {
  return (
    <Pressable onPress={() => onPress(item)} style={styles.card}>
      <LinearGradient colors={item.thumbnail} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
        <View style={styles.playWrap}>
          <Ionicons name="play" size={16} color={colors.text} />
        </View>
      </LinearGradient>
      <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
      <Text style={styles.tag}>{item.tag}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 188,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginRight: 10,
  },
  thumb: {
    height: 106,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  playWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  title: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
    marginTop: 10,
  },
  tag: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
});