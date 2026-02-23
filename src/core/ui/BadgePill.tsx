import { Text, View } from "react-native";

export default function BadgePill({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "gold" | "purple";
}) {
  const bg =
    tone === "gold"
      ? "#2a1f00"
      : tone === "purple"
      ? "#1f1b2d"
      : "#142033";
  const fg =
    tone === "gold"
      ? "#f5b21b"
      : tone === "purple"
      ? "#b164ff"
      : "#2e90ff";

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color: fg, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}
