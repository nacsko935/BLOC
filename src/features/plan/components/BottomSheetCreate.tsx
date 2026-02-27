import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateProject: () => void;
  onImportPdf: () => void;
  onImportNotes: () => void;
  onCreateFolder: () => void;
};

export function BottomSheetCreate({
  visible,
  onClose,
  onCreateProject,
  onImportPdf,
  onImportNotes,
  onCreateFolder,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Nouveau</Text>
          <Pressable style={styles.item} onPress={() => { onClose(); onCreateProject(); }}>
            <Text style={styles.label}>Nouveau projet</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => { onClose(); onImportPdf(); }}>
            <Text style={styles.label}>Importer PDF</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => { onClose(); onImportNotes(); }}>
            <Text style={styles.label}>Importer Notes</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => { onClose(); onCreateFolder(); }}>
            <Text style={styles.label}>Créer dossier</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    padding: 14,
  },
  sheet: {
    backgroundColor: "#0F1012",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#25282D",
    overflow: "hidden",
  },
  title: { color: "#FFFFFF", fontWeight: "900", fontSize: 17, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  item: { paddingHorizontal: 14, paddingVertical: 13 },
  label: { color: "#E9EDF2", fontWeight: "700" },
});
