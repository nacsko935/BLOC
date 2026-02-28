import { useTheme } from "../theme/ThemeProvider";
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
        backgroundColor: "#16161b",
        borderRadius: theme.radius.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "#1c1c23",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#ffffff" }}>{icon}</Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#ffffff", fontWeight: "800" }}>{title}</Text>
        {subtitle ? <Text style={{ color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={{ color: "rgba(255,255,255,0.45)" }}>{right}</Text> : null}
    </Wrapper>
  );
}
