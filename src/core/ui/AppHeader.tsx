import { Pressable, View } from "react-native";
import { AppText } from "./AppText";
import { theme } from "./theme";

type Props = {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  onRightPress?: () => void;
};

export function AppHeader({ title, subtitle, rightLabel, onRightPress }: Props) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <AppText variant="title">{title}</AppText>
        {rightLabel ? (
          <Pressable
            onPress={onRightPress}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.surface,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <AppText variant="caption">{rightLabel}</AppText>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <AppText muted variant="caption" style={{ marginTop: 4 }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}
