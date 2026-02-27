import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function PlanListRow({
  title,
  subtitle,
  right,
  onPress,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  children?: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        {children}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#25272C",
    backgroundColor: "#131417",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pressed: { opacity: 0.92 },
  left: { flex: 1 },
  title: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  subtitle: { color: "#9FA3AB", marginTop: 4, fontSize: 12 },
  right: { alignItems: "flex-end" },
});
