import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import IconButton from "../core/ui/IconButton";

type HomeHeaderProps = {
  notificationCount: number;
  avatarLabel?: string;
  onPressBoost: () => void;
  onPressFavorites: () => void;
  onPressNotifications: () => void;
  onPressTitle: () => void;
};

export function HomeHeader({
  notificationCount,
  avatarLabel = "B",
  onPressBoost,
  onPressFavorites,
  onPressNotifications,
  onPressTitle,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}> 
      <View style={styles.leftRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLabel.slice(0, 1).toUpperCase()}</Text>
        </View>
        <Pressable onPress={onPressTitle} style={styles.titleRow}>
          <Text style={styles.title}>Accueil</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.rightRow}>
        <Pressable onPress={onPressBoost} style={styles.boostButton}>
          <Text style={styles.boostText}>Premium</Text>
        </Pressable>

        <IconButton onPress={onPressFavorites}>
          <Ionicons name="search-outline" size={18} color={colors.text} />
        </IconButton>

        <IconButton onPress={onPressNotifications} badgeCount={notificationCount}>
          <Ionicons name="notifications-outline" size={18} color={colors.text} />
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.text,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boostButton: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  boostText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
});
