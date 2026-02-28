import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../core/theme/ThemeProvider";

type Props = {
  name: string;
  avatarUri?: string | null;
  uploading?: boolean;
  onEditPhoto: () => void;
  onSettings: () => void;
  onShare?: () => void;
};

export function ProfileHeader({ name, avatarUri, uploading, onEditPhoto, onSettings, onShare }: Props) {
  const { c, isDark } = useTheme();
  return (
    <View style={{ marginBottom: 52 }}>
      <LinearGradient
        colors={isDark ? ["#1B1E2A", "#232A3F"] : ["#E8E5FF", "#D8D0FF"]}
        style={{ height: 200, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: c.border }}
      >
        <View style={{ padding: 12, flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
          {onShare && (
            <Pressable onPress={onShare} style={({ pressed }) => [{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.8 }]}>
              <Ionicons name="share-social-outline" size={18} color="#FFF" />
            </Pressable>
          )}
          <Pressable onPress={onSettings} style={({ pressed }) => [{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.8 }]}>
            <Ionicons name="settings-outline" size={18} color="#FFF" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Avatar */}
      <Pressable onPress={onEditPhoto} style={{ position: "absolute", left: 16, bottom: -44 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.cardAlt, borderWidth: 3, borderColor: c.background, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {avatarUri
            ? <Image source={{ uri: avatarUri }} style={{ width: 82, height: 82, borderRadius: 41 }} resizeMode="cover" />
            : <Text style={{ color: c.textPrimary, fontSize: 30, fontWeight: "800" }}>{name.charAt(0).toUpperCase()}</Text>
          }
          {uploading && (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", borderRadius: 41 }}>
              <ActivityIndicator color="#FFF" size="small" />
            </View>
          )}
        </View>
        <View style={{ position: "absolute", right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: "#5C4DFF", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: c.background }}>
          <Ionicons name={uploading ? "time-outline" : "camera"} size={13} color="#FFF" />
        </View>
      </Pressable>
    </View>
  );
}
