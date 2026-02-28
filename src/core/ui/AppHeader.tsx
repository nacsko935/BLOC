import { useTheme } from "../theme/ThemeProvider";
import { Pressable, View } from "react-native";
import { AppText } from "./AppText";

export function AppHeader({ title, subtitle, rightLabel, onRightPress }: {
  title: string; subtitle?: string; rightLabel?: string; onRightPress?: () => void;
}) {
  const { c } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <AppText variant="title">{title}</AppText>
        {rightLabel && (
          <Pressable onPress={onRightPress} style={({ pressed }) => ({
            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
            backgroundColor: c.cardAlt, opacity: pressed ? 0.75 : 1,
            borderWidth: 1, borderColor: c.border,
          })}>
            <AppText variant="caption">{rightLabel}</AppText>
          </Pressable>
        )}
      </View>
      {subtitle && <AppText muted variant="caption" style={{ marginTop: 3 }}>{subtitle}</AppText>}
    </View>
  );
}
