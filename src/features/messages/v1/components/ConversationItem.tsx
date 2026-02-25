import { Pressable, StyleSheet, Text, View } from "react-native";
import { ConversationPreview } from "../mock";

type Props = ConversationPreview & {
  onPress: (id: string) => void;
};

export function ConversationItem({ id, name, lastMessage, timestamp, unreadCount, avatar, onPress }: Props) {
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
    backgroundColor: "#2B2B35",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
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
  lastMessage: {
    flex: 1,
    color: "#9A9AA0",
    fontSize: 13,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#2C7BFF",
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
