import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../core/theme/ThemeProvider";

export type MessageType = "text" | "audio" | "image" | "video" | "file";
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

const SPEED_OPTIONS = [1, 1.5, 2, 2.5] as const;
type Speed = typeof SPEED_OPTIONS[number];

const EMOJI_REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

type Reaction = { emoji: string; count: number; byMe: boolean };

type Props = {
  id?: string;
  text?: string;
  timestamp: string;
  isMe: boolean;
  senderName?: string;
  showSender?: boolean;
  type?: MessageType;
  mediaUri?: string;
  audioDuration?: string;
  isPlaying?: boolean;
  playProgress?: number;
  status?: MessageStatus;
  reactions?: Reaction[];
  accentColor?: string;
  uploading?: boolean;
  onPlayAudio?: (speed: number) => void;
  onLongPress?: () => void;
  onReact?: (emoji: string) => void;
  onAvatarPress?: () => void;
};

const WAVEFORM = [5,9,13,8,16,11,6,14,10,7,13,9,15,8,12,6,10,14,7,11];

// ── Coches de statut style WhatsApp ──────────────────────────────────────────

function StatusTicks({ status, color }: { status: MessageStatus; color: string }) {
  if (status === "sending") {
    return <Ionicons name="time-outline" size={12} color={color} />;
  }
  if (status === "sent") {
    return <Ionicons name="checkmark-outline" size={12} color={color} />;
  }
  if (status === "delivered") {
    // Deux coches grises
    return (
      <View style={{ flexDirection: "row", marginLeft: -4 }}>
        <Ionicons name="checkmark-outline" size={12} color={color} />
        <Ionicons name="checkmark-outline" size={12} color={color} style={{ marginLeft: -5 }} />
      </View>
    );
  }
  if (status === "read") {
    // Deux coches bleues
    return (
      <View style={{ flexDirection: "row", marginLeft: -4 }}>
        <Ionicons name="checkmark-outline" size={12} color="#4DA3FF" />
        <Ionicons name="checkmark-outline" size={12} color="#4DA3FF" style={{ marginLeft: -5 }} />
      </View>
    );
  }
  return null;
}

// ── Composant principal ───────────────────────────────────────────────────────

