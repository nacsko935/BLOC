import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Vibration,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

type TimerMode = "focus" | "break" | "longBreak";

const TIMER_PRESETS = {
  focus: 25 * 60, // 25 minutes
  break: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export default function PomodoroModal() {
  const router = useRouter();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    Vibration.vibrate([0, 500, 200, 500]);

    if (mode === "focus") {
      setSessionsCompleted((prev) => prev + 1);
      const nextMode = (sessionsCompleted + 1) % 4 === 0 ? "longBreak" : "break";
      setMode(nextMode);
      setTimeLeft(TIMER_PRESETS[nextMode]);
    } else {
      setMode("focus");
      setTimeLeft(TIMER_PRESETS.focus);
    }
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_PRESETS[mode]);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_PRESETS[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = 1 - timeLeft / TIMER_PRESETS[mode];

  const getModeColor = () => {
    switch (mode) {
      case "focus":
        return "#007aff";
      case "break":
        return "#34c759";
      case "longBreak":
        return "#ff9500";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Pomodoro</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mode selector */}
      <View style={styles.modeSelector}>
        <Pressable
          onPress={() => handleModeChange("focus")}
          style={[
            styles.modeButton,
            mode === "focus" && { backgroundColor: "#007aff" },
          ]}
        >
          <Text style={[styles.modeButtonText, mode === "focus" && styles.modeButtonTextActive]}>
            Focus
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleModeChange("break")}
          style={[
            styles.modeButton,
            mode === "break" && { backgroundColor: "#34c759" },
          ]}
        >
          <Text style={[styles.modeButtonText, mode === "break" && styles.modeButtonTextActive]}>
            Pause
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleModeChange("longBreak")}
          style={[
            styles.modeButton,
            mode === "longBreak" && { backgroundColor: "#ff9500" },
          ]}
        >
          <Text style={[styles.modeButtonText, mode === "longBreak" && styles.modeButtonTextActive]}>
            Longue Pause
          </Text>
        </Pressable>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.timerCircle,
            { 
              borderColor: getModeColor(),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={[styles.timerText, { color: getModeColor() }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.timerLabel}>
            {mode === "focus" ? "Concentration" : mode === "break" ? "Pause courte" : "Pause longue"}
          </Text>
        </Animated.View>

        {/* Progress ring */}
        <View style={styles.progressRing}>
          <View
            style={[
              styles.progressFill,
              {
                height: `${progress * 100}%`,
                backgroundColor: getModeColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          onPress={handleToggle}
          style={({ pressed }) => [
            styles.mainButton,
            { backgroundColor: getModeColor() },
            pressed && styles.mainButtonPressed,
          ]}
        >
          <Text style={styles.mainButtonText}>{isRunning ? "⏸ Pause" : "▶ Démarrer"}</Text>
        </Pressable>

        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>↻ Réinitialiser</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
            <Text style={styles.statIconText}>🎯</Text>
          </View>
          <Text style={styles.statValue}>{sessionsCompleted}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>

        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(255, 149, 0, 0.15)" }]}>
            <Text style={styles.statIconText}>⏱️</Text>
          </View>
          <Text style={styles.statValue}>{sessionsCompleted * 25}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>

        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(52, 199, 89, 0.15)" }]}>
            <Text style={styles.statIconText}>🔥</Text>
          </View>
          <Text style={styles.statValue}>
            {sessionsCompleted >= 4 ? Math.floor(sessionsCompleted / 4) : 0}
          </Text>
          <Text style={styles.statLabel}>Cycles</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          💡 La technique Pomodoro : 25 min de travail, 5 min de pause
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  modeSelector: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  modeButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  modeButtonTextActive: {
    color: "#ffffff",
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  timerText: {
    fontSize: 64,
    fontWeight: "800",
    letterSpacing: -2,
  },
  timerLabel: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  progressRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: "hidden",
    opacity: 0.1,
  },
  progressFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  controls: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  mainButton: {
    paddingVertical: 18,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    ...theme.shadow.md,
  },
  mainButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  mainButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  secondaryButtonPressed: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  stat: {
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  info: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  infoText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
});
