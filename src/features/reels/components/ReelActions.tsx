import { Alert, Animated, Pressable, View } from "react-native";
import { useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { AppText } from "../../../core/ui/AppText";

export function ReelActions({
  likesCount,
  commentsCount,
  onComments,
}: {
  likesCount: number;
  commentsCount: number;
  onComments: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const animateLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((prev) => !prev);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.26, duration: 110, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  };

  const toggleSave = () => {
    Haptics.selectionAsync();
    setSaved((prev) => !prev);
  };

  return (
    <View style={{ position: "absolute", right: 14, bottom: 150, gap: 24, alignItems: "center" }}>
      <Pressable onPress={animateLike} hitSlop={10}>
        <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
          <AppText style={{ fontSize: 26 }}>{liked ? "Like" : "Like+"}</AppText>
          <AppText variant="caption">{likesCount + (liked ? 1 : 0)}</AppText>
        </Animated.View>
      </Pressable>

      <Pressable onPress={onComments} hitSlop={10} style={{ alignItems: "center" }}>
        <AppText style={{ fontSize: 26 }}>Com</AppText>
        <AppText variant="caption">{commentsCount}</AppText>
      </Pressable>

      <Pressable onPress={toggleSave} hitSlop={10} style={{ alignItems: "center" }}>
        <AppText style={{ fontSize: 26 }}>{saved ? "Saved" : "Save"}</AppText>
        <AppText variant="caption">{saved ? "Saved" : "Save"}</AppText>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          Alert.alert("Partager", "Partage reel active (demo).");
        }}
        hitSlop={10}
        style={{ alignItems: "center" }}
      >
        <AppText style={{ fontSize: 26 }}>Share</AppText>
        <AppText variant="caption">Share</AppText>
      </Pressable>
    </View>
  );
}
