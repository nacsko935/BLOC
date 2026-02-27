import { getSupabaseOrThrow } from "../supabase";
import { isAnalyticsGlobalDisabled } from "./appConfigService";

const eventTs = new Map<string, number>();
let profileCache: { userId: string; enabled: boolean; expiresAt: number } | null = null;

async function isAnalyticsEnabledForUser(userId: string) {
  if (profileCache && profileCache.userId === userId && Date.now() < profileCache.expiresAt) {
    return profileCache.enabled;
  }

  const supabase = getSupabaseOrThrow();
  const { data } = await supabase
    .from("profiles")
    .select("analytics_enabled")
    .eq("id", userId)
    .maybeSingle();

  const enabled = (data?.analytics_enabled ?? true) !== false;
  profileCache = { userId, enabled, expiresAt: Date.now() + 60_000 };
  return enabled;
}

export async function track(eventName: string, metadata?: Record<string, unknown>) {
  const key = `${eventName}:${JSON.stringify(metadata || {})}`;
  const now = Date.now();
  const last = eventTs.get(key) || 0;
  if (now - last < 1200) return;
  eventTs.set(key, now);

  const globalDisabled = await isAnalyticsGlobalDisabled();
  if (globalDisabled) return;

  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) return;

  const userId = data.user?.id;
  if (!userId) return;
  if (!(await isAnalyticsEnabledForUser(userId))) return;

  await supabase.from("analytics_events").insert({
    user_id: userId,
    event_name: eventName,
    metadata: metadata || {},
  });
}
