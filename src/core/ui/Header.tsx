import { View, Text, Pressable } from "react-native";
import { theme } from "./theme";

export default function Header({
  title,
  rightText,
  onRightPress,
}: {
  title: string;
  rightText?: string;
  onRightPress?: () => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "800" }}>{title}</Text>

      {rightText ? (
        <Pressable onPress={onRightPress}>
          <Text style={{ color: theme.colors.textMuted, fontWeight: "700" }}>{rightText}</Text>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
}
