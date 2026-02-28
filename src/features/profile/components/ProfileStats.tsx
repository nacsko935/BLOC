import { Text, View } from "react-native";
import { useTheme } from "../../../core/theme/ThemeProvider";

type Props = { followers: number; following: number; points: number };

export function ProfileStats({ followers, following, points }: Props) {
  const { c } = useTheme();
  const items = [
    { value: followers, label: "Abonnés" },
    { value: following, label: "Suivis" },
    { value: points,    label: "Points" },
  ];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 }}>
      {items.map((item, i) => (
        <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {i > 0 && <Text style={{ color: c.border }}>|</Text>}
          <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: "600" }}>
            <Text style={{ color: c.textPrimary, fontWeight: "800" }}>{item.value} </Text>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
