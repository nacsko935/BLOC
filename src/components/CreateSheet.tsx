import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../core/ui/AppText";
import { theme } from "../core/ui/theme";

export type CreateAction = {
  key: "pdf" | "audio" | "qcm" | "flashcards";
  icon: string;
  title: string;
  subtitle: string;
  route: "/create/pdf" | "/create/audio" | "/create/qcm" | "/create/flashcards";
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onActionPress: (route: CreateAction["route"]) => void;
  actions?: CreateAction[];
};

const DEFAULT_ACTIONS: CreateAction[] = [
  { key: "pdf", icon: "📄", title: "Importer PDF", subtitle: "Ajouter un cours ou des notes", route: "/create/pdf" },
  { key: "audio", icon: "🎙️", title: "Importer Audio", subtitle: "Transcription vers contenu de revision", route: "/create/audio" },
  { key: "qcm", icon: "✅", title: "Creer QCM", subtitle: "Generation rapide de quiz", route: "/create/qcm" },
  { key: "flashcards", icon: "🧠", title: "Creer Flashcards", subtitle: "Cartes memoires en un clic", route: "/create/flashcards" },
];

export function CreateSheet({ visible, onClose, onActionPress, actions = DEFAULT_ACTIONS }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [expanded, setExpanded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const snapHeight = useMemo(() => {
    const h = Dimensions.get("window").height;
    return expanded ? h * 0.55 : h * 0.35;
  }, [expanded]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Haptics.selectionAsync();
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 170, friction: 18 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 170, friction: 18 }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 40, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.98, duration: 180, useNativeDriver: true }),
    ]).start(() => setMounted(false));
  }, [opacity, scale, translateY, visible]);

  if (!mounted) return null;

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={26} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            minHeight: snapHeight,
            paddingBottom: Math.max(insets.bottom + 8, 18),
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <Pressable style={styles.handleWrap} onPress={() => setExpanded((v) => !v)}>
          <View style={styles.handle} />
        </Pressable>

        <AppText variant="h3" style={styles.title}>
          Creer
        </AppText>
        <AppText muted variant="caption" style={styles.subtitle}>
          Outils rapides pour lancer ton contenu
        </AppText>

        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onActionPress(action.route);
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.iconWrap}>
                <AppText style={styles.icon}>{action.icon}</AppText>
              </View>
              <View style={styles.rowText}>
                <AppText variant="body" style={styles.rowTitle}>
                  {action.title}
                </AppText>
                <AppText variant="caption" muted>
                  {action.subtitle}
                </AppText>
              </View>
              <AppText muted style={styles.chevron}>
                ›
              </AppText>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0a0a0e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingTop: 8,
    ...theme.shadow.lg,
  },
  handleWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.26)",
  },
  title: {
    marginTop: 4,
  },
  subtitle: {
    marginTop: 2,
  },
  actions: {
    marginTop: 14,
    gap: 10,
  },
  row: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#111119",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  rowPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(61,143,255,0.18)",
  },
  icon: {
    fontSize: 18,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontWeight: "700",
  },
  chevron: {
    fontSize: 28,
    lineHeight: 28,
  },
});

