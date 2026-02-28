import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/core/theme/ThemeProvider";
import { useNotificationsStore, AppNotification } from "../state/useNotificationsStore";

const ICONS: Record<AppNotification["type"], { name: any; color: string }> = {
  message:  { name: "chatbubble-ellipses",   color: "#007AFF" },
  follow:   { name: "person-add",            color: "#34C759" },
  repost:   { name: "repeat",                color: "#FF9500" },
  like:     { name: "heart",                 color: "#FF2D55" },
  comment:  { name: "chatbubble",            color: "#AF52DE" },
  mention:  { name: "at",                    color: "#5B4CFF" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `il y a ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { notifications, load, markAllRead, markRead } = useNotificationsStore();

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: AppNotification }) => {
    const ico = ICONS[item.type] ?? ICONS.mention;
    return (
      <Pressable
        onPress={() => markRead(item.id)}
        style={({ pressed }) => [{
          flexDirection: "row", alignItems: "center", gap: 14,
          paddingHorizontal: 16, paddingVertical: 14,
          backgroundColor: item.read ? c.background : (c.accentPurple + "0D"),
          borderBottomWidth: 1, borderBottomColor: c.border,
        }, pressed && { opacity: 0.75 }]}
      >
        {/* Icône type */}
        <View style={{
          width: 46, height: 46, borderRadius: 23,
          backgroundColor: ico.color + "20",
          alignItems: "center", justifyContent: "center",
          borderWidth: 1, borderColor: ico.color + "44",
        }}>
          <Ionicons name={ico.name} size={22} color={ico.color} />
        </View>

        {/* Texte */}
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: c.textPrimary, fontWeight: item.read ? "600" : "800", fontSize: 14 }}>
            {item.title}
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: 11, marginTop: 2 }}>
            {timeAgo(item.created_at)}
          </Text>
        </View>

        {/* Pastille non lu */}
        {!item.read && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accentPurple }} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: 1, borderBottomColor: c.border,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-back" size={18} color={c.textPrimary} />
          </Pressable>
          <Text style={{ color: c.textPrimary, fontSize: 22, fontWeight: "800" }}>Notifications</Text>
        </View>
        <Pressable onPress={markAllRead} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: c.cardAlt, borderWidth: 1, borderColor: c.border }}>
          <Text style={{ color: c.accentPurple, fontWeight: "700", fontSize: 13 }}>Tout lire</Text>
        </Pressable>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <Ionicons name="notifications-off-outline" size={48} color={c.textSecondary} />
            <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 17 }}>Aucune notification</Text>
            <Text style={{ color: c.textSecondary, fontSize: 14 }}>Tu seras notifié des nouvelles activités ici.</Text>
          </View>
        }
      />
    </View>
  );
}
