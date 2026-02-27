import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  onPress: (id: string) => void;
};

function ConversationItemComponent({ id, name, lastMessage, timestamp, unreadCount, avatar, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => onPress(id)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatar}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
        <View style={styles.bottomLine}>
          <Text numberOfLines={1} style={styles.lastMessage}>
            {lastMessage}
          </Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const ConversationItem = memo(ConversationItemComponent);

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
    backgroundColor: "#2B2B35",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  content: { flex: 1, gap: 5 },
  topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bottomLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  name: { color: "#F5F5F5", fontSize: 15, fontWeight: "700" },
  timestamp: { color: "#9A9A9A", fontSize: 12 },
  lastMessage: { flex: 1, color: "#9A9A9A", fontSize: 13 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#2C7BFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
});
