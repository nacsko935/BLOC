import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { migrate } from "../src/core/data/migrations";
import { ConversationsProvider } from "../src/core/context/ConversationsContext";
import { ThemeProvider } from "../src/core/theme/ThemeProvider";
import { AppErrorBoundary } from "../src/core/ui/AppErrorBoundary";

const qc = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    migrate();
  }, []);

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={qc}>
            <ConversationsProvider>
              <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="create" options={{ headerShown: false }} />
            <Stack.Screen name="progress" options={{ headerShown: false }} />
            <Stack.Screen name="library" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />

            <Stack.Screen name="(modals)/create" options={{ presentation: "transparentModal", headerShown: false }} />
            <Stack.Screen name="(modals)/create-new" options={{ presentation: "modal", headerShown: false }} />
            <Stack.Screen name="(modals)/note-new" options={{ presentation: "modal", title: "Nouvelle note" }} />
            <Stack.Screen name="(modals)/task-new" options={{ presentation: "modal", title: "Nouvelle tâche" }} />
            <Stack.Screen name="(modals)/qcm-new" options={{ presentation: "modal", title: "Créer un QCM" }} />
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
            <Stack.Screen name="task/[id]" options={{ title: "Tâche" }} />
            <Stack.Screen name="qcm/[id]" options={{ title: "QCM" }} />
            <Stack.Screen name="course/[id]" options={{ title: "Cours", headerShown: false }} />
              </Stack>
            </ConversationsProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

