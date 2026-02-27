import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlanPill } from "./PlanPill";

type Props = {
  title: string;
  onSearch: () => void;
  onSort: () => void;
  onToggleView: () => void;
  premiumLabel?: string;
};

export function ScreenHeader({ title, onSearch, onSort, onToggleView, premiumLabel = "Premium" }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.right}>
        <PlanPill label={premiumLabel} />
        <Pressable style={styles.iconBtn} onPress={onSearch}>
          <Ionicons name="search-outline" size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onSort}>
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onToggleView}>
          <Ionicons name="grid-outline" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  title: { color: "#FFFFFF", fontSize: 34, fontWeight: "900" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#17191C",
    borderWidth: 1,
    borderColor: "#282B31",
    alignItems: "center",
    justifyContent: "center",
  },
});
