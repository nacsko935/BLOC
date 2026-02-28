import { useTheme } from "../theme/ThemeProvider";
import { Text, View } from "react-native";
import { theme } from "./theme";

export default function Chip({ label, active }: { label: string; active?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? "#7B6CFF" : "#1A1A1A",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color: active ? "#111217" : "rgba(255,255,255,0.45)", fontWeight: "700" }}>{label}</Text>
    </View>
  );
}
