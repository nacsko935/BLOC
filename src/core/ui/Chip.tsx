import { Text, View } from "react-native";
import { theme } from "./theme";

export default function Chip({ label, active }: { label: string; active?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? "white" : theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ color: active ? "#111217" : theme.colors.textMuted, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}
