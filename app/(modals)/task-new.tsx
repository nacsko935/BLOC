import { useState } from "react";
import { TextInput, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { createTask } from "../../src/features/tasks/tasksRepo";

export default function TaskNew() {
  const router = useRouter();
  const [title, setTitle] = useState("");

  return (
    <Screen>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginBottom: 12 }}>
        Nouvelle tâche
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

        <Pressable
          onPress={async () => {
            const id = await createTask(title, null);
            router.replace(`/task/${id}`);
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
