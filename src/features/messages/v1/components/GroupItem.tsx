import { Pressable, StyleSheet, Text, View } from "react-native";
import { WorkGroup } from "../mock";

type Props = WorkGroup & {
  onPress: (group: WorkGroup) => void;
};

export function GroupItem(group: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => group.onPress(group)}>
      <View style={[styles.avatar, { backgroundColor: group.avatarColor }]}>
        <Text style={styles.avatarText}>{group.name.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text style={styles.name}>{group.name}</Text>
          <Text style={styles.timestamp}>{group.lastActivity}</Text>
        </View>

        <Text style={styles.members}>
          {group.memberCount} membres - {group.privacy === "public" ? "Public" : "Prive"}
        </Text>

        <View style={styles.bottomLine}>
          <Text numberOfLines={1} style={styles.lastMessage}>
            {group.lastMessage}
          </Text>
          {group.unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{group.unreadCount > 99 ? "99+" : group.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121216",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E1E25",
  },
  rowPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: "#F5F5F5",
    fontSize: 15,
    fontWeight: "700",
  },
  timestamp: {
    color: "#9A9AA0",
    fontSize: 12,
  },
  members: {
    color: "#8B8B95",
    fontSize: 12,
  },
  bottomLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    color: "#A5A5AD",
    fontSize: 13,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#654BFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
});
