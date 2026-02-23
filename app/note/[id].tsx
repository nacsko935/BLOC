import { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import Card from "../../src/core/ui/Card";
import { deleteNote, getNote } from "../../src/features/notes/notesRepo";

export default function NoteDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setNote(await getNote(String(id)));
    })();
  }, [id]);

  if (!note) {
    return (
      <Screen>
        <Text style={{ color: "rgba(255,255,255,0.7)" }}>Chargement…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>{note.title}</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 10 }}>{note.content || "(vide)"}</Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Pressable
            onPress={async () => {
              await deleteNote(note.id);
              router.replace("/(tabs)/home");
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#1b1b24" }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Supprimer</Text>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}
