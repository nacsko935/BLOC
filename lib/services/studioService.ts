import { getDb } from "../../src/core/data/db";

export type StudioWorkType =
  | "resume"
  | "rapport"
  | "fiche"
  | "qcm"
  | "carte_mentale"
  | "infographie"
  | "tableau"
  | "resume_audio"
  | "resume_video";

export type StudioWork = {
  id: string;
  courseId: string;
  userId?: string | null;
  type: StudioWorkType;
  title: string;
  content: string;
  sourceText?: string | null;
  score?: number | null;
  totalQuestions?: number | null;
  createdAt: string;
};

export async function saveStudioWork(work: Omit<StudioWork, "id" | "createdAt">): Promise<string> {
  const db = await getDb();
  const id = `sw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO studio_works (id, course_id, user_id, type, title, content, source_text, score, total_questions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, work.courseId, work.userId ?? null, work.type, work.title, work.content,
     work.sourceText ?? null, work.score ?? null, work.totalQuestions ?? null, now]
  );
  // Update course stats
  await updateCourseWorkCount(work.courseId);
  return id;
}

export async function getStudioWorks(courseId: string): Promise<StudioWork[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM studio_works WHERE course_id = ? ORDER BY created_at DESC`,
    [courseId]
  );
  return rows.map(r => ({
    id: r.id,
    courseId: r.course_id,
    userId: r.user_id,
    type: r.type as StudioWorkType,
    title: r.title,
    content: r.content,
    sourceText: r.source_text,
    score: r.score,
    totalQuestions: r.total_questions,
    createdAt: r.created_at,
  }));
}

export async function deleteStudioWork(id: string, courseId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM studio_works WHERE id = ?`, [id]);
  await updateCourseWorkCount(courseId);
}

async function updateCourseWorkCount(courseId: string): Promise<void> {
  const db = await getDb();
  const qcmCount = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM studio_works WHERE course_id = ? AND type = 'qcm'`, [courseId]
  );
  const noteCount = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM studio_works WHERE course_id = ? AND type != 'qcm'`, [courseId]
  );
  await db.runAsync(
    `UPDATE courses SET notes_count = ?, qcm_count = ?, last_activity = ? WHERE id = ?`,
    [noteCount?.count ?? 0, qcmCount?.count ?? 0, "à l'instant", courseId]
  );
}
