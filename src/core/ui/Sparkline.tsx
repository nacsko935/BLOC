import { View } from "react-native";

export default function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "flex-end", height: 44 }}>
      {values.map((v, i) => (
        <View
          key={`sp-${i}`}
          style={{
            width: 10,
            height: Math.max(6, (v / max) * 40),
            borderRadius: 6,
            backgroundColor: "#2e90ff",
          }}
        />
      ))}
    </View>
  );
}
