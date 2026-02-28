import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../core/theme/ThemeProvider";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  tone?: "default" | "danger";
  onPress?: () => void;
};

export function SettingsRow({ icon, title, subtitle, tone = "default", onPress }: Props) {
  const { c } = useTheme();
  const danger = tone === "danger";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        minHeight: 56, borderRadius: 14, borderWidth: 1,
        borderColor: c.border, backgroundColor: c.card,
        paddingHorizontal: 14, paddingVertical: 10,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }, pressed && { opacity: 0.82 }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={icon} size={18} color={danger ? "#FF6B6B" : c.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: danger ? "#FF6B6B" : c.textPrimary, fontSize: 15, fontWeight: "700" }}>{title}</Text>
          {subtitle ? <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 1 }}>{subtitle}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
    </Pressable>
  );
}
