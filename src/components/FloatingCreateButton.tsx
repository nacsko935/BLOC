import { useRef } from "react";
import { Animated, Pressable, StyleSheet, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "../core/ui/AppText";
import { theme } from "../core/ui/theme";

type Props = {
  onPress: () => void;
  bottom: number;
  style?: ViewStyle;
};

export function FloatingCreateButton({ onPress, bottom, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 260,
      friction: 14,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 260,
      friction: 14,
    }).start();
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom, transform: [{ scale }] },
        style,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        hitSlop={10}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <AppText style={styles.plus}>+</AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6E5CFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...theme.shadow.lg,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  plus: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 36,
    marginTop: -1,
  },
});

