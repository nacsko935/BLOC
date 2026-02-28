import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../../core/theme/ThemeProvider";

type Props = {
  groupId: string; name: string; description: string; track: string;
  privacy: "public" | "private"; memberCount: number; lastMessage: string;
  lastActivity: string; unreadCount: number; avatarColor: string;
  onPress: (group: GroupPayload) => void;
};
type GroupPayload = Omit<Props, "onPress">;

function GroupItemComponent(group: Props) {
  const { c } = useTheme();
  const payload: GroupPayload = { groupId: group.groupId, name: group.name, description: group.description, track: group.track, privacy: group.privacy, memberCount: group.memberCount, lastMessage: group.lastMessage, lastActivity: group.lastActivity, unreadCount: group.unreadCount, avatarColor: group.avatarColor };
  return (
    <Pressable
      onPress={() => group.onPress(payload)}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: c.border }, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: group.avatarColor, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 16 }}>{group.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: c.textPrimary, fontSize: 15, fontWeight: "700" }}>{group.name}</Text>
          <Text style={{ color: c.textSecondary, fontSize: 12 }}>{group.lastActivity}</Text>
        </View>
        <Text style={{ color: c.textSecondary, fontSize: 12 }}>{group.memberCount} membres · {group.privacy === "public" ? "Public" : "Privé"}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Text numberOfLines={1} style={{ flex: 1, color: c.textSecondary, fontSize: 13 }}>{group.lastMessage}</Text>
          {group.unreadCount > 0 && (
            <View style={{ minWidth: 20, height: 20, borderRadius: 999, backgroundColor: "#654BFF", alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}>
              <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "800" }}>{group.unreadCount > 99 ? "99+" : group.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export const GroupItem = memo(GroupItemComponent);
