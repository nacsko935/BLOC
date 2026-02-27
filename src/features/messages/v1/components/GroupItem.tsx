import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  groupId: string;
  name: string;
  description: string;
  track: string;
  privacy: "public" | "private";
  memberCount: number;
  lastMessage: string;
  lastActivity: string;
  unreadCount: number;
  avatarColor: string;
  onPress: (group: GroupPayload) => void;
};

type GroupPayload = Omit<Props, "onPress">;

function GroupItemComponent(group: Props) {
  const payload: GroupPayload = {
    groupId: group.groupId,
    name: group.name,
    description: group.description,
    track: group.track,
    privacy: group.privacy,
    memberCount: group.memberCount,
    lastMessage: group.lastMessage,
    lastActivity: group.lastActivity,
    unreadCount: group.unreadCount,
    avatarColor: group.avatarColor,
  };
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => group.onPress(payload)}>
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

export const GroupItem = memo(GroupItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#222222",
  },
  rowPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  content: { flex: 1, gap: 4 },
  topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: "#F5F5F5", fontSize: 15, fontWeight: "700" },
  timestamp: { color: "#9A9A9A", fontSize: 12 },
  members: { color: "#9A9A9A", fontSize: 12 },
  bottomLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  lastMessage: { flex: 1, color: "#A5A5AD", fontSize: 13 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#654BFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
});
