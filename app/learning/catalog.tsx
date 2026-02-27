import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Card from "../../src/core/ui/Card";

const modules = [
  { id: "web-basics", title: "Web Basics", level: "Debutant", duration: "4h", rating: 4.8 },
  { id: "ia-starter", title: "IA Starter", level: "Intermediaire", duration: "6h", rating: 4.6 },
  { id: "secu-101", title: "Securite 101", level: "Debutant", duration: "3h", rating: 4.7 },
];

export default function CatalogScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Catalogue modules</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/learning/module/[id]", params: { id: item.id } })}>
            <Card>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.level} â€¢ {item.duration} â€¢ {item.rating}/5</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52, marginBottom: 6 },
  itemTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  meta: { color: "#9A9A9A", marginTop: 6 },
});
