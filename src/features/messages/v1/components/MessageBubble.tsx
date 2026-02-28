import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../core/theme/ThemeProvider";

export type MessageType = "text" | "audio" | "image" | "video" | "file";

const SPEED_OPTIONS = [1, 1.5, 2, 2.5] as const;
type Speed = typeof SPEED_OPTIONS[number];

type Props = {
  text?: string;
  timestamp: string;
  isMe: boolean;
  senderName?: string;
  showSender?: boolean;
  type?: MessageType;
  mediaUri?: string;
  audioDuration?: string;
  isPlaying?: boolean;
  onPlayAudio?: (speed: number) => void;
};

const WAVEFORM = [5,9,13,8,16,11,6,14,10,7,13,9,15,8,12,6,10,14,7,11];

export function MessageBubble({ text, timestamp, isMe, senderName, showSender = false, type = "text", mediaUri, audioDuration, isPlaying, onPlayAudio }: Props) {
  const { c, isDark } = useTheme();
  const [speed, setSpeed] = useState<Speed>(1);

  const bubbleBg    = isMe ? c.accentPurple : (isDark ? "#1E1E1E" : "#F0F0F0");
  const textColor   = isMe ? "#FFFFFF" : c.textPrimary;
  const timeColor   = isMe ? "rgba(255,255,255,0.65)" : c.textSecondary;
  const waveColor   = isMe ? "rgba(255,255,255,0.80)" : c.accentPurple;
  const waveInactive= isMe ? "rgba(255,255,255,0.35)" : (isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.18)");

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
  };

  return (
    <View style={{ width: "100%", flexDirection: "row", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 6, paddingHorizontal: 12 }}>
      {!isMe && showSender && (
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.accentPurple + "40", alignItems: "center", justifyContent: "center", marginRight: 6, marginTop: 2 }}>
          <Text style={{ color: c.accentPurple, fontSize: 10, fontWeight: "800" }}>{(senderName || "?").charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={{
        maxWidth: "75%",
        backgroundColor: bubbleBg,
        borderRadius: 18,
        borderBottomRightRadius: isMe ? 4 : 18,
        borderBottomLeftRadius:  isMe ? 18 : 4,
        paddingHorizontal: type === "image" ? 4 : 12,
        paddingVertical:   type === "image" ? 4 : 8,
        shadowColor: "#000", shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
      }}>
        {showSender && !isMe && senderName ? (
          <Text style={{ color: c.accentPurple, fontSize: 11, fontWeight: "800", marginBottom: 3 }}>{senderName}</Text>
        ) : null}

        {/* TEXT */}
        {type === "text" && text ? (
          <Text style={{ fontSize: 15, lineHeight: 21, color: textColor }}>{text}</Text>
        ) : null}

        {/* AUDIO - Instagram style */}
        {type === "audio" && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minWidth: 180, paddingVertical: 4 }}>
            <Pressable onPress={() => onPlayAudio?.(speed)}
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: isMe ? "rgba(255,255,255,0.20)" : c.accentPurple, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={17} color="#FFF" />
            </Pressable>
            {/* Waveform */}
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 2 }}>
              {WAVEFORM.map((h, i) => (
                <View key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: isPlaying ? waveColor : waveInactive }} />
              ))}
            </View>
            {/* Durée + vitesse */}
            <View style={{ gap: 3, alignItems: "flex-end" }}>
              <Text style={{ color: timeColor, fontSize: 11, fontWeight: "600" }}>{audioDuration || "0:00"}</Text>
              <Pressable onPress={cycleSpeed} style={{ backgroundColor: isMe ? "rgba(255,255,255,0.18)" : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"), borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }}>
                <Text style={{ color: isMe ? "#FFF" : c.textPrimary, fontSize: 10, fontWeight: "800" }}>{speed}x</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* IMAGE */}
        {type === "image" && mediaUri ? (
          <Image source={{ uri: mediaUri }} style={{ width: 220, height: 160, borderRadius: 14 }} resizeMode="cover" />
        ) : null}

        {/* VIDEO */}
        {type === "video" && mediaUri ? (
          <View style={{ width: 220, height: 140, borderRadius: 14, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="play-circle" size={52} color="rgba(255,255,255,0.90)" />
          </View>
        ) : null}

        {/* FILE */}
        {type === "file" && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isMe ? "rgba(255,255,255,0.20)" : c.accentBlue + "33", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="document-attach-outline" size={18} color={isMe ? "#FFF" : c.accentBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: textColor, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>{text || "Fichier"}</Text>
              <Text style={{ color: timeColor, fontSize: 11 }}>Document</Text>
            </View>
          </View>
        )}

        <Text style={{ color: timeColor, fontSize: 10, textAlign: isMe ? "right" : "left", marginTop: type === "text" ? 3 : 2 }}>{timestamp}</Text>
      </View>
    </View>
  );
}
