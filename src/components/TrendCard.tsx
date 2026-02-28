import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../core/theme/ThemeProvider";
import { TrendItem } from "../features/home/homeMock";

type TrendCardProps = {
  item: TrendItem;
  onPress: (item: TrendItem) => void;
};

export function TrendCard({ item, onPress }: TrendCardProps) {
  const { c } = useTheme();
  return (
    <Pressable onPress={() => onPress(item)} style={{ width: 188, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, padding: 10, marginRight: 10 }}>
      <LinearGradient colors={item.thumbnail} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 106, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.45)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
          <Ionicons name="play" size={16} color="#FFFFFF" />
        </View>
      </LinearGradient>
      <Text numberOfLines={2} style={{ color: c.textPrimary, fontWeight: "700", fontSize: 14, marginTop: 10 }}>{item.title}</Text>
      <Text style={{ color: c.textSecondary, marginTop: 4, fontSize: 12 }}>{item.tag}</Text>
    </Pressable>
  );
}
