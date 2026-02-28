import { useTheme } from "../theme/ThemeProvider";
import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { theme } from "./theme";
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from "react-native-svg";

interface EmptyStateProps {
  icon?: "book" | "rocket" | "target" | "star" | "clock" | "users";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const EmptyStateIcon = ({ name }: { name: EmptyStateProps["icon"] }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const iconMap = {
    book: (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 6.042C10.3516 4.56108 8.2144 3.74648 6 3.75C5.05571 3.75 4.12893 3.91993 3.25798 4.24995C3.10393 4.30715 3 4.4506 3 4.613V18.439C3 18.6977 3.22386 18.8952 3.47538 18.8412C4.29108 18.6795 5.1402 18.599 6 18.601C8.0504 18.601 10.0454 19.2682 11.6729 20.4928C11.8719 20.652 12.1281 20.652 12.3271 20.4928C13.9546 19.2682 15.9496 18.601 18 18.601C18.8598 18.599 19.7089 18.6795 20.5246 18.8412C20.7761 18.8952 21 18.6977 21 18.439V4.613C21 4.4506 20.8961 4.30715 20.742 4.24995C19.8711 3.91993 18.9443 3.75 18 3.75C15.7856 3.74648 13.6484 4.56108 12 6.042Z"
          stroke={"#6E5CFF"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 6.042V20.042"
          stroke={"#6E5CFF"}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    ),
    rocket: (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4.5 16.5C3 17.76 2.5 21.5 2.5 21.5C2.5 21.5 6.24 21 7.5 19.5C8.21 18.66 8.2 17.37 7.41 16.59C7.02131 16.2013 6.50929 15.9842 5.97223 15.9827C5.43516 15.9812 4.92193 16.1955 4.531 16.582L4.5 16.5Z"
          stroke={"#7B6CFF"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 15L9 12"
          stroke={"#7B6CFF"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15.5 7.5C15.5 7.5 14.5 6 12 6C10.5 6 9 7.5 9 7.5M15.5 7.5C15.5 7.5 16.5 9 16.5 11.5C16.5 13 15.5 14.5 15.5 14.5M15.5 7.5C17 6 20.5 3.5 20.5 3.5C20.5 3.5 21 7 19.5 9M9 7.5C7.5 9 4.5 12 4.5 12C4.5 12 8 12.5 9.5 11M15.5 14.5C14 16 11.5 19 11.5 19C11.5 19 12 15.5 13.5 14M15.5 14.5L9 7.5"
          stroke={"#7B6CFF"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    target: (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={"#8B7CFF"}
          strokeWidth={2}
        />
        <Circle
          cx="12"
          cy="12"
          r="6"
          stroke={"#8B7CFF"}
          strokeWidth={2}
        />
        <Circle
          cx="12"
          cy="12"
          r="2"
          fill={"#8B7CFF"}
        />
      </Svg>
    ),
    star: (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke={"#7B6CFF"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    clock: (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={"#6E5CFF"}
          strokeWidth={2}
        />
        <Path
          d="M12 6V12L16 14"
          stroke={"#6E5CFF"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    users: (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="9"
          cy="7"
          r="4"
          stroke={"#6E5CFF"}
          strokeWidth={2}
        />
        <Path
          d="M2 21V19C2 16.7909 3.79086 15 6 15H12C14.2091 15 16 16.7909 16 19V21"
          stroke={"#6E5CFF"}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M16 11C18.2091 11 20 9.20914 20 7C20 4.79086 18.2091 3 16 3"
          stroke={"#6E5CFF"}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M18 21V19C18 17.3431 17.3431 15.8434 16.2635 14.7635"
          stroke={"#6E5CFF"}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    ),
  };

  return (
    <Animated.View 
      style={[
        styles.iconContainer,
        {
          transform: [
            { scale: scaleAnim },
            { rotate },
          ],
        },
      ]}
    >
      {iconMap[name || "book"]}
    </Animated.View>
  );
};

export default function EmptyState({
  const { c } = useTheme();
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: 200,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <EmptyStateIcon name={icon} />
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <Pressable
              onPress={onAction}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </Pressable>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <Pressable
              onPress={onSecondaryAction}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#6E5CFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.8,
  },
  description: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 340,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 36,
  },
  primaryButton: {
    backgroundColor: "#6E5CFF",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: theme.radius.pill,
    shadowColor: "#6E5CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonPressed: {
    backgroundColor: "#5A4CEE",
    transform: [{ scale: 0.97 }],
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "#111111",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.14)",
  },
  secondaryButtonPressed: {
    backgroundColor: "#22222b",
    transform: [{ scale: 0.97 }],
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
