import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { homePostsMock } from "../../src/features/home/homeMock";

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = homePostsMock.find((item) => item.id === id);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{post?.fileTitle ?? post?.title ?? "Contenu"}</Text>
      <Text style={styles.text}>{post?.fileMeta ?? "Apercu du contenu de cours"}</Text>
      <Text style={styles.muted}>Ecran mock V1 pour PDF/QCM.</Text>
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