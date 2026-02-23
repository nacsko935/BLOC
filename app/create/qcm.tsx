import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { AppHeader } from "../../src/core/ui/AppHeader";
import { AppInput } from "../../src/core/ui/AppInput";
import { AppButton } from "../../src/core/ui/AppButton";

export default function CreateQcmScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Creer QCM" subtitle="Configure et genere" rightLabel="Fermer" onRightPress={() => router.back()} />
        <AppInput label="Titre" value={title} onChangeText={setTitle} placeholder="Ex: QCM Reseaux" />
        <AppInput label="Matiere" value={subject} onChangeText={setSubject} placeholder="Ex: Reseaux" />
        <AppButton onPress={() => Alert.alert("Stub IA", "QCM genere (stub)")}>Generer avec IA</AppButton>
      </ScrollView>
    </Screen>
  );
}
