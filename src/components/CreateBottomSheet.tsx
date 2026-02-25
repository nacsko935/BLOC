import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

export type CreateActionKey = "post" | "pdf" | "qcm" | "group";

type CreateBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onActionPress: (key: CreateActionKey) => void;
};

const actions: { key: CreateActionKey; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "post", title: "Publier un post", subtitle: "Partager une info a ta promo", icon: "create-outline" },
  { key: "pdf", title: "Importer un fichier", subtitle: "PDF, notes ou support", icon: "document-outline" },
  { key: "qcm", title: "Generer un QCM", subtitle: "Quiz rapide de revision", icon: "help-circle-outline" },
  { key: "group", title: "Creer un groupe", subtitle: "Lancer un groupe de travail", icon: "people-outline" },
];

export function CreateBottomSheet({ visible, onClose, onActionPress }: CreateBottomSheetProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.labelPill}>
            <Text style={styles.labelPillText}>Nouvelle publication</Text>
          </View>

          {actions.map((action) => (
            <Pressable key={action.key} style={styles.actionRow} onPress={() => onActionPress(action.key)}>
              <View style={styles.iconWrap}>
                <Ionicons name={action.icon} size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#090909",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 26,
    gap: 10,
  },
  labelPill: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 6,
  },
  labelPillText: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 12,
  },
  actionRow: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    color: colors.text,
    fontWeight: "700",
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});