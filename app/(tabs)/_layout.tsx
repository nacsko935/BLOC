import { useCallback, useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CreateBottomSheet, CreateActionKey } from "../../src/components/CreateBottomSheet";
import { useAuthStore } from "../../state/useAuthStore";

export default function TabsLayout() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { initAuth, loading, session } = useAuthStore();

  useEffect(() => {
    initAuth().catch(() => {
      router.replace("/(auth)/login");
    });
  }, [initAuth, router]);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/(auth)/login");
    }
  }, [loading, session, router]);

  const onOpenCreate = useCallback(() => setSheetOpen(true), []);
  const onCloseCreate = useCallback(() => setSheetOpen(false), []);
  const onCreateAction = useCallback(
    (action: CreateActionKey) => {
      setSheetOpen(false);
      if (action === "post") router.push("/create");
      if (action === "pdf") router.push("/create/pdf");
      if (action === "qcm") router.push("/create/qcm");
      if (action === "group") router.push("/messages");
    },
    [router]
  );

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "transparent",
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.08)",
            height: Platform.OS === "ios" ? 86 : 66,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
            paddingTop: 8,
            paddingHorizontal: 4,
            position: "absolute",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarActiveTintColor: "#6E5CFF",
          tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            marginTop: 2,
            letterSpacing: 0.2,
          },
          tabBarItemStyle: {
            minHeight: 44,
            marginHorizontal: 2,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={Platform.OS === "ios" ? 70 : 35}
              tint="dark"
              style={{ flex: 1, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Accueil",
            tabBarLabel: "Accueil",
            tabBarAccessibilityLabel: "Accueil",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />

        <Tabs.Screen
          name="messages/index"
          options={{
            title: "Messages",
            tabBarLabel: "Messages",
            tabBarAccessibilityLabel: "Messages",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={20} color={color} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />

        <Tabs.Screen
          name="compose"
          options={{
            title: "Creer",
            tabBarLabel: "Creer",
            tabBarAccessibilityLabel: "Creer",
            tabBarButton: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Creer"
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onOpenCreate();
                }}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  backgroundColor: "#5B4CFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -20,
                  borderWidth: 3,
                  borderColor: "#0B0B0F",
                  shadowColor: "#000",
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 10,
                }}
              >
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </Pressable>
            ),
            tabBarLabelStyle: { display: "none" },
          }}
        />

        <Tabs.Screen
          name="courses"
          options={{
            title: "Cours",
            tabBarLabel: "Cours",
            tabBarAccessibilityLabel: "Cours",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "book" : "book-outline"} size={20} color={color} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarLabel: "Profil",
            tabBarAccessibilityLabel: "Profil",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.selectionAsync() }}
        />

        <Tabs.Screen name="reels" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
      </Tabs>

      <CreateBottomSheet visible={sheetOpen} onClose={onCloseCreate} onActionPress={onCreateAction} />
    </View>
  );
}