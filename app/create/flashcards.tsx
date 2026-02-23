import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { AppHeader } from "../../src/core/ui/AppHeader";
import { AppInput } from "../../src/core/ui/AppInput";
import { AppButton } from "../../src/core/ui/AppButton";

export default function CreateFlashcardsScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("20");

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Creer Flashcards" subtitle="Generation rapide" rightLabel="Fermer" onRightPress={() => router.back()} />
        <AppInput label="Sujet" value={topic} onChangeText={setTopic} placeholder="Ex: Derivees" />
        <AppInput label="Nombre de cartes" value={count} onChangeText={setCount} placeholder="20" keyboardType="number-pad" />
        <AppButton onPress={() => Alert.alert("Stub IA", "Flashcards generees (stub)")}>Generer avec IA</AppButton>
      </ScrollView>
    </Screen>
  );
}
