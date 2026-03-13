import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabaseOrThrow } from "../supabase";
import { Profile } from "../../types/db";
import { AvatarConfig } from "../../types/avatar";
import { Avatar3DConfig, createDefaultAvatar3DConfig, isAvatar3DConfig } from "../../src/components/Avatar3D";

const AVATAR3D_KEY = "bloc.avatar3d.v1";

const AVATAR_STORAGE_PREFIX = "bloc.avatar.config.";

const EXPRESSION_MOUTH: Record<AvatarConfig["expression"], AvatarConfig["mouth"]> = {
  neutral: "default",
  happy: "smile",
  focused: "serious",
  tired: "twinkle",
  motivated: "eating",
};

function safeSeed(value: string | null | undefined) {
  const seed = (value ?? "bloc-user").trim();
  return seed.length > 0 ? seed : "bloc-user";
}

export function createDefaultAvatarConfig(seed?: string | null): AvatarConfig {
  return {
    seed: safeSeed(seed),
    skinColor: "ffdbb4",
    top: "shortFlat",
    hairColor: "4a312c",
    eyes: "default",
    eyebrows: "default",
    mouth: "default",
    facialHair: "blank",
    clothes: "hoodie",
    clothesColor: "5199e4",
    accessories: "blank",
    expression: "neutral",
  };
}

function parseAvatarConfig(raw: unknown): Partial<AvatarConfig> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Partial<AvatarConfig>;
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as Partial<AvatarConfig>) : null;
  } catch {
    return null;
  }
}

export function normalizeAvatarConfig(raw: unknown, fallbackSeed?: string | null): AvatarConfig {
  const parsed = parseAvatarConfig(raw);
  const base = createDefaultAvatarConfig(fallbackSeed);
  if (!parsed) return base;

  const config: AvatarConfig = {
    ...base,
    ...parsed,
    seed: safeSeed(parsed.seed ?? fallbackSeed ?? base.seed),
  };

  if (!EXPRESSION_MOUTH[config.expression]) {
    config.expression = "neutral";
  }
  return config;
}

export function buildAvatarUrl(config: AvatarConfig, bustCache = false): string {
  const mouth = config.mouth || EXPRESSION_MOUTH[config.expression] || "default";
  const params = new URLSearchParams({
    seed: safeSeed(config.seed),
    skinColor: config.skinColor,
    top: config.top,
    hairColor: config.hairColor,
    eyes: config.eyes,
    eyebrows: config.eyebrows,
    mouth,
    clothing: config.clothes,
    clothesColor: config.clothesColor,
    backgroundColor: "0f0f13",
    scale: "95",
  });

  if (config.facialHair && config.facialHair !== "blank") {
    params.set("facialHair", config.facialHair);
    params.set("facialHairProbability", "100");
  } else {
    params.set("facialHairProbability", "0");
  }

  if (config.accessories && config.accessories !== "blank") {
    params.set("accessories", config.accessories);
    params.set("accessoriesProbability", "100");
  } else {
    params.set("accessoriesProbability", "0");
  }

  if (bustCache) params.set("t", String(Date.now()));
  return `https://api.dicebear.com/9.x/avataaars/png?${params.toString()}`;
}

async function getCurrentUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Session invalide. Reconnecte-toi.");
  return userId;
}

export async function getMyAvatarConfig(profile: Profile | null | undefined): Promise<AvatarConfig> {
  const userId = await getCurrentUserId();
  const storageKey = `${AVATAR_STORAGE_PREFIX}${userId}`;
  const seed = profile?.username || profile?.full_name || profile?.id || userId;

  const configFromProfile = normalizeAvatarConfig((profile as any)?.avatar_config, seed);
  if ((profile as any)?.avatar_config) return configFromProfile;

  try {
    const cached = await AsyncStorage.getItem(storageKey);
    if (!cached) return configFromProfile;
    return normalizeAvatarConfig(cached, seed);
  } catch {
    return configFromProfile;
  }
}

export async function saveMyAvatarConfig(config: AvatarConfig): Promise<Profile | null> {
  const supabase = getSupabaseOrThrow();
  const userId = await getCurrentUserId();
  const normalized = normalizeAvatarConfig(config, config.seed);
  const avatarUrl = buildAvatarUrl(normalized, true);
  const storageKey = `${AVATAR_STORAGE_PREFIX}${userId}`;

  await AsyncStorage.setItem(storageKey, JSON.stringify(normalized)).catch(() => null);

  const fullPayload = {
    id: userId,
    avatar_url: avatarUrl,
    avatar_config: normalized as unknown as Record<string, unknown>,
  };

  const fullUpsert = await supabase.from("profiles").upsert(fullPayload, { onConflict: "id" });
  if (fullUpsert.error) {
    const isMissingColumn = fullUpsert.error.code === "42703" || /avatar_config/i.test(fullUpsert.error.message || "");
    if (!isMissingColumn) throw fullUpsert.error;

    const fallback = await supabase
      .from("profiles")
      .upsert({ id: userId, avatar_url: avatarUrl }, { onConflict: "id" });
    if (fallback.error) throw fallback.error;
  }

  const profileRes = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (profileRes.error) throw profileRes.error;
  return (profileRes.data as Profile | null) ?? null;
}

export function setAvatarExpression(config: AvatarConfig, expression: AvatarConfig["expression"]): AvatarConfig {
  return {
    ...config,
    expression,
    mouth: EXPRESSION_MOUTH[expression],
  };
}

// ── 3D Avatar ─────────────────────────────────────────────────────────────────

export async function getMyAvatar3DConfig(profile: Profile | null | undefined): Promise<Avatar3DConfig> {
  // 1. Check profile's avatar_config for a 3D config
  const fromProfile = (profile as any)?.avatar_config;
  if (isAvatar3DConfig(fromProfile)) return fromProfile;

  // 2. Fallback to AsyncStorage
  try {
    const raw = await AsyncStorage.getItem(AVATAR3D_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isAvatar3DConfig(parsed)) return parsed;
    }
  } catch { /* ignore */ }

  return createDefaultAvatar3DConfig();
}

export async function saveMyAvatar3DConfig(config: Avatar3DConfig): Promise<Profile | null> {
  const supabase = getSupabaseOrThrow();
  const userId = await getCurrentUserId();

  // Always persist locally
  await AsyncStorage.setItem(AVATAR3D_KEY, JSON.stringify(config)).catch(() => null);

  // Try to persist to Supabase
  const payload = {
    id: userId,
    avatar_config: config as unknown as Record<string, unknown>,
    // Clear DiceBear avatar_url since we now use native 3D avatar
    avatar_url: null,
  };
  const upsertRes = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (upsertRes.error) {
    // avatar_config column might not exist yet — silently fall back
    const isMissingCol = upsertRes.error.code === "42703" || /avatar_config/i.test(upsertRes.error.message ?? "");
    if (!isMissingCol) throw upsertRes.error;
  }

  const profileRes = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (profileRes.error) throw profileRes.error;
  return (profileRes.data as Profile | null) ?? null;
}
