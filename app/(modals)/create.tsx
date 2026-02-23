import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import BottomSheet from "../../src/core/ui/BottomSheet";
import ListItem from "../../src/core/ui/ListItem";

export default function CreateModal() {
  const router = useRouter();

  return (
    <BottomSheet title="Créer" onClose={() => router.back()}>
      <ListItem title="Importer un fichier" subtitle="PDF, image, doc" icon="📎" onPress={() => {}} />
      <ListItem title="Audio" subtitle="Enregistrer / importer" icon="🎙️" onPress={() => {}} />
      <ListItem
        title="Créer un QCM"
        subtitle="Questions + réponses"
        icon="🧪"
        onPress={() => router.replace("/(modals)/qcm-new")}
      />
      <ListItem
        title="Créer une fiche"
        subtitle="Note structurée"
        icon="📝"
        onPress={() => router.replace("/(modals)/note-new")}
      />
      <ListItem title="Créer un résumé" subtitle="Synthèse rapide" icon="🧠" onPress={() => {}} />
      <ListItem title="Scanner" subtitle="Optionnel" icon="📷" onPress={() => {}} />
      <ListItem title="Outils d’étude" subtitle="Flashcards, mindmap, planning" icon="⚙️" onPress={() => {}} />

      <View style={{ alignItems: "center", marginTop: 4 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "800" }}>Annuler</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
