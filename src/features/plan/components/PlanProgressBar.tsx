import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function PlanProgressBar({ value, color = "#4ADE80" }: { value: number; color?: string }) {
  const progress = Math.max(0, Math.min(100, value));
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 7,
    borderRadius: 99,
    backgroundColor: "#1B1D21",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
  },
});
