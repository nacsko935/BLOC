import { useState } from "react";
import { TextInput, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { createNote } from "../../src/features/notes/notesRepo";

export default function NoteNew() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <Screen>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginBottom: 12 }}>
        Nouvelle fiche
      </Text>

      <View style={{ gap: 10 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titre"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={{
            color: "white",
            backgroundColor: "#14151a",
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        />

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Contenu"
          placeholderTextColor="rgba(255,255,255,0.35)"
          multiline
          style={{
            color: "white",
            backgroundColor: "#14151a",
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            minHeight: 120,
            textAlignVertical: "top",
          }}
        />

        <Pressable
          onPress={async () => {
            const id = await createNote(title, content);
            router.replace(`/note/${id}`);
          }}
          style={{
            backgroundColor: "white",
            padding: 12,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "900" }}>Créer</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
