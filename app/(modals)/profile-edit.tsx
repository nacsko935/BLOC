import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { getSessionUser, updateProfile } from "../../src/features/auth/authRepo";

export default function ProfileEdit() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [campus, setCampus] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getSessionUser();
      if (!user) return;
      setName(user.name);
      setHandle(user.handle);
      setBio(user.bio ?? "");
      setCampus(user.campus ?? "");
    })();
  }, []);

  return (
    <Screen>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginBottom: 12 }}>
        Éditer le profil
      </Text>

      <View style={{ gap: 10 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nom"
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
          placeholder="@pseudo"
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
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
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
          value={campus}
          onChangeText={setCampus}
          placeholder="Campus"
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
            await updateProfile({
              name,
              handle,
              bio,
              campus,
            });
            router.back();
          }}
          style={{
            backgroundColor: "white",
            padding: 12,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#111217", fontWeight: "900" }}>Enregistrer</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
