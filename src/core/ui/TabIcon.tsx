import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface TabIconProps {
  name: "home" | "revisions" | "profile";
  focused: boolean;
  color: string;
}

export default function TabIcon({ name, focused, color }: TabIconProps) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.92)).current;
  const glowAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0.92,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: focused ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const size = 24;
  const strokeWidth = focused ? 2.5 : 2;

  return (
    <View style={{ alignItems: "center", justifyContent: "center", position: "relative" }}>
      {/* Glow effect background */}
      <Animated.View
        style={{
          position: "absolute",
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color,
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.15],
          }),
          transform: [
            {
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }}
      />

      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {renderIcon(name, size, color, strokeWidth, focused)}
      </Animated.View>
    </View>
  );
}

function renderIcon(
  name: string,
  size: number,
  color: string,
  strokeWidth: number,
  focused: boolean
) {
  switch (name) {
    case "home":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>
          <Path
            d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
            stroke={focused ? "url(#homeGradient)" : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.12 : 0}
          />
        </Svg>
      );

    case "revisions":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="revisionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>
          <Path
            d="M12 6.042C10.3516 4.56108 8.2144 3.74648 6 3.75C5.05571 3.75 4.12893 3.91993 3.25798 4.24995C3.10393 4.30715 3 4.4506 3 4.613V18.439C3 18.6977 3.22386 18.8952 3.47538 18.8412C4.29108 18.6795 5.1402 18.599 6 18.601C8.0504 18.601 10.0454 19.2682 11.6729 20.4928C11.8719 20.652 12.1281 20.652 12.3271 20.4928C13.9546 19.2682 15.9496 18.601 18 18.601C18.8598 18.599 19.7089 18.6795 20.5246 18.8412C20.7761 18.8952 21 18.6977 21 18.439V4.613C21 4.4506 20.8961 4.30715 20.742 4.24995C19.8711 3.91993 18.9443 3.75 18 3.75C15.7856 3.74648 13.6484 4.56108 12 6.042Z"
            stroke={focused ? "url(#revisionGradient)" : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.12 : 0}
          />
          <Path
            d="M12 6.042V20.042"
            stroke={focused ? "url(#revisionGradient)" : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "profile":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="12"
            cy="8"
            r="4"
            stroke={focused ? "url(#profileGradient)" : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.12 : 0}
          />
          <Path
            d="M5 20C5 17.2386 7.23858 15 10 15H14C16.7614 15 19 17.2386 19 20"
            stroke={focused ? "url(#profileGradient)" : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.08 : 0}
          />
        </Svg>
      );

    default:
      return <View style={{ width: size, height: size }} />;
  }
}
