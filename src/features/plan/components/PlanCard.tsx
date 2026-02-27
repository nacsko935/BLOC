import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

export function PlanCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#101113",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#23252A",
    padding: 14,
  },
});
