import { ReactNode } from "react";
import { View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "./theme";

export default function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'left', 'right']}>
      <View style={{ 
        flex: 1, 
        paddingHorizontal: 16, 
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'android' ? 70 : 90, // Espace pour tab bar
      }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
