import { useState } from "react";
import { TextInput, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { createQcm } from "../../src/features/qcm/store";

export default function QcmNew() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState("5");

  return (
    <Screen>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginBottom: 12 }}>
        Créer un QCM
      </Text>

      <View style={{ gap: 10 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titre du QCM"
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
          value={subject}
          onChangeText={setSubject}
          placeholder="Matière"
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
          value={questions}
          onChangeText={setQuestions}
          placeholder="Nombre de questions"
          keyboardType="number-pad"
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

        <Pressable
          onPress={() => {
            const id = createQcm({
              title,
              subject,
              questions: Number(questions) || 5,
            });
            router.replace(`/qcm/${id}`);
          }}
          style={{
            backgroundColor: "white",
            padding: 12,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "900" }}>Enregistrer & lancer</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
