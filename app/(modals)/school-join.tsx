import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { joinSchool } from "../../src/features/auth/authRepo";

export default function SchoolJoin() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <Screen>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginBottom: 12 }}>
        Code école
      </Text>
      <View style={{ gap: 10 }}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="EX: ESGI2025"
          placeholderTextColor="rgba(255,255,255,0.35)"
          autoCapitalize="characters"
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
            await joinSchool(code);
            router.back();
          }}
          style={{
            backgroundColor: "white",
            padding: 12,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#111217", fontWeight: "900" }}>Valider</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
