import { getSupabaseOrThrow } from "../supabase";
import { listModules } from "../../src/features/learning/services";

export type ShopModule = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  durationMinutes: number;
  rating: number;
  isPaid: boolean;
  priceCents: number;
  isOwned: boolean;
};

export type ShopListFilters = {
  query?: string;
  mode?: "all" | "free" | "premium" | "owned";
  limit?: number;
  offset?: number;
};

export type ShopListResult = {
  items: ShopModule[];
  featureUnavailable: boolean;
};

async function getCurrentUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

function isMissingSchema(error: any) {
  const code = error?.code;
  return code === "PGRST205" || code === "42P01" || code === "42703";
}

async function fallbackFromMock(mode: ShopListFilters["mode"], query?: string): Promise<ShopModule[]> {
  const rows = await listModules({});
  const normalizedQuery = (query ?? "").trim().toLowerCase();
  let mapped: ShopModule[] = rows.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.subtitle || "Module d'apprentissage",
    authorName: m.authorName || "Créateur BLOC",
    durationMinutes: m.durationMinutes || 0,
    rating: Number(m.ratingAvg || 0),
    isPaid: !m.isFree,
    priceCents: m.isFree ? 0 : m.priceCents ?? 990,
    isOwned: false,
  }));

  if (normalizedQuery) {
    mapped = mapped.filter(
      (m) =>
        m.title.toLowerCase().includes(normalizedQuery) ||
        m.description.toLowerCase().includes(normalizedQuery) ||
        m.authorName.toLowerCase().includes(normalizedQuery),
    );
  }

  if (mode === "free") mapped = mapped.filter((m) => !m.isPaid);
  if (mode === "premium") mapped = mapped.filter((m) => m.isPaid);
  if (mode === "owned") mapped = [];

  return mapped.slice(0, 30);
}

export async function listShopModules(filters: ShopListFilters = {}): Promise<ShopListResult> {
  const supabase = getSupabaseOrThrow();
  const userId = await getCurrentUserId();
  const mode = filters.mode ?? "all";
  const query = (filters.query ?? "").trim();
  const limit = filters.limit ?? 30;
  const offset = filters.offset ?? 0;

  const capability = await supabase.from("modules").select("id").limit(1);
  if (capability.error) {
    if (isMissingSchema(capability.error)) {
      const fallback = await fallbackFromMock(mode, query);
      return { items: fallback, featureUnavailable: true };
    }
    throw capability.error;
  }

  let moduleQuery = supabase
    .from("modules")
    .select("id,creator_id,title,description,duration_minutes,is_paid,price_cents,rating,is_public,created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (mode !== "owned") {
    moduleQuery = moduleQuery.eq("is_public", true);
  }

  if (mode === "free") moduleQuery = moduleQuery.eq("is_paid", false);
  if (mode === "premium") moduleQuery = moduleQuery.eq("is_paid", true);
  if (query) moduleQuery = moduleQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  const modulesRes = await moduleQuery;
  if (modulesRes.error) {
    if (isMissingSchema(modulesRes.error)) {
      const fallback = await fallbackFromMock(mode, query);
      return { items: fallback, featureUnavailable: true };
    }
    throw modulesRes.error;
  }

  const rows = modulesRes.data ?? [];
  if (!rows.length) return { items: [], featureUnavailable: false };

  const moduleIds = rows.map((r: any) => r.id);
  const creatorIds = [...new Set(rows.map((r: any) => r.creator_id).filter(Boolean))];

  let orderRows: Array<{ module_id: string }> = [];
  if (userId) {
    const ordersRes = await supabase
      .from("marketplace_orders")
      .select("module_id")
      .eq("user_id", userId)
      .eq("status", "paid")
      .in("module_id", moduleIds);

    if (!ordersRes.error) {
      orderRows = (ordersRes.data ?? []) as Array<{ module_id: string }>;
    } else if (!isMissingSchema(ordersRes.error)) {
      throw ordersRes.error;
    }
  }

  let profilesMap = new Map<string, any>();
  if (creatorIds.length) {
    const profilesRes = await supabase
      .from("profiles")
      .select("*")
      .in("id", creatorIds);
    if (!profilesRes.error) {
      profilesMap = new Map((profilesRes.data ?? []).map((p: any) => [p.id, p]));
    }
  }

  const ownedSet = new Set(orderRows.map((o) => o.module_id));

  let items: ShopModule[] = rows.map((row: any) => {
    const p = profilesMap.get(row.creator_id);
    const authorName = p?.display_name || p?.full_name || p?.username || "Créateur BLOC";
    const isPaid = Boolean(row.is_paid);
    return {
      id: row.id,
      title: row.title || "Module",
      description: row.description || "Module d'apprentissage",
      authorName,
      durationMinutes: Number(row.duration_minutes || 0),
      rating: Number(row.rating || 0),
      isPaid,
      priceCents: isPaid ? Number(row.price_cents || 0) : 0,
      isOwned: ownedSet.has(row.id),
    };
  });

  if (mode === "owned") {
    items = items.filter((m) => m.isOwned);
  }

  return { items, featureUnavailable: false };
}

export async function purchaseModule(moduleId: string, amountCents: number): Promise<{ purchased: boolean }> {
  const supabase = getSupabaseOrThrow();
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Tu dois être connecté pour acheter un module.");

  const existing = await supabase
    .from("marketplace_orders")
    .select("id")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .eq("status", "paid")
    .maybeSingle();

  if (!existing.error && existing.data) {
    return { purchased: true };
  }
  if (existing.error && !isMissingSchema(existing.error)) throw existing.error;

  const insert = await supabase.from("marketplace_orders").insert({
    user_id: userId,
    module_id: moduleId,
    amount_cents: Math.max(0, Math.floor(amountCents)),
    currency: "EUR",
    status: "paid",
  });

  if (insert.error) {
    if (isMissingSchema(insert.error)) {
      throw new Error("Boutique indisponible sur cet environnement (migrations non déployées).");
    }
    throw insert.error;
  }

  return { purchased: true };
}
