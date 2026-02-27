import { getDb } from "../../core/data/db";
import { mockCourses, mockCourseNotes, mockCourseQCMs, mockCourseDeadlines } from "./coursesData";

export async function seedMockCourses(): Promise<void> {
  const db = await getDb();
  
  try {
    // Check if courses already exist
    const existing = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM courses`
    );
    
    if (existing && existing.count > 0) return;
    
    // Insert courses
    for (const course of mockCourses) {
      await db.runAsync(
        `INSERT INTO courses (
          id, name, semester, professor_name, professor_handle, 
          color, icon, notes_count, qcm_count, progress, last_activity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course.id,
          course.name,
          course.semester,
          course.professor.name,
          course.professor.handle,
          course.color,
          course.icon,
          course.stats.notesCount,
          course.stats.qcmCount,
          course.stats.progress,
          course.stats.lastActivity,
        ]
      );
    }
    
    // Insert notes
    for (const note of mockCourseNotes) {
      await db.runAsync(
        `INSERT INTO course_notes (
          id, course_id, title, type, size, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.courseId,
          note.title,
          note.type,
          note.size || null,
          JSON.stringify(note.tags),
          note.createdAt,
          note.updatedAt,
        ]
      );
    }
    
    // Insert QCMs
    for (const qcm of mockCourseQCMs) {
      await db.runAsync(
        `INSERT INTO course_qcms (
          id, course_id, title, questions_count, duration,
          last_score, best_score, attempts, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          qcm.id,
          qcm.courseId,
          qcm.title,
          qcm.questionsCount,
          qcm.duration,
          qcm.lastScore || null,
          qcm.bestScore || null,
          qcm.attempts,
          qcm.createdAt,
        ]
      );
    }
    
    // Insert deadlines
    for (const deadline of mockCourseDeadlines) {
      await db.runAsync(
        `INSERT INTO course_deadlines (
          id, course_id, title, type, date, description, completed
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          deadline.id,
          deadline.courseId,
          deadline.title,
          deadline.type,
          deadline.date,
          deadline.description || null,
          deadline.completed ? 1 : 0,
        ]
      );
    }
    
  } catch (error) {
    throw error;
  }
}
