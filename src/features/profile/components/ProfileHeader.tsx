import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  name: string;
  onEditPhoto: () => void;
  onSettings: () => void;
  onShare?: () => void;
};

export function ProfileHeader({ name, onEditPhoto, onSettings, onShare }: Props) {
  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={["#1B1E2A", "#232A3F"]} style={styles.cover}>
        <View style={styles.topActions}>
          <View />
          <View style={styles.rightActions}>
            {onShare ? (
              <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} onPress={onShare}>
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              </Pressable>
            ) : null}
            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} onPress={onSettings}>
              <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.editButton, pressed && styles.pressed]} onPress={onEditPhoto}>
          <Ionicons name="pencil" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 52,
  },
  cover: {
    height: 200,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  topActions: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rightActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: "absolute",
    left: 16,
    bottom: -44,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#242734",
    borderWidth: 3,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  editButton: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#5C4DFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },
  pressed: {
    opacity: 0.8,
  },
});
