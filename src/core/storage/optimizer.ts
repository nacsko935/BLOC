import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDb } from "../data/db";

const LAST_RUN_KEY = "bloc:storage_opt_last_run";
const AUTO_RUN_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

type OptimizeReport = {
  deletedOldComments: number;
  deletedOrphanMeta: number;
  ranVacuum: boolean;
  ranAnalyze: boolean;
  skipped: boolean;
  reason?: string;
};

function getChanges(result: unknown): number {
  if (!result || typeof result !== "object") return 0;
  const maybe = result as { changes?: number };
  return typeof maybe.changes === "number" ? maybe.changes : 0;
}

export async function optimizeLocalStorage(options?: { force?: boolean }): Promise<OptimizeReport> {
  const force = options?.force ?? false;
  const lastRunRaw = await AsyncStorage.getItem(LAST_RUN_KEY);
  const lastRun = Number(lastRunRaw || "0");
  const now = Date.now();

  if (!force && Number.isFinite(lastRun) && now - lastRun < AUTO_RUN_INTERVAL_MS) {
    return {
      deletedOldComments: 0,
      deletedOrphanMeta: 0,
      ranVacuum: false,
      ranAnalyze: false,
      skipped: true,
      reason: "interval_not_elapsed",
    };
  }

  const db = await getDb();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

  const deleteOldCommentsResult = await db.runAsync(
    `DELETE FROM post_comments WHERE created_at < ?`,
    [ninetyDaysAgo]
  );

  const deleteOrphanMetaResult = await db.runAsync(`
    DELETE FROM post_meta
    WHERE comments_count <= 0
      AND likes_count <= 0
      AND saves_count <= 0
      AND post_id NOT IN (SELECT DISTINCT post_id FROM post_comments)
  `);

  await db.execAsync(`PRAGMA wal_checkpoint(TRUNCATE);`);
  await db.execAsync(`VACUUM;`);
  await db.execAsync(`ANALYZE;`);

  await AsyncStorage.setItem(LAST_RUN_KEY, String(now));

  return {
    deletedOldComments: getChanges(deleteOldCommentsResult),
    deletedOrphanMeta: getChanges(deleteOrphanMetaResult),
    ranVacuum: true,
    ranAnalyze: true,
    skipped: false,
  };
}

