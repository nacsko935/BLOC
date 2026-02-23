import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Animated, Platform, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { getSessionUser } from "../../src/features/auth/authRepo";
import TabIcon from "../../src/core/ui/TabIcon";
import { isOnboardingComplete } from "../../src/features/profile/services/onboardingService";
import { FloatingCreateButton } from "../../src/components/FloatingCreateButton";
import { CreateSheet } from "../../src/components/CreateSheet";

type EmojiIconProps = {
  glyph: string;
  focused: boolean;
};

function EmojiIcon({ glyph, focused }: EmojiIconProps) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.92)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.92,
      useNativeDriver: true,
      tension: 260,
      friction: 18,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View
      style={{
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale }],
        opacity: focused ? 1 : 0.78,
      }}
    >
      <Text style={{ fontSize: focused ? 22 : 20 }}>{glyph}</Text>
    </Animated.View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getSessionUser();
      if (!user) router.replace("/(auth)/login");
      else if (!(await isOnboardingComplete())) router.replace("/onboarding");
    })();
  }, [router]);

  const showFab = pathname === "/home" || pathname === "/reels" || pathname === "/courses" || pathname === "/profile";

  const onOpenCreate = useCallback(() => setSheetOpen(true), []);
  const onCloseCreate = useCallback(() => setSheetOpen(false), []);
  const onCreateAction = useCallback(
    (route: "/create/pdf" | "/create/audio" | "/create/qcm" | "/create/flashcards") => {
      setSheetOpen(false);
      router.push(route);
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
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
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
            tabBarIcon: ({ color, focused }) => <TabIcon name="home" focused={focused} color={color} />,
          }}
        />

        <Tabs.Screen
          name="reels"
          options={{
            title: "Reels",
            tabBarIcon: ({ focused }) => <EmojiIcon glyph="🎬" focused={focused} />,
          }}
        />

        <Tabs.Screen
          name="courses"
          options={{
            title: "Cours",
            tabBarIcon: ({ color, focused }) => <TabIcon name="revisions" focused={focused} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ color, focused }) => <TabIcon name="profile" focused={focused} color={color} />,
          }}
        />

        <Tabs.Screen name="search" options={{ href: null }} />
      </Tabs>

      {showFab ? <FloatingCreateButton bottom={Platform.OS === "ios" ? 58 : 48} onPress={onOpenCreate} /> : null}
      <CreateSheet visible={sheetOpen} onClose={onCloseCreate} onActionPress={onCreateAction} />
    </View>
  );
}
