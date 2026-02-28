import { useTheme } from "../theme/ThemeProvider";
import { View } from "react-native";

export function ProgressBar({ value, color = "#6E5CFF", height = 8 }: {
  value: number; color?: string; height?: number;
}) {
  const { c } = useTheme();
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height, backgroundColor: c.cardAlt, borderRadius: 999, overflow: "hidden" }}>
      <View style={{ width: `${safeValue}%`, height: "100%", backgroundColor: color }} />
    </View>
  );
}
