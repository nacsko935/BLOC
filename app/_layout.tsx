import { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/core/theme/ThemeProvider";
import { AppErrorBoundary } from "../src/core/ui/AppErrorBoundary";
import { ConversationsProvider } from "../src/core/context/ConversationsContext";
import { useAuthStore } from "../state/useAuthStore";
import { migrate } from "../src/core/data/migrations";
import { optimizeLocalStorage } from "../src/core/storage/optimizer";

const qc = new QueryClient();

// ── AuthBootstrap — timeout de sécurité 4s pour ne jamais rester bloqué
function AuthBootstrap({ children }: React.PropsWithChildren) {
  const { initAuth, loading } = useAuthStore();

  useEffect(() => {
    // Timeout de sécurité : si initAuth prend trop longtemps, on continue quand même
    const timeout = setTimeout(() => {
      useAuthStore.setState({ loading: false });
    }, 4000);

    initAuth()
      .catch(() => null)
      .finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, [initAuth]);

  // Migrations et storage en arrière-plan, jamais bloquantes
  useEffect(() => {
    migrate().catch(() => null);
    optimizeLocalStorage().catch(() => null);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <ActivityIndicator color="#7B6CFF" size="large" />
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#7B6CFF", alignItems: "center", justifyContent: "center" }}>
          {/* Logo BLOC textuel */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
          <ActivityIndicator color="#FFF" size="small" style={{ opacity: 0 }} />
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

// ── NotificationBootstrap — totalement safe, ne bloque JAMAIS
// expo-notifications crash dans Expo Go sur Android SDK 53
// On le désactive silencieusement sur les plateformes non supportées
function NotificationBootstrap({ children }: React.PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    // Import dynamique pour éviter que le crash notifications bloque le bundle
    let sub: { remove: () => void } | null = null;

    (async () => {
      try {
        const Notifs = await import("expo-notifications");
        const openFromResponse = (response: any) => {
          if (!response) return;
          const data = response?.notification?.request?.content?.data as Record<string, string> | undefined;
          if (!data) return;
          const url = data?.url;
          const type = data?.type;
          const conversationId = data?.conversation_id;
          if (typeof url === "string" && url.length > 0) { router.push(url as never); return; }
          if (!conversationId) return;
          if (type === "dm")    router.push({ pathname: "/messages/[id]",       params: { id: conversationId } });
          if (type === "group") router.push({ pathname: "/messages/group/[id]", params: { id: conversationId } });
        };
        Notifs.getLastNotificationResponseAsync().then(openFromResponse).catch(() => null);
        sub = Notifs.addNotificationResponseReceivedListener(openFromResponse);
      } catch {
        // expo-notifications non disponible dans Expo Go → on ignore silencieusement
      }
    })();

    return () => { sub?.remove(); };
  }, [router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={qc}>
            <ConversationsProvider>
              <AuthBootstrap>
                <NotificationBootstrap>
                  <Stack>
                    <Stack.Screen name="(tabs)"       options={{ headerShown: false }} />
                    <Stack.Screen name="(learning)"   options={{ headerShown: false }} />
                    <Stack.Screen name="(plan)"       options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding"   options={{ headerShown: false }} />
                    <Stack.Screen name="create" options={{ headerShown: false }} />
                    <Stack.Screen name="notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="progress/index" options={{ headerShown: false }} />
                    <Stack.Screen name="library/index"  options={{ headerShown: false }} />
                    <Stack.Screen name="settings"     options={{ headerShown: false }} />
                    <Stack.Screen name="debug-tools"  options={{ headerShown: false }} />
                    <Stack.Screen name="(modals)/create"        options={{ presentation: "transparentModal", headerShown: false }} />
                    <Stack.Screen name="(modals)/create-new"    options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/note-new"      options={{ presentation: "modal", title: "Nouvelle note" }} />
                    <Stack.Screen name="(modals)/task-new"      options={{ presentation: "modal", title: "Nouvelle tache" }} />
                    <Stack.Screen name="(modals)/qcm-new"       options={{ presentation: "modal", title: "Creer un QCM" }} />
                    <Stack.Screen name="(modals)/course-new"    options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/profile-edit"  options={{ presentation: "modal", title: "Profil" }} />
                    <Stack.Screen name="(modals)/edit-profile"  options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/school-join"   options={{ presentation: "modal", title: "Code ecole" }} />
                    <Stack.Screen name="(modals)/link-school"   options={{ presentation: "modal", title: "Lier une ecole" }} />
                    <Stack.Screen name="(modals)/prof-follow"   options={{ presentation: "modal", title: "Suivre un prof" }} />
                    <Stack.Screen name="(modals)/profile-photo" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/reel-comments" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/flashcards"    options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/pomodoro"      options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/quiz"          options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/new-conversation" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/deadlines"     options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/create-reel"   options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="note/[id]"    options={{ title: "Note" }} />
                    <Stack.Screen name="task/[id]"    options={{ title: "Tache" }} />
                    <Stack.Screen name="qcm/[id]"     options={{ title: "QCM" }} />
                    <Stack.Screen name="course/[id]"  options={{ title: "Cours", headerShown: false }} />
                    <Stack.Screen name="content/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="trends/[id]"  options={{ headerShown: false }} />
                    <Stack.Screen name="messages/[id]"       options={{ headerShown: false }} />
                    <Stack.Screen name="messages/group/[id]" options={{ headerShown: false }} />
                  </Stack>
                </NotificationBootstrap>
              </AuthBootstrap>
            </ConversationsProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
