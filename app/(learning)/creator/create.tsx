import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../../../src/core/ui/AppButton";
import { useAuthStore } from "../../../state/useAuthStore";

function isCertifiedProfile(profile: Record<string, unknown> | null) {
  if (!profile) return false;
  return profile.role === "certified" || profile.account_type === "certified" || profile.is_certified === true;
}

export default function LearningCreatorCreateScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile) as Record<string, unknown> | null;
  const certified = isCertifiedProfile(profile);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const disabled = useMemo(() => !title.trim() || !description.trim(), [title, description]);

  if (!certified) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Acces refuse</Text>
        <Text style={styles.subtitle}>Tu dois etre certifie pour creer un module.</Text>
        <AppButton style={styles.red} onPress={() => router.replace("/(learning)/creator")}>
          Retour creator
        </AppButton>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Nouveau module</Text>
      <Text style={styles.subtitle}>Wizard rapide: titre, description, tags</Text>

      <TextInput
        style={styles.input}
        placeholder="Titre du module"
        placeholderTextColor="#737373"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textarea]}
        multiline
        placeholder="Description"
        placeholderTextColor="#737373"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Tags (ex: web,js,starter)"
        placeholderTextColor="#737373"
        value={tags}
        onChangeText={setTags}
      />

      <AppButton
        style={styles.red}
        disabled={disabled}
        onPress={() => {
          Alert.alert("Module cree", "Brouillon cree (placeholder).");
          router.replace("/(learning)/creator/modules");
        }}
      >
        Enregistrer brouillon
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000", paddingTop: 58, paddingHorizontal: 16 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900" },
  subtitle: { color: "#9A9A9A", marginTop: 4, marginBottom: 12 },
  input: {
    backgroundColor: "#111",
    borderColor: "#222",
    borderWidth: 1,
    borderRadius: 16,
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  textarea: { minHeight: 110, textAlignVertical: "top" },
  red: { backgroundColor: "#FF4D5E" },
});
