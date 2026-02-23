import { getDb } from "../../core/data/db";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

const mapNote = (r: any): Note => ({
  id: r.id,
  title: r.title,
  content: r.content,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function listNotes(limit = 50): Promise<Note[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM notes ORDER BY updated_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map(mapNote);
}

export async function getNote(id: string): Promise<Note | null> {
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT * FROM notes WHERE id = ?`, [id]);
  return row ? mapNote(row) : null;
}

export async function createNote(title: string, content = ""): Promise<string> {
  const db = await getDb();
  const now = Date.now();
  const id = `${now}-${Math.random().toString(16).slice(2)}`;

  await db.runAsync(
    `INSERT INTO notes (id, title, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, title.trim() || "Sans titre", content, now, now]
  );

  return id;
}

export async function updateNote(
  id: string,
  patch: Partial<Pick<Note, "title" | "content">>
) {
  const db = await getDb();
  const now = Date.now();

  const current = await getNote(id);
  if (!current) return;

  await db.runAsync(
    `UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?`,
    [patch.title ?? current.title, patch.content ?? current.content, now, id]
  );
}

export async function deleteNote(id: string) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}
