import { memo, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { ReelItem } from "../services/reelsService";
import { AppText } from "../../../core/ui/AppText";
import { theme } from "../../../core/ui/theme";

export const ReelPlayer = memo(function ReelPlayer({
  reel,
  isActive,
}: {
  reel: ReelItem;
  isActive: boolean;
}) {
  const ref = useRef<Video>(null);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const shouldPlay = useMemo(() => isActive && !pausedByUser, [isActive, pausedByUser]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Pressable style={{ flex: 1 }} onPress={() => setPausedByUser((v) => !v)}>
        <Video
          ref={ref}
          source={{ uri: reel.playableUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={shouldPlay}
          isLooping
          isMuted={muted}
          posterSource={{ uri: reel.mediaUrl }}
          usePoster
          onPlaybackStatusUpdate={(status) => {
            if (!status.isLoaded || !status.durationMillis) return;
            setProgress((status.positionMillis / status.durationMillis) * 100);
          }}
        />
      </Pressable>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.78)"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "50%" }}
      />

      <View style={{ position: "absolute", top: 44, right: 14 }}>
        <Pressable
          onPress={() => setMuted((v) => !v)}
          style={{ backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}
        >
          <AppText>{muted ? "Muet" : "Son"}</AppText>
        </Pressable>
      </View>

      {!shouldPlay ? (
        <View style={{ position: "absolute", top: "45%", left: "45%" }}>
          <AppText style={{ fontSize: 28 }}>II</AppText>
        </View>
      ) : null}

      <View style={{ position: "absolute", left: 14, right: 80, bottom: 34 }}>
        <AppText style={{ fontWeight: "800" }}>{reel.authorHandle}</AppText>
        <AppText style={{ marginTop: 6 }}>{reel.caption}</AppText>
        <AppText muted variant="caption" style={{ marginTop: 6, color: theme.colors.textMuted }}>
          #{reel.tags.join(" #")}
        </AppText>
      </View>

      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
          height: 3,
          borderRadius: 99,
          backgroundColor: "rgba(255,255,255,0.25)",
          overflow: "hidden",
        }}
      >
        <View style={{ width: `${progress}%`, height: "100%", backgroundColor: "#fff" }} />
      </View>
    </View>
  );
});
