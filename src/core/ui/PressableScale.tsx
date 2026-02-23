import { PropsWithChildren } from "react";
import { Pressable, PressableProps } from "react-native";
import * as Haptics from "expo-haptics";

export function PressableScale({
  children,
  style,
  onPress,
  ...props
}: PropsWithChildren<PressableProps>) {
  return (
    <Pressable
      {...props}
      onPress={async (event) => {
        await Haptics.selectionAsync();
        onPress?.(event);
      }}
      style={({ pressed }) => [
        { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.9 : 1 },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}
