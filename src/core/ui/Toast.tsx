import { useTheme } from "../theme/ThemeProvider";
import { Animated, View } from "react-native";
import { useEffect, useRef } from "react";
import { AppText } from "./AppText";
import { theme } from "./theme";

type Props = {
  visible: boolean;
  message: string;
};

export function Toast({ visible, message }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [opacity, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 26,
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: "#1c1c23",
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <AppText>{message}</AppText>
      </View>
    </Animated.View>
  );
}
