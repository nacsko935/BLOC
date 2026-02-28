import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "../core/theme/ThemeProvider";

export type CreateActionKey = "post" | "pdf" | "qcm" | "group";

type CreateBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onActionPress: (key: CreateActionKey) => void;
};

const actions: { key: CreateActionKey; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "post",  title: "Publier un post",     subtitle: "Partager une info à ta promo", icon: "create-outline"      },
  { key: "pdf",   title: "Importer un fichier", subtitle: "PDF, notes ou support",         icon: "document-outline"    },
  { key: "qcm",   title: "Générer un QCM",      subtitle: "Quiz rapide de révision",       icon: "help-circle-outline" },
  { key: "group", title: "Créer un groupe",      subtitle: "Lancer un groupe de travail",  icon: "people-outline"      },
];

export function CreateBottomSheet({ visible, onClose, onActionPress }: CreateBottomSheetProps) {
  const { c, isDark } = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View style={{ backgroundColor: isDark ? "#090909" : c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: c.border, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 26, gap: 10 }}>
          <View style={{ alignSelf: "center", backgroundColor: isDark ? "#FFFFFF" : c.accentPurple, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 6 }}>
            <Text style={{ color: isDark ? "#111111" : "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Nouvelle publication</Text>
          </View>
          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => onActionPress(action.key)}
              style={({ pressed }) => [{ minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12 }, pressed && { opacity: 0.85 }]}
            >
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={action.icon} size={18} color={c.accentPurple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textPrimary, fontWeight: "700" }}>{action.title}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}
