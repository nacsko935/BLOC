import React, { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Screen from "../../src/core/ui/Screen";
import { AppHeader } from "../../src/core/ui/AppHeader";
import Card from "../../src/core/ui/Card";
import { AppText } from "../../src/core/ui/AppText";
import { AppButton } from "../../src/core/ui/AppButton";

export default function CreateAudioScreen() {
  const router = useRouter();
  const [audioName, setAudioName] = useState<string | null>(null);

  const pickAudio = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: ["audio/*"] });
    if (!picked.canceled && picked.assets?.[0]) setAudioName(picked.assets[0].name);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Import audio" subtitle="Audio vers fiche/QCM" rightLabel="Fermer" onRightPress={() => router.back()} />
        <Card>
          <AppText>Fichier: {audioName ?? "Aucun"}</AppText>
        </Card>
        <AppButton onPress={pickAudio}>Choisir audio</AppButton>
        <AppButton onPress={() => Alert.alert("Stub IA", "Transcription et generation lancees (stub)")}>Generer avec IA</AppButton>
      </ScrollView>
    </Screen>
  );
}
