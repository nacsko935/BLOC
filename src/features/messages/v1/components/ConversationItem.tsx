import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../../core/theme/ThemeProvider";

type Props = {
  id: string; name: string; lastMessage: string; timestamp: string;
  unreadCount: number; avatar: string; onPress: (id: string) => void;
};

function ConversationItemComponent({ id, name, lastMessage, timestamp, unreadCount, avatar, onPress }: Props) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => onPress(id)}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: c.border }, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
    >
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 14 }}>{avatar}</Text>
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: c.textPrimary, fontSize: 15, fontWeight: "700" }}>{name}</Text>
          <Text style={{ color: c.textSecondary, fontSize: 12 }}>{timestamp}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Text numberOfLines={1} style={{ flex: 1, color: c.textSecondary, fontSize: 13 }}>{lastMessage}</Text>
          {unreadCount > 0 && (
            <View style={{ minWidth: 20, height: 20, borderRadius: 999, backgroundColor: "#2C7BFF", alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}>
              <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "800" }}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export const ConversationItem = memo(ConversationItemComponent);
