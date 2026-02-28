import { useTheme } from "../../../core/theme/ThemeProvider";
import { memo, useMemo, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ReelItem } from "../services/reelsService";
import { AppText } from "../../../core/ui/AppText";

// expo-av (Video) est déprécié dans SDK 54 et crash dans Expo Go
// On utilise un lecteur visuel safe avec poster image
// Pour la vraie lecture vidéo, migrer vers expo-video quand disponible

export const ReelPlayer = memo(function ReelPlayer({
  reel,
  isActive,
}: {
  reel: ReelItem;
  isActive: boolean;
}) {
  const { c } = useTheme();
  const [pausedByUser, setPausedByUser] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress] = useState(0);

  const shouldPlay = useMemo(() => isActive && !pausedByUser, [isActive, pausedByUser]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Pressable style={{ flex: 1 }} onPress={() => setPausedByUser((v) => !v)}>
        {/* Poster image à la place de Video pour compatibilité Expo Go */}
        <Image
          source={{ uri: reel.mediaUrl || reel.playableUrl }}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          resizeMode="cover"
        />
        {/* Overlay lecture */}
        {!shouldPlay && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="play" size={32} color="#FFF" />
            </View>
          </View>
        )}
      </Pressable>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.78)"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "50%" }}
      />

      <View style={{ position: "absolute", top: 44, right: 14 }}>
        <Pressable
          onPress={() => setMuted((v) => !v)}
          style={{ backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Ionicons name={muted ? "volume-mute" : "volume-high"} size={14} color="#FFF" />
          <AppText style={{ fontSize: 12 }}>{muted ? "Muet" : "Son"}</AppText>
        </Pressable>
      </View>

      <View style={{ position: "absolute", left: 14, right: 80, bottom: 34 }}>
        <AppText style={{ fontWeight: "800" }}>{reel.authorHandle}</AppText>
        <AppText style={{ marginTop: 6 }}>{reel.caption}</AppText>
        {reel.tags?.length > 0 && (
          <AppText muted variant="caption" style={{ marginTop: 6, color: "rgba(255,255,255,0.45)" }}>
            #{reel.tags.join(" #")}
          </AppText>
        )}
      </View>

      {/* Barre de progression */}
      <View style={{ position: "absolute", left: 12, right: 12, bottom: 10, height: 3, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
        <View style={{ width: `${progress}%`, height: "100%", backgroundColor: "#fff" }} />
      </View>
    </View>
  );
});
