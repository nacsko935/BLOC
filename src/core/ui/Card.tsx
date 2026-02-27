import { ReactNode } from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { theme } from "./theme";

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
  const isElevated = variant === "elevated";
  const isOutlined = variant === "outlined";
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: isOutlined ? theme.colors.borderStrong : theme.colors.border,
          shadowColor: "#000",
          shadowOpacity: isElevated ? 0.25 : 0.16,
          shadowRadius: isElevated ? 14 : 8,
          shadowOffset: { width: 0, height: isElevated ? 8 : 4 },
          elevation: isElevated ? 7 : 3,
          borderLeftWidth: accentColor ? 3 : 1,
          borderLeftColor: accentColor ?? (isOutlined ? theme.colors.borderStrong : theme.colors.border),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
