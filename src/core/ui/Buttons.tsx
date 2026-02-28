import { useTheme } from "../theme/ThemeProvider";
import { PropsWithChildren } from "react";
import { PressableProps } from "react-native";
import { PressableScale } from "./PressableScale";
import { AppText } from "./AppText";

type ButtonProps = PropsWithChildren<Omit<PressableProps, "style"> & { style?: any }>;

export function PrimaryButton({ children, style, ...props }: ButtonProps) {
  const { c } = useTheme();
  return (
    <PressableScale {...props} style={[{ backgroundColor: c.accentPurple, borderRadius: 14,
      minHeight: 44, paddingHorizontal: 16, paddingVertical: 12,
      alignItems: "center", justifyContent: "center" }, style]}>
      <AppText variant="body" style={{ color: "#fff", fontWeight: "800" }}>{children}</AppText>
    </PressableScale>
  );
}

export function SecondaryButton({ children, style, ...props }: ButtonProps) {
  const { c } = useTheme();
  return (
    <PressableScale {...props} style={[{ backgroundColor: c.cardAlt, borderRadius: 14,
      minHeight: 44, paddingHorizontal: 16, paddingVertical: 12,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: c.border }, style]}>
      <AppText variant="body" style={{ fontWeight: "700" }}>{children}</AppText>
    </PressableScale>
  );
}
