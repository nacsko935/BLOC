import { View, Text, Pressable } from "react-native";
import { theme } from "./theme";

export default function ListItem({
  title,
  subtitle,
  icon,
  onPress,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  right?: string;
}) {
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceElevated,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: theme.colors.text }}>{icon}</Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{title}</Text>
        {subtitle ? <Text style={{ color: theme.colors.textMuted, marginTop: 4 }}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={{ color: theme.colors.textMuted }}>{right}</Text> : null}
    </Wrapper>
  );
}
