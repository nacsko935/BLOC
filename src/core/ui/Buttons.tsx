import { PropsWithChildren } from "react";
import { PressableProps } from "react-native";
import { PressableScale } from "./PressableScale";
import { AppText } from "./AppText";
import { theme } from "./theme";

type ButtonProps = PropsWithChildren<Omit<PressableProps, "style"> & { style?: any }>;

export function PrimaryButton({ children, style, ...props }: ButtonProps) {
  return (
    <PressableScale
      {...props}
      style={[
        {
          backgroundColor: theme.colors.accent,
          borderRadius: theme.radius.md,
          minHeight: 44,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <AppText variant="body" style={{ color: "#fff", fontWeight: "800" }}>
        {children}
      </AppText>
    </PressableScale>
  );
}

export function SecondaryButton({ children, style, ...props }: ButtonProps) {
  return (
    <PressableScale
      {...props}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          minHeight: 44,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.colors.borderStrong,
        },
        style,
      ]}
    >
      <AppText variant="body" style={{ fontWeight: "700" }}>
        {children}
      </AppText>
    </PressableScale>
  );
}
