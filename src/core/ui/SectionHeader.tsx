import { useTheme } from "../theme/ThemeProvider";
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
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "800" }}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontWeight: "700" }}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
}
