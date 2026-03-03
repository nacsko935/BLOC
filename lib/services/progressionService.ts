import { getSupabaseOrThrow } from "../supabase";

export type ProgressionStats = {
  streak: number;
  objectiveCurrent: number;
  objectiveTarget: number;
  modulesDone: number;
  flashcardsCreated: number;
  source: "supabase" | "fallback";
};

type Filter = { column: string; value: any };

function isSchemaMissingError(error: any) {
  const code = error?.code;
  return code === "PGRST205" || code === "42P01" || code === "42703";
}

async function countRows(table: string, filters: Filter[] = []): Promise<number | null> {
  try {
    const supabase = getSupabaseOrThrow();
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    for (const f of filters) {
      query = query.eq(f.column, f.value);
    }
    const { count, error } = await query;
    if (error) {
      if (isSchemaMissingError(error)) return null;
      throw error;
    }
    return count ?? 0;
  } catch (error: any) {
    if (isSchemaMissingError(error)) return null;
    return null;
  }
}

async function getStreak(userId: string): Promise<number | null> {
  try {
    const supabase = getSupabaseOrThrow();

    let res = await supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle();
    if (res.error && isSchemaMissingError(res.error)) return null;
    if (!res.error && res.data) {
      const row = res.data as Record<string, any>;
      const value = row.current_streak ?? row.streak ?? row.days ?? null;
      return typeof value === "number" ? value : null;
    }
  } catch {
    return null;
  }
  return null;
}

async function getGoalsProgress(userId: string): Promise<{ done: number; total: number } | null> {
  // Try goals table with flexible status mapping.
  try {
    const supabase = getSupabaseOrThrow();
    const totalRes = await supabase.from("goals").select("*", { count: "exact", head: true }).eq("user_id", userId);
    if (totalRes.error) {
      if (isSchemaMissingError(totalRes.error)) return null;
      throw totalRes.error;
    }

    const doneRes = await supabase
      .from("goals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["done", "completed"]);

    if (doneRes.error) {
      if (isSchemaMissingError(doneRes.error)) return null;
      throw doneRes.error;
    }

    return { done: doneRes.count ?? 0, total: totalRes.count ?? 0 };
  } catch {
    return null;
  }
}

export async function fetchProgressionStatsFromSupabase(userId: string): Promise<Partial<ProgressionStats> | null> {
  if (!userId) return null;

  const [modulesFromProgress, modulesFromEnrollments, flashcardsFromLibrary, streak, goals] = await Promise.all([
    countRows("progress", [
      { column: "user_id", value: userId },
      { column: "status", value: "done" },
    ]),
    countRows("enrollments", [
      { column: "user_id", value: userId },
      { column: "status", value: "completed" },
    ]),
    countRows("library_items", [
      { column: "user_id", value: userId },
      { column: "type", value: "ai_flashcards" },
    ]),
    getStreak(userId),
    getGoalsProgress(userId),
  ]);

  const modulesDone = modulesFromProgress ?? modulesFromEnrollments;
  const flashcardsCreated = flashcardsFromLibrary;
  const objectiveCurrent = goals?.done ?? null;
  const objectiveTarget = goals?.total ?? null;

  // If nothing is available from Supabase schema, return null and let UI fallback.
  if (
    modulesDone == null &&
    flashcardsCreated == null &&
    streak == null &&
    objectiveCurrent == null &&
    objectiveTarget == null
  ) {
    return null;
  }

  return {
    modulesDone: modulesDone ?? 0,
    flashcardsCreated: flashcardsCreated ?? 0,
    streak: streak ?? 0,
    objectiveCurrent: objectiveCurrent ?? 0,
    objectiveTarget: objectiveTarget ?? 0,
    source: "supabase",
  };
}

