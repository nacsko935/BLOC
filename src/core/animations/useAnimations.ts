import { useRef, useEffect } from "react";
import { Animated } from "react-native";

/**
 * Hook pour une animation d'entrée en fade-in + slide
 */
export function useFadeInSlideUp(duration = 500, delay = 0) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };
}

/**
 * Hook pour une animation de pulse
 */
export function usePulseAnimation(enabled = true, duration = 1000) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!enabled) {
      pulseAnim.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [enabled]);

  return { transform: [{ scale: pulseAnim }] };
}

/**
 * Hook pour une animation de rotation
 */
export function useRotateAnimation(enabled = true, duration = 2000) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      rotateAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [enabled]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return { transform: [{ rotate }] };
}

/**
 * Hook pour une animation de shake (secouer)
 */
export function useShakeAnimation(trigger: any) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger) return;

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [trigger]);

  return { transform: [{ translateX: shakeAnim }] };
}

/**
 * Hook pour une animation de bounce (rebond)
 */
export function useBounceAnimation(trigger: any) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger) return;

    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      bounceAnim.setValue(0);
    });
  }, [trigger]);

  const scale = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1],
  });

  return { transform: [{ scale }] };
}

/**
 * Hook pour une animation de progress bar
 */
export function useProgressAnimation(progress: number, duration = 500) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration,
      useNativeDriver: false, // Width animation can't use native driver
    }).start();
  }, [progress]);

  return progressAnim;
}

/**
 * Hook pour une animation de fade-in simple
 */
export function useFadeIn(duration = 300, delay = 0) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return { opacity: fadeAnim };
}

/**
 * Hook pour animation de liste avec stagger (décalage)
 */
export function useStaggerAnimation(index: number, duration = 300) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = index * 50; // 50ms de décalage par item

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };
}
