import { getDb } from "../../core/data/db";
import type { Course, CourseNote, CourseQCM, CourseDeadline } from "./coursesData";

// ============= COURSES =============

export async function getAllCourses(): Promise<Course[]> {
  const db = await getDb();
  const result = await db.getAllAsync<any>(
    `SELECT * FROM courses ORDER BY semester, name`
  );
  
  return result.map(row => ({
    id: row.id,
    name: row.name,
    semester: row.semester as 'S1' | 'S2',
    professor: {
      name: row.professor_name,
      handle: row.professor_handle,
    },
    color: row.color,
    icon: row.icon,
    stats: {
      notesCount: row.notes_count || 0,
      qcmCount: row.qcm_count || 0,
      progress: row.progress || 0,
      lastActivity: row.last_activity || '',
    },
  }));
}

export async function getCourseById(id: string): Promise<Course | null> {
  const db = await getDb();
  const result = await db.getFirstAsync<any>(
    `SELECT * FROM courses WHERE id = ?`,
    [id]
  );
  
  if (!result) return null;
  
  return {
    id: result.id,
    name: result.name,
    semester: result.semester as 'S1' | 'S2',
    professor: {
      name: result.professor_name,
      handle: result.professor_handle,
    },
    color: result.color,
    icon: result.icon,
    stats: {
      notesCount: result.notes_count || 0,
      qcmCount: result.qcm_count || 0,
      progress: result.progress || 0,
      lastActivity: result.last_activity || '',
    },
  };
}

export async function createCourse(course: {
  name: string;
  semester: 'S1' | 'S2';
  professorName: string;
  professorHandle: string;
  color: string;
  icon: string;
}): Promise<string> {
  const db = await getDb();
  const id = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.runAsync(
    `INSERT INTO courses (
      id, name, semester, professor_name, professor_handle, 
      color, icon, notes_count, qcm_count, progress, last_activity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?)`,
    [
      id,
      course.name,
      course.semester,
      course.professorName,
      course.professorHandle,
      course.color,
      course.icon,
      'à l\'instant',
    ]
  );
  
  return id;
}

export async function updateCourse(
  id: string,
  updates: Partial<{
    name: string;
    semester: 'S1' | 'S2';
    professorName: string;
    professorHandle: string;
    color: string;
    icon: string;
  }>
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.semester) {
    fields.push('semester = ?');
    values.push(updates.semester);
  }
  if (updates.professorName) {
    fields.push('professor_name = ?');
    values.push(updates.professorName);
  }
  if (updates.professorHandle) {
    fields.push('professor_handle = ?');
    values.push(updates.professorHandle);
  }
  if (updates.color) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.icon) {
    fields.push('icon = ?');
    values.push(updates.icon);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  
  await db.runAsync(
    `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteCourse(id: string): Promise<void> {
  const db = await getDb();
  // Delete related data first
  await db.runAsync(`DELETE FROM course_notes WHERE course_id = ?`, [id]);
  await db.runAsync(`DELETE FROM course_qcms WHERE course_id = ?`, [id]);
  await db.runAsync(`DELETE FROM course_deadlines WHERE course_id = ?`, [id]);
  
  // Delete the course
  await db.runAsync(`DELETE FROM courses WHERE id = ?`, [id]);
}

// Update course stats
export async function updateCourseStats(courseId: string): Promise<void> {
  const db = await getDb();
  const notesCount = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM course_notes WHERE course_id = ?`,
    [courseId]
  );
  
  const qcmCount = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM course_qcms WHERE course_id = ?`,
    [courseId]
  );
  
  await db.runAsync(
    `UPDATE courses 
     SET notes_count = ?, qcm_count = ?, last_activity = ? 
     WHERE id = ?`,
    [notesCount?.count || 0, qcmCount?.count || 0, 'à l\'instant', courseId]
  );
}

// ============= COURSE NOTES =============

export async function getCourseNotes(courseId: string): Promise<CourseNote[]> {
  const db = await getDb();
  const result = await db.getAllAsync<any>(
    `SELECT * FROM course_notes WHERE course_id = ? ORDER BY updated_at DESC`,
    [courseId]
  );
  
  return result.map(row => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    type: row.type as CourseNote['type'],
    size: row.size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: row.tags ? JSON.parse(row.tags) : [],
  }));
}

export async function createCourseNote(note: {
  courseId: string;
  title: string;
  type: CourseNote['type'];
  size?: string;
  tags?: string[];
}): Promise<string> {
  const db = await getDb();
  const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO course_notes (
      id, course_id, title, type, size, tags, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      note.courseId,
      note.title,
      note.type,
      note.size || null,
      JSON.stringify(note.tags || []),
      now,
      now,
    ]
  );
  
  await updateCourseStats(note.courseId);
  
  return id;
}

// ============= COURSE QCMS =============

export async function getCourseQCMs(courseId: string): Promise<CourseQCM[]> {
  const db = await getDb();
  const result = await db.getAllAsync<any>(
    `SELECT * FROM course_qcms WHERE course_id = ? ORDER BY created_at DESC`,
    [courseId]
  );
  
  return result.map(row => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    questionsCount: row.questions_count,
    duration: row.duration,
    lastScore: row.last_score,
    bestScore: row.best_score,
    attempts: row.attempts,
    createdAt: row.created_at,
  }));
}

// ============= COURSE DEADLINES =============

export async function getCourseDeadlines(courseId: string): Promise<CourseDeadline[]> {
  const db = await getDb();
  const result = await db.getAllAsync<any>(
    `SELECT * FROM course_deadlines WHERE course_id = ? ORDER BY date ASC`,
    [courseId]
  );
  
  return result.map(row => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    type: row.type as CourseDeadline['type'],
    date: row.date,
    description: row.description,
    completed: row.completed === 1,
  }));
}
