import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { migrate } from "../src/core/data/migrations";
import { ConversationsProvider } from "../src/core/context/ConversationsContext";
import { ThemeProvider } from "../src/core/theme/ThemeProvider";
import { AppErrorBoundary } from "../src/core/ui/AppErrorBoundary";
import { useAuthStore } from "../state/useAuthStore";
import * as Notifications from "expo-notifications";
import { optimizeLocalStorage } from "../src/core/storage/optimizer";

const qc = new QueryClient();

function AuthBootstrap({ children }: React.PropsWithChildren) {
  const { initAuth, loading } = useAuthStore();

  useEffect(() => {
    initAuth().catch(() => null);
  }, [initAuth]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#6E5CFF" size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function NotificationBootstrap({ children }: React.PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    const openFromResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const data = response.notification.request.content.data as Record<string, string>;
      const url = data?.url;
      const type = data?.type;
      const conversationId = data?.conversation_id;

      if (typeof url === "string" && url.length > 0) {
        router.push(url as never);
        return;
      }
      if (!conversationId) return;

      if (type === "dm") {
        router.push({ pathname: "/messages/[id]", params: { id: conversationId } });
      } else if (type === "group") {
        router.push({ pathname: "/messages/group/[id]", params: { id: conversationId } });
      }
    };

    Notifications.getLastNotificationResponseAsync().then(openFromResponse).catch(() => null);
    const sub = Notifications.addNotificationResponseReceivedListener(openFromResponse);

    return () => sub.remove();
  }, [router]);

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    migrate().catch(() => null);
    optimizeLocalStorage().catch(() => null);
  }, []);

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={qc}>
            <ConversationsProvider>
              <AuthBootstrap>
                <NotificationBootstrap>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(learning)" options={{ headerShown: false }} />
                    <Stack.Screen name="(plan)" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                    <Stack.Screen name="create" options={{ headerShown: false }} />
                    <Stack.Screen name="progress" options={{ headerShown: false }} />
                    <Stack.Screen name="library" options={{ headerShown: false }} />
                    <Stack.Screen name="settings" options={{ headerShown: false }} />
                    <Stack.Screen name="debug-tools" options={{ headerShown: false }} />

                    <Stack.Screen name="(modals)/create" options={{ presentation: "transparentModal", headerShown: false }} />
                    <Stack.Screen name="(modals)/create-new" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/note-new" options={{ presentation: "modal", title: "Nouvelle note" }} />
                    <Stack.Screen name="(modals)/task-new" options={{ presentation: "modal", title: "Nouvelle tache" }} />
                    <Stack.Screen name="(modals)/qcm-new" options={{ presentation: "modal", title: "Creer un QCM" }} />
                    <Stack.Screen name="(modals)/course-new" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/profile-edit" options={{ presentation: "modal", title: "Profil" }} />
                    <Stack.Screen name="(modals)/edit-profile" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/school-join" options={{ presentation: "modal", title: "Code ecole" }} />
                    <Stack.Screen name="(modals)/link-school" options={{ presentation: "modal", title: "Lier une ecole" }} />
                    <Stack.Screen name="(modals)/prof-follow" options={{ presentation: "modal", title: "Suivre un prof" }} />
                    <Stack.Screen name="(modals)/profile-photo" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/reel-comments" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/flashcards" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/pomodoro" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/quiz" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/new-conversation" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/deadlines" options={{ presentation: "modal", headerShown: false }} />
                    <Stack.Screen name="(modals)/create-reel" options={{ presentation: "modal", headerShown: false }} />

                    <Stack.Screen name="note/[id]" options={{ title: "Note" }} />
                    <Stack.Screen name="task/[id]" options={{ title: "Tache" }} />
                    <Stack.Screen name="qcm/[id]" options={{ title: "QCM" }} />
                    <Stack.Screen name="course/[id]" options={{ title: "Cours", headerShown: false }} />
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
