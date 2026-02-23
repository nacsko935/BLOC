import { PropsWithChildren } from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { AppText } from "./AppText";
import { theme } from "./theme";

export function Pill({
  children,
  active,
  tone = "neutral",
  style,
}: PropsWithChildren<{ active?: boolean; tone?: "neutral" | "blue"; style?: StyleProp<ViewStyle> }>) {
  const isBlue = tone === "blue";
  return (
    <View
      style={[
        {
          minHeight: 34,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: theme.radius.pill,
          backgroundColor: active ? (isBlue ? theme.colors.accent : "#fff") : theme.colors.surface,
          borderWidth: 1,
          borderColor: active && isBlue ? theme.colors.accent : theme.colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <AppText
        variant="caption"
        style={{
          color: active ? (isBlue ? "#fff" : "#111217") : theme.colors.textMuted,
          fontWeight: "700",
        }}
      >
        {children}
      </AppText>
    </View>
  );
}
