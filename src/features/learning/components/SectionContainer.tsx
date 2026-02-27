import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode;
  style?: object;
};

export function SectionContainer({ children, style }: Props) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F0F10",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#202124",
    padding: 14,
  },
});
