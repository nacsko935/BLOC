import { useTheme } from "../../../core/theme/ThemeProvider";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { AppText } from "../../../core/ui/AppText";
import { theme } from "../../../core/ui/theme";

export function EditableAvatar({
  uri,
  name,
  size = 88,
  onEdit,
}: {
  uri?: string | null;
  name?: string;
  size?: number;
  onEdit?: () => void;
}) {
  const r = size / 2;
  return (
    <View style={{ position: "relative", width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: r }} contentFit="cover" />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: r,
            backgroundColor: "#1c1c23",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText style={{ fontSize: 28, fontWeight: "800" }}>{(name?.charAt(0) || "U").toUpperCase()}</AppText>
        </View>
      )}
      <Pressable
        onPress={onEdit}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#6E5CFF",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "#16161b",
        }}
      >
        <AppText style={{ color: "#fff", fontSize: 13 }}>✎</AppText>
      </Pressable>
    </View>
  );
}
