import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { trendsMock } from "../../src/features/home/homeMock";

export default function TrendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trend = trendsMock.find((item) => item.id === id);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{trend?.title ?? "Tendance"}</Text>
      <Text style={styles.text}>Tag: {trend?.tag ?? "#bloc"}</Text>
      <Text style={styles.muted}>Ecran mock V1 pret pour integration contenu reel.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  text: {
    color: colors.text,
    marginTop: 8,
    fontSize: 16,
  },
  muted: {
    color: colors.textMuted,
    marginTop: 8,
  },
});