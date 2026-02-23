import { getDb } from "./db";

export async function migrate() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      due_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      handle TEXT NOT NULL UNIQUE,
      password TEXT,
      bio TEXT,
      campus TEXT,
      level INTEGER NOT NULL DEFAULT 1,
      avatar TEXT,
      account_type TEXT DEFAULT 'student',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schools (
      code TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_schools (
      user_id TEXT NOT NULL,
      school_code TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (school_code) REFERENCES schools(code)
    );

    CREATE TABLE IF NOT EXISTS prof_follows (
      user_id TEXT NOT NULL,
      prof_name TEXT NOT NULL,
      prof_handle TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_interactions (
      post_id TEXT PRIMARY KEY NOT NULL,
      liked INTEGER NOT NULL DEFAULT 0,
      saved INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY NOT NULL,
      post_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_meta (
      post_id TEXT PRIMARY KEY NOT NULL,
      likes_count INTEGER NOT NULL DEFAULT 0,
      saves_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      semester TEXT NOT NULL,
      professor_name TEXT NOT NULL,
      professor_handle TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      notes_count INTEGER NOT NULL DEFAULT 0,
      qcm_count INTEGER NOT NULL DEFAULT 0,
      progress INTEGER NOT NULL DEFAULT 0,
      last_activity TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS course_notes (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_qcms (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      questions_count INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      last_score INTEGER,
      best_score INTEGER,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_deadlines (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tasks_updated ON tasks(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
    CREATE INDEX IF NOT EXISTS idx_user_schools_user ON user_schools(user_id);
    CREATE INDEX IF NOT EXISTS idx_prof_follows_user ON prof_follows(user_id);
    CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_meta_post ON post_meta(post_id);
    CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
    CREATE INDEX IF NOT EXISTS idx_course_notes_course ON course_notes(course_id);
    CREATE INDEX IF NOT EXISTS idx_course_qcms_course ON course_qcms(course_id);
    CREATE INDEX IF NOT EXISTS idx_course_deadlines_course ON course_deadlines(course_id);
  `);
  
  // Add columns if they don't exist (for existing databases)
  try {
    await db.execAsync(`ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'student';`);
    console.log('✓ Column account_type added');
  } catch (error) {
    console.log('✓ Column account_type already exists');
  }
  
  try {
    await db.execAsync(`ALTER TABLE users ADD COLUMN email TEXT;`);
    console.log('✓ Column email added');
  } catch (error) {
    console.log('✓ Column email already exists');
  }
  
  try {
    await db.execAsync(`ALTER TABLE users ADD COLUMN password TEXT;`);
    console.log('✓ Column password added');
  } catch (error) {
    console.log('✓ Column password already exists');
  }
}
