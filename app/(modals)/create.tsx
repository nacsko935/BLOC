import { useRouter } from "expo-router";
import { Alert, View } from "react-native";
import BottomSheet from "../../src/core/ui/BottomSheet";
import ListItem from "../../src/core/ui/ListItem";
import { AppButton } from "../../src/core/ui/AppButton";

export default function CreateModal() {
  const router = useRouter();

  return (
    <BottomSheet title="Creer" onClose={() => router.back()}>
      <ListItem
        title="Importer un fichier"
        subtitle="PDF, image, doc"
        icon="📎"
        onPress={() => router.replace("/create/import")}
      />
      <ListItem
        title="Audio"
        subtitle="Enregistrer / importer"
        icon="🎙️"
        onPress={() => router.replace("/create/audio")}
      />
      <ListItem
        title="Creer un QCM"
        subtitle="Questions + reponses"
        icon="🧪"
        onPress={() => router.replace("/(modals)/qcm-new")}
      />
      <ListItem
        title="Creer une fiche"
        subtitle="Note structuree"
        icon="📝"
        onPress={() => router.replace("/(modals)/note-new")}
      />
      <ListItem
        title="Creer un resume"
        subtitle="Synthese rapide"
        icon="🧠"
        onPress={() => router.replace("/create/pdf")}
      />
      <ListItem
        title="Scanner"
        subtitle="A venir"
        icon="📷"
        onPress={() => Alert.alert("Scanner", "Cette action arrive tres bientot.")}
      />
      <ListItem
        title="Outils d'etude"
        subtitle="Flashcards, mindmap, planning"
        icon="⚙️"
        onPress={() => router.replace("/create/flashcards")}
      />

      <View style={{ marginTop: 8 }}>
        <AppButton variant="secondary" onPress={() => router.back()}>
          Annuler
        </AppButton>
      </View>
    </BottomSheet>
  );
}
