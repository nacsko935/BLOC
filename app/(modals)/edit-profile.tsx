import { useTheme } from "../../src/core/theme/ThemeProvider";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

export default function EditProfileModal() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [campus, setCampus] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom est requis");
      return;
    }

    setLoading(true);

    try {
      // Simuler la sauvegarde (en production: API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Parser les compétences
      const skillsList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      void skillsList;

      Alert.alert("Succès", "Profil mis à jour !", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Informations de base */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Informations de base</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Marie Dupont"
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Parlez-nous de vous..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.textArea}
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </View>
          </View>

          {/* Études */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎓 Études</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>École / Université</Text>
              <TextInput
                value={school}
                onChangeText={setSchool}
                placeholder="Ex: ESGI Paris"
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Niveau</Text>
              <TextInput
                value={level}
                onChangeText={setLevel}
                placeholder="Ex: Licence 3, Master 2..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus</Text>
              <TextInput
                value={campus}
                onChangeText={setCampus}
                placeholder="Ex: Paris, Lyon..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Spécialisation</Text>
              <TextInput
                value={specialization}
                onChangeText={setSpecialization}
                placeholder="Ex: Cybersécurité, IA..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
              />
            </View>
          </View>

          {/* Compétences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Compétences</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Compétences (séparées par des virgules)
              </Text>
              <TextInput
                value={skills}
                onChangeText={setSkills}
                placeholder="Ex: Python, React, Design..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
              />
              {skills.length > 0 && (
                <View style={styles.skillsPreview}>
                  {skills
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill, index) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </View>

          {/* Réseaux sociaux */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 Réseaux sociaux</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LinkedIn</Text>
              <TextInput
                value={linkedin}
                onChangeText={setLinkedin}
                placeholder="https://linkedin.com/in/..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GitHub</Text>
              <TextInput
                value={github}
                onChangeText={setGithub}
                placeholder="https://github.com/..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Site web</Text>
              <TextInput
                value={website}
                onChangeText={setWebsite}
                placeholder="https://..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              loading && styles.saveButtonDisabled,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Enregistrement..." : "💾 Enregistrer"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  form: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  textArea: {
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  skillsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    backgroundColor: "#6E5CFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  skillChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#6E5CFF",
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    marginTop: 8,
    ...theme.shadow.md,
  },
  saveButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});
