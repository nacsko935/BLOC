import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = "#FF4D5E" }: Props) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(100, value));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
  },
});
