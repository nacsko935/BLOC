import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { PlanPill } from "./PlanPill";

export type LibraryQuickFilter = "all" | "recent" | "favorites" | "shared" | "archived";

const options: Array<{ key: LibraryQuickFilter; label: string }> = [
  { key: "all", label: "Tout" },
  { key: "recent", label: "Recents" },
  { key: "favorites", label: "Favoris" },
  { key: "shared", label: "Partages" },
  { key: "archived", label: "Archives" },
];

type Props = {
  value: LibraryQuickFilter;
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: LibraryQuickFilter) => void;
};

export function FilterDropdown({ value, visible, onOpen, onClose, onChange }: Props) {
  const label = options.find((option) => option.key === value)?.label ?? "Tout";
  return (
    <>
      <PlanPill label={label} onPress={onOpen} />
      <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.menu}>
            {options.map((option) => (
              <Pressable
                key={option.key}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => {
                  onClose();
                  onChange(option.key);
                }}
              >
                <Text style={[styles.itemLabel, option.key === value && styles.itemLabelActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-start", paddingTop: 170, paddingHorizontal: 14 },
  menu: {
    backgroundColor: "#111316",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#292C31",
    overflow: "hidden",
    width: 190,
  },
  item: { paddingHorizontal: 12, paddingVertical: 11 },
  itemPressed: { backgroundColor: "#1A1C20" },
  itemLabel: { color: "#D9DDE3", fontWeight: "700" },
  itemLabelActive: { color: "#FFFFFF" },
});
