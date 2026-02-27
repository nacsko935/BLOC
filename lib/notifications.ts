import { getSupabaseOrThrow } from "./supabase";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { isPushGlobalDisabled } from "./services/appConfigService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const request = await Notifications.requestPermissionsAsync();
  return request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function getExpoPushToken() {
  if (!Device.isDevice) return null;
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function registerPushToken(userId: string) {
  const globalDisabled = await isPushGlobalDisabled();
  if (globalDisabled) return null;

  const supabase = getSupabaseOrThrow();
  const token = await getExpoPushToken();
  if (!token) return null;

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: token,
      platform: Device.osName || "unknown",
      enabled: true,
    },
    { onConflict: "user_id,expo_push_token" }
  );

  if (error) throw error;
  return token;
}

export async function disablePushTokens(userId: string) {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("push_tokens").update({ enabled: false }).eq("user_id", userId);
  if (error) throw error;
}

export function setupNotificationResponseHandler() {
  const subscription = Notifications.addNotificationResponseReceivedListener((_response) => {
    // Handled in app with router-aware callback when needed.
  });
  return () => subscription.remove();
}
