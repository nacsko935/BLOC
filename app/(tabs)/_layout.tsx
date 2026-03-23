import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { BlocLogo } from "../../src/components/BlocLogo";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "../../state/useAuthStore";
import { useTheme } from "../../src/core/theme/ThemeProvider";

export default function TabsLayout() {
  const router = useRouter();
  const { initAuth, loading, session } = useAuthStore();
  const { c, isDark } = useTheme();
  useEffect(() => {
    initAuth().catch(() => router.replace("/(auth)/login"));
  }, [initAuth, router]);

  useEffect(() => {
    if (!loading && !session) router.replace("/(auth)/login");
  }, [loading, session, router]);

  const tabBarBg        = isDark ? "#07071A" : "#F6F5FF";
  const tabBarBorder    = isDark ? "rgba(130,110,255,0.13)" : "rgba(91,76,255,0.08)";
  const inactiveTint    = isDark ? "rgba(180,172,255,0.38)" : "rgba(13,11,46,0.35)";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: tabBarBg,
            borderTopWidth: 1,
            borderTopColor: tabBarBorder,
            height: Platform.OS === "ios" ? 88 : 68,
            paddingBottom: Platform.OS === "ios" ? 22 : 10,
            paddingTop: 10,
            paddingHorizontal: 8,
            position: "absolute",
            shadowColor: "#5B4CFF",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.15 : 0.04,
            shadowRadius: 20,
            elevation: 12,
          },
          tabBarActiveTintColor: "#7B6CFF",
          tabBarInactiveTintColor: inactiveTint,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 3, letterSpacing: 0.3 },
          tabBarItemStyle: { minHeight: 44 },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={isDark ? 70 : 80}
                tint={isDark ? "dark" : "light"}
                style={{ flex: 1, borderTopWidth: 1, borderTopColor: tabBarBorder }}
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: tabBarBg, borderTopWidth: 1, borderTopColor: tabBarBorder }} />
            ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Accueil", tabBarLabel: "Accueil",
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />,
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />
        <Tabs.Screen
          name="messages/index"
          options={{
            title: "Messages", tabBarLabel: "Messages",
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={20} color={color} />,
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />
        <Tabs.Screen
          name="compose"
          options={{
            title: "", tabBarLabel: "",
            tabBarButton: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="BLOC IA"
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/create" as any);
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -22,
                }}
              >
                <View style={{
                  width: 60, height: 60,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#7B6CFF",
                  shadowOpacity: 0.7,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 14,
                  borderWidth: 2,
                  borderColor: isDark ? "#5040C8" : "#C8C0FF",
                  overflow: "hidden",
                  backgroundColor: isDark ? "#1A0E3D" : "#EDE9FF",
                }}>
                  <BlocLogo size={40} variant={isDark ? "dark" : "light"} />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: "Cours", tabBarLabel: "Cours",
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "school" : "school-outline"} size={20} color={color} />,
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil", tabBarLabel: "Profil",
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />,
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />
        <Tabs.Screen name="reels"       options={{ href: null }} />
        <Tabs.Screen name="search"      options={{ href: null }} />
        <Tabs.Screen name="plan"        options={{ href: null }} />
        <Tabs.Screen name="learning"    options={{ href: null }} />
        <Tabs.Screen name="progression" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
