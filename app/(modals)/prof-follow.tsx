import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { followProfessor } from "../../src/features/auth/authRepo";

export default function ProfFollow() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");

  return (
    <Screen>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginBottom: 12 }}>
        Suivre un professeur
      </Text>

      <View style={{ gap: 10 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nom du professeur"
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
          value={handle}
          onChangeText={setHandle}
          placeholder="@handle"
          placeholderTextColor="rgba(255,255,255,0.35)"
          autoCapitalize="none"
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
            await followProfessor(name, handle);
            router.back();
          }}
          style={{
            backgroundColor: "white",
            padding: 12,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#111217", fontWeight: "900" }}>Suivre</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
