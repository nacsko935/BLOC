import { useTheme } from "../theme/ThemeProvider";
import { Animated, View } from "react-native";
import { useEffect, useRef } from "react";
import { theme } from "./theme";

export function Skeleton({ height = 16, width = "100%" }: { height?: number; width?: number | `${number}%` }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View
        style={{
          height,
          width,
          borderRadius: theme.radius.md,
          backgroundColor: "#1c1c23",
        }}
      />
    </Animated.View>
  );
}
