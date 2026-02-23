import React, { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Screen from "../../src/core/ui/Screen";
import { AppHeader } from "../../src/core/ui/AppHeader";
import Card from "../../src/core/ui/Card";
import { AppText } from "../../src/core/ui/AppText";
import { AppButton } from "../../src/core/ui/AppButton";

export default function CreateImportScreen() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);

  const pickFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "application/msword", "text/plain"] });
    if (!picked.canceled && picked.assets?.[0]) {
      setFileName(picked.assets[0].name);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Importer" subtitle="Ajoute ton fichier puis genere avec IA" rightLabel="Fermer" onRightPress={() => router.back()} />
        <Pressable onPress={pickFile}>
          <Card>
            <AppText style={{ fontWeight: "800" }}>Selectionner un fichier</AppText>
            <AppText muted variant="caption" style={{ marginTop: 6 }}>{fileName ?? "Aucun fichier selectionne"}</AppText>
          </Card>
        </Pressable>
        <Card>
          <AppText variant="caption" muted>Metadata</AppText>
          <AppText style={{ marginTop: 6 }}>Type: Document</AppText>
          <AppText style={{ marginTop: 4 }}>Source: Local device</AppText>
        </Card>
        <AppButton onPress={() => Alert.alert("Stub IA", "Generation lancee (stub)")}>Generer avec IA</AppButton>
      </ScrollView>
    </Screen>
  );
}
