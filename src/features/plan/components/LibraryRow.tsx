import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LibraryItem } from "../types";

type Props = {
  item: LibraryItem;
  onPress: () => void;
  onOpenMenu: () => void;
  onLongPress: () => void;
};

function typeIcon(type: LibraryItem["type"]) {
  if (type === "pdf") return "document-text-outline";
  if (type === "flashcards") return "albums-outline";
  if (type === "quiz") return "help-circle-outline";
  if (type === "folder") return "folder-open-outline";
  if (type === "project") return "briefcase-outline";
  if (type === "group") return "people-outline";
  return "reader-outline";
}

export function LibraryRow({ item, onPress, onOpenMenu, onLongPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.thumb}>
        <Ionicons name={typeIcon(item.type)} size={19} color="#E9EBEE" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle || `${item.subject} • ${new Date(item.updatedAt ?? item.createdAt).toLocaleDateString("fr-FR")}`}
        </Text>
      </View>
      <View style={styles.right}>
        {item.isPinned ? <Ionicons name="pin-outline" size={14} color="#A7AFBC" /> : null}
        {item.isLocked ? <Ionicons name="lock-closed-outline" size={14} color="#A7AFBC" /> : null}
        <Pressable style={styles.menuBtn} onPress={onOpenMenu}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#D9DEE6" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#101215",
    borderWidth: 1,
    borderColor: "#25282D",
    borderRadius: 16,
    padding: 10,
  },
  pressed: { opacity: 0.92 },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1E2126",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  title: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  subtitle: { color: "#959CA9", marginTop: 4, fontSize: 12 },
  right: { alignItems: "flex-end", gap: 6 },
  menuBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
