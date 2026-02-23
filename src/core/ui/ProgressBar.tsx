import { View } from "react-native";
import { theme } from "./theme";

type Props = {
  value: number;
  color?: string;
  height?: number;
};

export function ProgressBar({ value, color = theme.colors.accent, height = 8 }: Props) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <View
      style={{
        height,
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.radius.pill,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${safeValue}%`,
          height: "100%",
          backgroundColor: color,
        }}
      />
    </View>
  );
}
