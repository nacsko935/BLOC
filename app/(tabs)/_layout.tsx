import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
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

  const tabBarBg        = isDark ? "#000000" : "#FFFFFF";
  const tabBarBorder    = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const inactiveTint    = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.40)";
  const fabBorder       = isDark ? "#000000" : "#F0F0F5";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: tabBarBg,
            borderTopWidth: 1,
            borderTopColor: tabBarBorder,
            height: Platform.OS === "ios" ? 86 : 66,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
            paddingTop: 8,
            paddingHorizontal: 4,
            position: "absolute",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.3 : 0.06,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarActiveTintColor: "#6E5CFF",
          tabBarInactiveTintColor: inactiveTint,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2, letterSpacing: 0.2 },
          tabBarItemStyle: { minHeight: 44, marginHorizontal: 2 },
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
            title: "Créer", tabBarLabel: "Créer",
            tabBarButton: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Créer"
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/create" as any);
                }}
                style={{
                  width: 62, height: 62, borderRadius: 18,
                  backgroundColor: "#5B4CFF",
                  alignItems: "center", justifyContent: "center",
                  marginTop: -20,
                  borderWidth: 2, borderColor: fabBorder,
                  shadowColor: "#5B4CFF", shadowOpacity: 0.5, shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 }, elevation: 10,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900", letterSpacing: 0.5 }}>BLOC</Text>
              </Pressable>
            ),
            tabBarLabelStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: "Cours", tabBarLabel: "Cours",
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "book" : "book-outline"} size={20} color={color} />,
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
