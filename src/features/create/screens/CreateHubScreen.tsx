import React, { useState } from "react";
import { Alert, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../../core/ui/Screen";
import { AppHeader } from "../../../core/ui/AppHeader";
import { AppText } from "../../../core/ui/AppText";
import { AppButton } from "../../../core/ui/AppButton";
import Card from "../../../core/ui/Card";
import { useAuthStore } from "../../../../state/useAuthStore";
import { useFeedStore } from "../../../../state/useFeedStore";

export default function CreateHubScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { createPost } = useFeedStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filiere, setFiliere] = useState(profile?.filiere || "");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim() || !filiere.trim()) {
      Alert.alert("Champs requis", "Le contenu et la filiere sont obligatoires.");
      return;
    }

    try {
      setLoading(true);
      await createPost({ title: title.trim() || undefined, content, filiere, type: "text" });
      setTitle("");
      setContent("");
      router.back();
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de publier le post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 32 }}>
        <AppHeader title="Nouvelle publication" subtitle="Publie dans ton feed" />

        <Card>
          <View style={{ gap: 12 }}>
            <View>
              <AppText variant="caption" muted>Titre (optionnel)</AppText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Fiche SQL compacte"
                placeholderTextColor="#8D8D96"
                style={{ color: "white", borderBottomColor: "#2C2C35", borderBottomWidth: 1, paddingVertical: 8 }}
              />
            </View>

            <View>
              <AppText variant="caption" muted>Filiere</AppText>
              <TextInput
                value={filiere}
                onChangeText={setFiliere}
                placeholder="Ex: Informatique"
                placeholderTextColor="#8D8D96"
                style={{ color: "white", borderBottomColor: "#2C2C35", borderBottomWidth: 1, paddingVertical: 8 }}
              />
            </View>

            <View>
              <AppText variant="caption" muted>Contenu</AppText>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Partage un conseil, une ressource ou une question..."
                placeholderTextColor="#8D8D96"
                multiline
                style={{
                  color: "white",
                  borderColor: "#2C2C35",
                  borderWidth: 1,
                  borderRadius: 10,
                  minHeight: 120,
                  textAlignVertical: "top",
                  padding: 10,
                  marginTop: 6,
                }}
              />
            </View>

            <AppButton onPress={submit} disabled={loading}>{loading ? "Publication..." : "Publier"}</AppButton>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}