import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type ActionItem = {
  id: string;
  label: string;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  actions: ActionItem[];
};

export function FloatingActionButton({ visible, onOpen, onClose, actions }: Props) {
  return (
    <>
      <Pressable onPress={onOpen} style={styles.fab}>
        <Ionicons name="menu" size={22} color="#FFF" />
      </Pressable>

      <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.sheet}>
            {actions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => {
                  onClose();
                  action.onPress();
                }}
                style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              >
                <Text style={styles.itemText}>{action.label}</Text>
              </Pressable>
            ))}
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
    bottom: 28,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E64558",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF7482",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    padding: 16,
  },
  sheet: {
    backgroundColor: "#0F0F10",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#232326",
    paddingVertical: 8,
  },
  item: { paddingHorizontal: 14, paddingVertical: 13 },
  pressed: { backgroundColor: "#1A1B1D" },
  itemText: { color: "#FFF", fontWeight: "700" },
});
