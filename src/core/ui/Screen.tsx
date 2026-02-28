import { useTheme } from "../theme/ThemeProvider";
import { ReactNode } from "react";
import { View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top", "left", "right"]}>
      <View style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingBottom: Platform.OS === "android" ? 70 : 90,
      }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
