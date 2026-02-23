import { getDb } from "./db";

export type SearchResult =
  | { type: "note"; id: string; title: string; snippet: string; updatedAt: number }
  | { type: "task"; id: string; title: string; snippet: string; updatedAt: number };

export async function searchAll(q: string, limit = 30): Promise<SearchResult[]> {
  const db = await getDb();
  const term = q.trim();
  if (!term) return [];

  const query = `%${term}%`;

  const notes = await db.getAllAsync(
    `SELECT id, title, substr(content, 1, 120) AS snippet, updated_at
     FROM notes
     WHERE title LIKE ? OR content LIKE ?
     ORDER BY updated_at DESC
     LIMIT ?`,
    [query, query, limit]
  );

  const tasks = await db.getAllAsync(
    `SELECT id, title, '' AS snippet, updated_at
     FROM tasks
     WHERE title LIKE ?
     ORDER BY updated_at DESC
     LIMIT ?`,
    [query, limit]
  );

  return [
    ...notes.map((r: any) => ({
      type: "note" as const,
      id: r.id,
      title: r.title,
      snippet: r.snippet ?? "",
      updatedAt: r.updated_at,
    })),
    ...tasks.map((r: any) => ({
      type: "task" as const,
      id: r.id,
      title: r.title,
      snippet: "",
      updatedAt: r.updated_at,
    })),
  ]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}
