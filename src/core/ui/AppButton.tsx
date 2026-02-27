import { PropsWithChildren, useCallback, useState } from "react";
import { ActivityIndicator, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "./AppText";
import { theme } from "./theme";

type Props = PropsWithChildren<
  Omit<PressableProps, "style"> & {
    variant?: "primary" | "secondary";
    loading?: boolean;
    preventDoubleTapMs?: number;
    style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  }
>;

export function AppButton({
  variant = "primary",
  style,
  children,
  loading = false,
  disabled,
  preventDoubleTapMs = 700,
  onPress,
  ...props
}: Props) {
  const [pending, setPending] = useState(false);
  const isPrimary = variant === "primary";
  const isDisabled = Boolean(disabled || loading || pending);

  const handlePress = useCallback(
    async (event: any) => {
      if (isDisabled) return;
      setPending(true);
      try {
        await Haptics.selectionAsync();
        const maybePromise = onPress?.(event);
        if (maybePromise && typeof (maybePromise as Promise<unknown>).then === "function") {
          await maybePromise;
        }
      } finally {
        setTimeout(() => setPending(false), preventDoubleTapMs);
      }
    },
    [isDisabled, onPress, preventDoubleTapMs]
  );

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        {
          backgroundColor: isPrimary ? theme.colors.accent : theme.colors.surfaceElevated,
          borderRadius: 18,
          minHeight: 42,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: theme.colors.borderStrong,
          opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignItems: "center",
          justifyContent: "center",
        },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      {loading || pending ? (
        <ActivityIndicator color={isPrimary ? "#fff" : theme.colors.text} />
      ) : (
        <AppText style={{ textAlign: "center", color: isPrimary ? "#fff" : theme.colors.text, fontWeight: "700" }}>
          {children}
        </AppText>
      )}
    </Pressable>
  );
}
