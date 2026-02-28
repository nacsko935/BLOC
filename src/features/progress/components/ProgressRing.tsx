import { useTheme } from "../../../core/theme/ThemeProvider";
import { View } from "react-native";
import { AppText } from "../../../core/ui/AppText";
import { theme } from "../../../core/ui/theme";

export function ProgressRing({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <View
      style={{
        width: 92,
        height: 92,
        borderRadius: 46,
        borderWidth: 7,
        borderColor: "rgba(61,143,255,0.25)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText style={{ color: "#6E5CFF", fontWeight: "800" }}>{v}%</AppText>
    </View>
  );
}
