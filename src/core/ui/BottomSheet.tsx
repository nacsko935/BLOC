import { useTheme } from "../theme/ThemeProvider";
import { ReactNode } from "react";
import { View, Pressable, Text } from "react-native";
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
  return (
    <View style={{ flex: 1, justifyContent: "flex-end" }}>
      <Pressable
        onPress={onClose}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      />
      <View
        style={{
          backgroundColor: "#0f0f14",
          padding: 16,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          gap: 12,
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
      </View>
    </View>
  );
}
