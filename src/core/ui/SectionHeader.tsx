import { View, Text, Pressable } from "react-native";
import { theme } from "./theme";

export default function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text style={{ color: theme.colors.textMuted, fontWeight: "700" }}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
}
