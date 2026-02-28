import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../core/theme/ThemeProvider";
import IconButton from "../core/ui/IconButton";

type HomeHeaderProps = {
  notificationCount: number;
  avatarLabel?: string;
  avatarUri?: string | null;
  onPressBoost: () => void;
  onPressFavorites: () => void;
  onPressNotifications: () => void;
  onPressTitle: () => void;
};

export function HomeHeader({ notificationCount, avatarLabel = "B", avatarUri, onPressBoost, onPressFavorites, onPressNotifications, onPressTitle }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  return (
    <View style={{ backgroundColor: c.background, borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 12, paddingHorizontal: 16, paddingTop: insets.top + 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.border, overflow: "hidden" }}>
          {avatarUri
            ? <Image source={{ uri: avatarUri }} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="cover" />
            : <Text style={{ color: c.textPrimary, fontWeight: "700" }}>{avatarLabel.slice(0,1).toUpperCase()}</Text>
          }
        </View>
        <Pressable onPress={onPressTitle} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Text style={{ color: c.textPrimary, fontSize: 24, fontWeight: "800" }}>Accueil</Text>
          <Ionicons name="chevron-down" size={16} color={c.textSecondary} />
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable onPress={onPressBoost} style={{ paddingHorizontal: 12, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: c.accentPurple }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Premium</Text>
        </Pressable>
        <IconButton onPress={onPressFavorites}>
          <Ionicons name="search-outline" size={18} color={c.textPrimary} />
        </IconButton>
        <IconButton onPress={onPressNotifications} badgeCount={notificationCount}>
          <Ionicons name="notifications-outline" size={18} color={c.textPrimary} />
        </IconButton>
      </View>
    </View>
  );
}
