import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 8 + 4,
  color: ["#FFD700","#FF6B6B","#7B6CFF","#FF85AB","#50E3C2","#FFA500","#00D2FF","#FF2D55","#34C759"][i % 9],
  delay: Math.random() * 1200,
  duration: 1400 + Math.random() * 1000,
}));

function Particle({ x, y, size, color, delay, duration }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const rotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      rotAnim.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(rotAnim, { toValue: 1, duration: duration * 0.8, useNativeDriver: true, easing: Easing.linear }),
        ]),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] });
  const scale = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 1.4, 1, 0.3] });
  const rotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={[
      styles.particle,
      { left: x, top: y, opacity, transform: [{ translateY }, { scale }, { rotate }] },
    ]}>
      <Text style={{ color, fontSize: size, fontWeight: "900" }}>
        {["✦","★","◆","●","✿"][Math.floor(Math.random() * 5)]}
      </Text>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 3D text animations
  const titleScale   = useRef(new Animated.Value(0)).current;
  const titleRotX    = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;
  const shineAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleScale, { toValue: 1, tension: 40, friction: 5, useNativeDriver: true }),
        Animated.timing(titleRotX, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Shine loop
    const loopShine = () => {
      shineAnim.setValue(0);
      Animated.timing(shineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start(() => loopShine());
    };
    setTimeout(loopShine, 800);
  }, []);

  const enter = async () => {
    await AsyncStorage.setItem("bloc.welcomed", "1").catch(() => null);
    router.replace("/(tabs)/home");
  };

  const shineX = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-width, width * 1.5] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0320", "#060118", "#000000"]} style={StyleSheet.absoluteFillObject} />

      {/* Particles */}
      {PARTICLES.map(p => <Particle key={p.id} {...p} />)}

      {/* Glow orbs */}
      <View style={[styles.orbPurple]} />
      <View style={[styles.orbBlue]} />

      <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Logo B */}
        <Animated.View style={{ transform: [{ scale: titleScale }], marginBottom: 12 }}>
          <LinearGradient colors={["#9D8FFF","#7B6CFF","#5040E0"]} style={styles.logoBox}>
            <Text style={styles.logoLetter}>B</Text>
          </LinearGradient>
          <View style={styles.logoGlow} />
        </Animated.View>

        {/* BIENVENUE SUR BLOC - 3D effect */}
        <Animated.View style={{ transform: [{ scale: titleScale }], overflow: "hidden", borderRadius: 8, marginBottom: 4 }}>
          <Text style={styles.welcome}>Bienvenue sur</Text>
          <View style={{ position: "relative" }}>
            <Text style={styles.blocTitle}>BLOC</Text>
            {/* Shine overlay */}
            <Animated.View style={[styles.shine, { transform: [{ translateX: shineX }, { rotate: "15deg" }] }]} />
            {/* 3D shadow layers */}
            <Text style={[styles.blocTitle, styles.blocShadow1]}>BLOC</Text>
            <Text style={[styles.blocTitle, styles.blocShadow2]}>BLOC</Text>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
          Ton espace d'apprentissage intelligent 🚀
        </Animated.Text>

        <Animated.View style={[styles.featuresRow, { opacity: subtitleOpacity }]}>
          {["📚 Cours IA", "🏆 Progression", "💬 Communauté"].map((f, i) => (
            <View key={i} style={styles.featureChip}>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={{ opacity: btnOpacity, width: "100%", paddingHorizontal: 32, marginTop: 40 }}>
          <Pressable onPress={enter} style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}>
            <LinearGradient colors={["#9D8FFF","#7B6CFF","#5040E0"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.enterBtn}>
              <Text style={styles.enterText}>Commencer l'aventure</Text>
              <Text style={{ fontSize: 20 }}>→</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  particle: { position: "absolute", pointerEvents: "none" },
  orbPurple: { position:"absolute", top:-80, left:-60, width:300, height:300, borderRadius:150, backgroundColor:"#7B6CFF", opacity:0.15 },
  orbBlue:   { position:"absolute", bottom:-60, right:-80, width:280, height:280, borderRadius:140, backgroundColor:"#4DA3FF", opacity:0.10 },
  center: { flex:1, alignItems:"center", justifyContent:"center", paddingHorizontal:24 },
  logoBox: { width:90, height:90, borderRadius:28, alignItems:"center", justifyContent:"center",
    shadowColor:"#7B6CFF", shadowOpacity:0.6, shadowRadius:30, shadowOffset:{width:0,height:0}, elevation:20 },
  logoLetter: { color:"#fff", fontSize:46, fontWeight:"900", letterSpacing:-2 },
  logoGlow: { position:"absolute", width:130, height:130, borderRadius:65,
    backgroundColor:"#7B6CFF", opacity:0.18, alignSelf:"center", top:-20, zIndex:-1 },
  welcome: { color:"rgba(255,255,255,0.7)", fontSize:20, fontWeight:"600", textAlign:"center", letterSpacing:2 },
  blocTitle: {
    color:"#fff", fontSize:72, fontWeight:"900", textAlign:"center",
    letterSpacing:-3,
    textShadowColor:"rgba(123,108,255,0.8)", textShadowOffset:{width:0, height:0}, textShadowRadius:20,
  },
  blocShadow1: {
    position:"absolute", top:3, left:0, right:0,
    color:"rgba(123,108,255,0.4)",
    textShadowColor:"transparent",
  },
  blocShadow2: {
    position:"absolute", top:6, left:0, right:0,
    color:"rgba(80,64,224,0.25)",
    textShadowColor:"transparent",
  },
  shine: {
    position:"absolute", top:0, bottom:0,
    width:60, backgroundColor:"rgba(255,255,255,0.18)",
    zIndex:10, pointerEvents:"none",
  },
  tagline: { color:"rgba(255,255,255,0.60)", fontSize:16, textAlign:"center", marginTop:12, lineHeight:24 },
  featuresRow: { flexDirection:"row", gap:10, marginTop:20, flexWrap:"wrap", justifyContent:"center" },
  featureChip: { borderRadius:20, paddingHorizontal:14, paddingVertical:7,
    backgroundColor:"rgba(123,108,255,0.18)", borderWidth:1, borderColor:"rgba(123,108,255,0.35)" },
  featureText: { color:"#C0B8FF", fontSize:13, fontWeight:"700" },
  enterBtn: { height:58, borderRadius:18, flexDirection:"row", alignItems:"center",
    justifyContent:"center", gap:12 },
  enterText: { color:"#fff", fontWeight:"900", fontSize:18, letterSpacing:0.3 },
});
