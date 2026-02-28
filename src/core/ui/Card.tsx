import { useTheme } from "../theme/ThemeProvider";
import { ReactNode } from "react";
import { View, ViewStyle, StyleProp } from "react-native";

type CardVariant = "default" | "elevated" | "outlined";

export default function Card({
  children,
  style,
  variant = "default",
  accentColor,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  accentColor?: string;
}) {
  const { c, isDark } = useTheme();
  const isElevated = variant === "elevated";
  const isOutlined = variant === "outlined";

  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: isOutlined ? c.borderStrong : c.border,
          shadowColor: "#000",
          shadowOpacity: isDark ? (isElevated ? 0.25 : 0.16) : (isElevated ? 0.08 : 0.04),
          shadowRadius: isElevated ? 14 : 8,
          shadowOffset: { width: 0, height: isElevated ? 8 : 4 },
          elevation: isElevated ? 7 : 3,
          borderLeftWidth: accentColor ? 3 : 1,
          borderLeftColor: accentColor ?? (isOutlined ? c.borderStrong : c.border),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
