import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { trendsMock } from "../../src/features/home/homeMock";

export default function TrendDetailScreen() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trend = trendsMock.find((item) => item.id === id);
  return (
    <View style={{ flex: 1, backgroundColor: c.background, padding: 20, justifyContent: "center" }}>
      <Text style={{ color: c.textPrimary, fontSize: 24, fontWeight: "700" }}>{trend?.title ?? "Tendance"}</Text>
      <Text style={{ color: c.textPrimary, marginTop: 8 }}>Tag : {trend?.tag ?? "#bloc"}</Text>
      <Text style={{ color: c.textSecondary, marginTop: 8 }}>Écran mock V1 prêt pour intégration.</Text>
    </View>
  );
}
