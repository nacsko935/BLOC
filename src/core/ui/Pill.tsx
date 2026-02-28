import { useTheme } from "../theme/ThemeProvider";
import { PropsWithChildren } from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { AppText } from "./AppText";

export function Pill({ children, active, tone = "neutral", style }: PropsWithChildren<{
  active?: boolean; tone?: "neutral" | "blue"; style?: StyleProp<ViewStyle>;
}>) {
  const { c, isDark } = useTheme();
  const isBlue = tone === "blue";
  const bg = active
    ? (isBlue ? c.accentPurple : c.textPrimary)
    : c.cardAlt;
  const border = active && isBlue ? c.accentPurple : c.border;
  const textColor = active ? (isBlue ? "#fff" : (isDark ? "#000" : "#fff")) : c.textSecondary;
  return (
    <View style={[{ minHeight: 34, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
      backgroundColor: bg, borderWidth: 1, borderColor: border, alignItems: "center", justifyContent: "center" }, style]}>
      <AppText variant="caption" style={{ color: textColor, fontWeight: "700" }}>{children}</AppText>
    </View>
  );
}
