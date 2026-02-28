import { useTheme } from "../theme/ThemeProvider";
import { PropsWithChildren } from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "./theme";

type Props = PropsWithChildren<{
  onPress: () => void;
  badgeCount?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function IconButton({ onPress, badgeCount = 0, style, children }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      {children}
      {badgeCount > 0 ? (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#1c1c23",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  badge: {
    position: "absolute",
    right: -1,
    top: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff3b30",
  },
});

export default IconButton;

