/**
 * notifications.ts — wrapper 100% safe pour Expo Go
 *
 * expo-notifications a été retiré des plugins app.json et n'est
 * plus importé de façon statique nulle part dans le projet.
 *
 * Pourquoi expo-notifications crashait :
 *  - Dans Expo Go SDK 53+, les push notifications Android ne sont plus
 *    supportées. Quand le module est dans les "plugins" de app.json,
 *    il s'initialise au démarrage natif et lance une exception qui bloque
 *    toute la chaîne de chargement Metro.
 *  - La solution : retirer "expo-notifications" des plugins app.json
 *    et ne l'importer QUE dynamiquement, uniquement quand nécessaire.
 *
 * Pour un vrai build (EAS Build / expo build), les notifications
 * fonctionneront normalement car le contexte natif est disponible.
 */

let _notifModule: any = null;

async function getNotifications() {
  if (_notifModule) return _notifModule;
  try {
    _notifModule = await import("expo-notifications");
    return _notifModule;
  } catch {
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifs = await getNotifications();
    if (!Notifs) return false;
    const settings = await Notifs.getPermissionsAsync();
    if (settings.granted) return true;
    const { granted } = await Notifs.requestPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

export async function registerPushToken(userId: string): Promise<void> {
  try {
    const Device = await import("expo-device");
    if (!Device.default?.isDevice) return;

    const Notifs = await getNotifications();
    if (!Notifs) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    const { getSupabaseOrThrow } = await import("./supabase");
    const tokenData = await Notifs.getExpoPushTokenAsync({ projectId: "bloc-app" });
    const supabase = getSupabaseOrThrow();
    await supabase
      .from("profiles")
      .update({ push_token: tokenData.data })
      .eq("id", userId)
      .catch(() => null);
  } catch {
    // Silencieux dans Expo Go
  }
}

export async function disablePushTokens(userId: string): Promise<void> {
  try {
    const { getSupabaseOrThrow } = await import("./supabase");
    const supabase = getSupabaseOrThrow();
    await supabase
      .from("profiles")
      .update({ push_token: null })
      .eq("id", userId)
      .catch(() => null);
  } catch {
    // Silencieux
  }
}
