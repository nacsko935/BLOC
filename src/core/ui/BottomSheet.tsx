import { ReactNode, useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { theme } from "./theme";

export default function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const translateY = useRef(new Animated.Value(420)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdrop, translateY]);

  return (
    <View style={{ flex: 1, justifyContent: "flex-end" }}>
      <Animated.View
        style={{
          ...StyleSheetFill,
          backgroundColor: "rgba(0,0,0,0.55)",
          opacity: backdrop,
        }}
      >
        <Pressable onPress={onClose} style={StyleSheetFill} />
      </Animated.View>

      <Animated.View
        style={{
          backgroundColor: "#0f0f14",
          padding: 16,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          gap: 12,
          transform: [{ translateY }],
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 5,
              borderRadius: theme.radius.pill,
              backgroundColor: "rgba(255,255,255,0.25)",
              marginBottom: 8,
            }}
          />
        </View>
        <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "900" }}>{title}</Text>
        {children}
      </Animated.View>
    </View>
  );
}

const StyleSheetFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