export function MessageBubble({
  id, text, timestamp, isMe, senderName, showSender = false,
  type = "text", mediaUri, audioDuration, isPlaying, playProgress = 0,
  status = "sent", reactions = [], accentColor, uploading = false,
  onPlayAudio, onLongPress, onReact, onAvatarPress,
}: Props) {
  const { c, isDark } = useTheme();
  const [speed, setSpeed] = useState<Speed>(1);
  const [showReactions, setShowReactions] = useState(false);
  const reactionAnim = useRef(new Animated.Value(0)).current;

  const accent = accentColor || c.accentPurple;
  const bubbleBg  = isMe ? accent : (isDark ? "#1E1E2A" : "#F0F0F8");
  const textColor = isMe ? "#FFFFFF" : c.textPrimary;
  const timeColor = isMe ? "rgba(255,255,255,0.65)" : c.textSecondary;
  const waveColor = isMe ? "rgba(255,255,255,0.85)" : accent;
  const waveInact = isMe ? "rgba(255,255,255,0.30)" : (isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)");

  useEffect(() => {
    if (showReactions) {
      Animated.spring(reactionAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 12 }).start();
    } else {
      Animated.timing(reactionAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [showReactions, reactionAnim]);

  const handleLongPress = () => {
    setShowReactions(true);
    onLongPress?.();
  };

  const handleReact = (emoji: string) => {
    setShowReactions(false);
    onReact?.(emoji);
  };

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    setSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  return (
    <View style={{ width: "100%", flexDirection: "row",
      justifyContent: isMe ? "flex-end" : "flex-start",
      marginBottom: reactions.length > 0 ? 18 : 6,
      paddingHorizontal: 12 }}>

      {/* Avatar cliquable (messages reçus) */}
      {!isMe && (
        <Pressable onPress={onAvatarPress}
          style={{ width: 32, height: 32, borderRadius: 16,
            backgroundColor: accent + "40",
            alignItems: "center", justifyContent: "center",
            marginRight: 6, marginTop: 2, alignSelf: "flex-end" }}>
          <Text style={{ color: accent, fontSize: 12, fontWeight: "900" }}>
            {(senderName || "?").charAt(0).toUpperCase()}
          </Text>
        </Pressable>
      )}

      <View style={{ maxWidth: "75%", position: "relative" }}>

        {/* Picker réactions (long press) */}
        {showReactions && (
          <>
            <Pressable
              style={{ position: "absolute", top: -9999, left: -9999, right: -9999, bottom: -9999, zIndex: 10 }}
              onPress={() => setShowReactions(false)}
            />
            <Animated.View style={{
              position: "absolute",
              [isMe ? "right" : "left"]: 0,
              bottom: "100%",
              marginBottom: 8,
              flexDirection: "row", gap: 6,
              backgroundColor: isDark ? "#1E1E2A" : "#fff",
              borderRadius: 24, padding: 8,
              borderWidth: 1, borderColor: c.border,
              shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, elevation: 8,
              zIndex: 20,
              transform: [{ scale: reactionAnim }, { translateY: reactionAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }],
            }}>
              {EMOJI_REACTIONS.map(emoji => (
                <Pressable key={emoji} onPress={() => handleReact(emoji)}
                  style={({ pressed }) => [{ width: 36, height: 36, borderRadius: 18,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: pressed ? c.cardAlt : "transparent" }]}>
                  <Text style={{ fontSize: 22 }}>{emoji}</Text>
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}

        {/* Bulle */}
        <Pressable onLongPress={handleLongPress} delayLongPress={300}>
          <View style={{
            backgroundColor: bubbleBg,
            borderRadius: 18,
            borderBottomRightRadius: isMe ? 4 : 18,
            borderBottomLeftRadius:  isMe ? 18 : 4,
            paddingHorizontal: type === "image" ? 4 : 12,
            paddingVertical:   type === "image" ? 4 : 8,
            shadowColor: "#000", shadowOpacity: isDark ? 0.25 : 0.07,
            shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            {showSender && !isMe && senderName && (
              <Text style={{ color: accent, fontSize: 11, fontWeight: "800", marginBottom: 3 }}>{senderName}</Text>
            )}

            {/* TEXT */}
            {type === "text" && text ? (
              <Text style={{ fontSize: 15, lineHeight: 21, color: textColor }}>{text}</Text>
            ) : null}

            {/* AUDIO */}
            {type === "audio" && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minWidth: 190, paddingVertical: 4 }}>
                <Pressable onPress={() => onPlayAudio?.(speed)}
                  style={{ width: 40, height: 40, borderRadius: 20,
                    backgroundColor: isMe ? "rgba(255,255,255,0.22)" : accent,
                    alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#FFF" />
                </Pressable>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 2 }}>
                  {WAVEFORM.map((h, i) => (
                    <View key={i} style={{ width: 3, borderRadius: 2,
                      height: isPlaying ? h : Math.max(3, h * 0.6),
                      backgroundColor: isPlaying ? waveColor : waveInact,
                      transition: "height 0.2s" as any }} />
                  ))}
                </View>
                <View style={{ gap: 3, alignItems: "flex-end" }}>
                  <Text style={{ color: timeColor, fontSize: 11, fontWeight: "600" }}>{audioDuration || "0:00"}</Text>
                  <Pressable onPress={cycleSpeed}
                    style={{ backgroundColor: isMe ? "rgba(255,255,255,0.18)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"),
                      borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ color: isMe ? "#FFF" : c.textPrimary, fontSize: 10, fontWeight: "800" }}>{speed}x</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* IMAGE */}
            {type === "image" && mediaUri && (
              <Image source={{ uri: mediaUri }} style={{ width: 220, height: 160, borderRadius: 14 }} resizeMode="cover" />
            )}

            {/* VIDEO */}
            {type === "video" && mediaUri && (
              <View style={{ width: 220, height: 140, borderRadius: 14, backgroundColor: "#000",
                alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="play-circle" size={52} color="rgba(255,255,255,0.9)" />
              </View>
            )}

            {/* FILE */}
            {type === "file" && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10,
                  backgroundColor: isMe ? "rgba(255,255,255,0.20)" : accent + "33",
                  alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="document-attach-outline" size={18} color={isMe ? "#FFF" : accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: textColor, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>{text || "Fichier"}</Text>
                  <Text style={{ color: timeColor, fontSize: 11 }}>Document</Text>
                </View>
              </View>
            )}

            {/* Heure + statut */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: isMe ? "flex-end" : "flex-start",
              gap: 3, marginTop: type === "text" ? 3 : 2 }}>
              <Text style={{ color: timeColor, fontSize: 10 }}>{uploading ? "Envoi…" : timestamp}</Text>
              {isMe && !uploading && <StatusTicks status={status} color={timeColor} />}
              {uploading && <Ionicons name="cloud-upload-outline" size={10} color={timeColor} />}
            </View>
          </View>
        </Pressable>

        {/* Réactions existantes */}
        {reactions.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4,
            position: "absolute", bottom: -20,
            [isMe ? "right" : "left"]: 4 }}>
            {reactions.map((r, i) => (
              <Pressable key={i} onPress={() => onReact?.(r.emoji)}
                style={{ flexDirection: "row", alignItems: "center", gap: 3,
                  backgroundColor: r.byMe ? accent + "30" : (isDark ? "#1E1E2A" : "#F0F0F8"),
                  borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
                  borderWidth: 1, borderColor: r.byMe ? accent + "60" : c.border }}>
                <Text style={{ fontSize: 13 }}>{r.emoji}</Text>
                {r.count > 1 && <Text style={{ color: c.textSecondary, fontSize: 11, fontWeight: "700" }}>{r.count}</Text>}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
