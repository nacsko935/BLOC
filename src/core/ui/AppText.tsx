import { PropsWithChildren } from "react";
import { Text, TextProps } from "react-native";
import { theme } from "./theme";

type Variant = "h1" | "h2" | "h3" | "body" | "caption" | "micro" | "title" | "subtitle";

type Props = PropsWithChildren<
  TextProps & {
    variant?: Variant;
    muted?: boolean;
  }
>;

const sizes: Record<Variant, number> = {
  h1: theme.typography.title,
  h2: theme.typography.xl,
  h3: theme.typography.lg,
  micro: theme.typography.xs,
  title: theme.typography.title,
  subtitle: theme.typography.lg,
  body: theme.typography.md,
  caption: theme.typography.sm,
};

const lineHeights: Record<Variant, number> = {
  h1: 38,
  h2: 30,
  h3: 26,
  title: 38,
  subtitle: 30,
  body: 23,
  caption: 20,
  micro: 16,
};

const weights: Record<Variant, "400" | "500" | "600" | "700" | "800"> = {
  h1: "800",
  h2: "800",
  h3: "700",
  title: "800",
  subtitle: "700",
  body: "600",
  caption: "600",
  micro: "500",
};

export function AppText({ variant = "body", muted = false, style, children, ...props }: Props) {
  return (
    <Text
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={1.25}
      style={[
        {
          color: muted ? theme.colors.textMuted : theme.colors.text,
          fontSize: sizes[variant],
          fontWeight: weights[variant],
          lineHeight: lineHeights[variant],
          letterSpacing: variant === "h1" || variant === "title" ? -0.7 : 0,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
