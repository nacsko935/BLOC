import { View } from "react-native";
import { AppText } from "./AppText";
import { theme } from "./theme";

type Props = {
  label: string;
  tone?: "blue" | "orange" | "purple";
};

const palette = {
  blue: { bg: "rgba(61,143,255,0.15)", text: "#3d8fff" },
  orange: { bg: "rgba(245,166,35,0.15)", text: "#f5a623" },
  purple: { bg: "rgba(177,100,255,0.15)", text: "#b164ff" },
} as const;

export function AppBadge({ label, tone = "blue" }: Props) {
  const c = palette[tone];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radius.pill,
        backgroundColor: c.bg,
      }}
    >
      <AppText variant="caption" style={{ color: c.text, fontWeight: "800" }}>
        {label}
      </AppText>
    </View>
  );
}
