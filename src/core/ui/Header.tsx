import { useTheme } from "../theme/ThemeProvider";
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
      <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>{title}</Text>

      {rightText ? (
        <Pressable onPress={onRightPress}>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontWeight: "700" }}>{rightText}</Text>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
}
