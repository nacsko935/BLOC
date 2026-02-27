import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function PlanFab({
  visible,
  onOpen,
  onClose,
  onAddGoal,
  onAddDeadline,
  onAddProject,
}: {
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAddGoal: () => void;
  onAddDeadline: () => void;
  onAddProject: () => void;
}) {
  return (
    <>
      <Pressable onPress={onOpen} style={styles.fab}>
        <Ionicons name="add" size={26} color="#FFF" />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.sheet}>
            <Pressable style={styles.item} onPress={() => { onClose(); onAddGoal(); }}>
              <Text style={styles.itemText}>Ajouter un objectif</Text>
            </Pressable>
            <Pressable style={styles.item} onPress={() => { onClose(); onAddDeadline(); }}>
              <Text style={styles.itemText}>Ajouter une deadline</Text>
            </Pressable>
            <Pressable style={styles.item} onPress={() => { onClose(); onAddProject(); }}>
              <Text style={styles.itemText}>Creer un projet</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5B4CFF",
    borderWidth: 1,
    borderColor: "#877CFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 9,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    padding: 16,
  },
  sheet: {
    backgroundColor: "#0F1012",
    borderWidth: 1,
    borderColor: "#23252A",
    borderRadius: 18,
    overflow: "hidden",
  },
  item: { paddingHorizontal: 14, paddingVertical: 14 },
  itemText: { color: "#FFF", fontWeight: "700" },
});
