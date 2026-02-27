import { getSupabaseOrThrow } from "../supabase";

type AppConfigFlags = {
  pushGlobalDisabled: boolean;
  analyticsGlobalDisabled: boolean;
};

type AppConfigRow = {
  key: string;
  value: unknown;
};

const DEFAULT_FLAGS: AppConfigFlags = {
  pushGlobalDisabled: false,
  analyticsGlobalDisabled: false,
};

let cachedFlags: AppConfigFlags | null = null;
let cacheUntil = 0;

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "on";
  }
  if (value && typeof value === "object" && "enabled" in (value as Record<string, unknown>)) {
    return parseBoolean((value as Record<string, unknown>).enabled);
  }
  return false;
}

export async function getAppConfigFlags(force = false): Promise<AppConfigFlags> {
  const now = Date.now();
  if (!force && cachedFlags && now < cacheUntil) return cachedFlags;

  try {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from("app_config")
      .select("key,value")
      .in("key", ["push_global_disabled", "analytics_global_disabled"]);

    if (error) throw error;

    const rows = (data ?? []) as AppConfigRow[];
    const rowMap = new Map(rows.map((row) => [row.key, row.value]));

    cachedFlags = {
      pushGlobalDisabled: parseBoolean(rowMap.get("push_global_disabled")),
      analyticsGlobalDisabled: parseBoolean(rowMap.get("analytics_global_disabled")),
    };
  } catch {
    cachedFlags = DEFAULT_FLAGS;
  }

  cacheUntil = now + 60_000;
  return cachedFlags;
}

export async function isPushGlobalDisabled() {
  const flags = await getAppConfigFlags();
  return flags.pushGlobalDisabled;
}

export async function isAnalyticsGlobalDisabled() {
  const flags = await getAppConfigFlags();
  return flags.analyticsGlobalDisabled;
}

