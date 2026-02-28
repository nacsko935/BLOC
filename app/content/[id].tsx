import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { homePostsMock } from "../../src/features/home/homeMock";

export default function ContentDetailScreen() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = homePostsMock.find((item) => item.id === id);
  return (
    <View style={{ flex: 1, backgroundColor: c.background, padding: 20, justifyContent: "center" }}>
      <Text style={{ color: c.textPrimary, fontSize: 24, fontWeight: "700" }}>{post?.title ?? "Contenu"}</Text>
      <Text style={{ color: c.textPrimary, marginTop: 8, fontSize: 16 }}>Aperçu du contenu de cours</Text>
      <Text style={{ color: c.textSecondary, marginTop: 8 }}>Écran mock V1 prêt pour intégration.</Text>
    </View>
  );
}
