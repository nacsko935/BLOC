import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

type HomeHeaderProps = {
  notificationCount: number;
  onPressBoost: () => void;
  onPressFavorites: () => void;
  onPressNotifications: () => void;
  onPressTitle: () => void;
};

export function HomeHeader({
  notificationCount,
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
          <Text style={styles.avatarText}>Y</Text>
        </View>
        <Pressable onPress={onPressTitle} style={styles.titleRow}>
          <Text style={styles.title}>Accueil</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.rightRow}>
        <Pressable onPress={onPressBoost} style={styles.boostButton}>
          <Text style={styles.boostText}>Boost</Text>
        </Pressable>

        <Pressable onPress={onPressFavorites} style={styles.iconButton}>
          <Ionicons name="star-outline" size={18} color={colors.text} />
        </Pressable>

        <Pressable onPress={onPressNotifications} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={18} color={colors.text} />
          {notificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount > 99 ? "99+" : notificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "rgba(0,0,0,0.94)",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 22,
    fontWeight: "700",
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boostButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  boostText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: "absolute",
    right: -5,
    top: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
  },
  badgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "700",
  },
});