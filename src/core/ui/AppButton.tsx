import { PropsWithChildren } from "react";
import { Pressable, PressableProps } from "react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "./AppText";
import { theme } from "./theme";

type Props = PropsWithChildren<
  PressableProps & {
    variant?: "primary" | "secondary";
  }
>;

export function AppButton({ variant = "primary", style, children, ...props }: Props) {
  const isPrimary = variant === "primary";
  const onPress = props.onPress;
  return (
    <Pressable
      {...props}
      onPress={async (event) => {
        await Haptics.selectionAsync();
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          backgroundColor: isPrimary ? theme.colors.accent : theme.colors.surfaceElevated,
          borderRadius: theme.radius.md,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: theme.colors.borderStrong,
          opacity: pressed ? 0.85 : 1,
        },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      <AppText style={{ textAlign: "center", color: isPrimary ? "#fff" : theme.colors.text }}>{children}</AppText>
    </Pressable>
  );
}
