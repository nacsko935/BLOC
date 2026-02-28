import { Pressable, StyleSheet, Text, View } from "react-native";
import { Module } from "../types";
import { PillButton } from "./PillButton";

type Props = {
  module: Module;
  onPress?: () => void;
};

export function ModuleCardSmall({ module, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cover} />
      <Text numberOfLines={1} style={styles.title}>
        {module.title}
      </Text>
      <Text numberOfLines={1} style={styles.subtitle}>
        {module.authorName}
      </Text>
      <View style={{ marginTop: 10, alignSelf: "flex-start" }}>
        <PillButton label={module.isFree ? "Gratuit" : "Premium"} tone={module.isFree ? "dark" : "accent"} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: "#000000",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242527",
    padding: 12,
    marginRight: 10,
  },
  pressed: { opacity: 0.93 },
  cover: { height: 92, borderRadius: 14, backgroundColor: "#232428", marginBottom: 10 },
  title: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  subtitle: { color: "#A0A3A7", fontSize: 12, marginTop: 4 },
});
