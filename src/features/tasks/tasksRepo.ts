import { getDb } from "../../core/data/db";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  dueAt: number | null;
  createdAt: number;
  updatedAt: number;
};

const mapTask = (r: any): Task => ({
  id: r.id,
  title: r.title,
  done: !!r.done,
  dueAt: r.due_at ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function listTasks(limit = 50): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM tasks ORDER BY updated_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map(mapTask);
}

export async function createTask(title: string, dueAt: number | null = null): Promise<string> {
  const db = await getDb();
  const now = Date.now();
  const id = `${now}-${Math.random().toString(16).slice(2)}`;

  await db.runAsync(
    `INSERT INTO tasks (id, title, done, due_at, created_at, updated_at)
     VALUES (?, ?, 0, ?, ?, ?)`,
    [id, title.trim() || "Sans titre", dueAt, now, now]
  );

  return id;
}

export async function toggleTask(id: string, done: boolean) {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `UPDATE tasks SET done = ?, updated_at = ? WHERE id = ?`,
    [done ? 1 : 0, now, id]
  );
}

export async function deleteTask(id: string) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
}
