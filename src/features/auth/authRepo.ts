import { getDb } from "../../core/data/db";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  handle: string;
  bio: string | null;
  campus: string | null;
  level: number;
  avatar: string | null;
  accountType: 'student' | 'professor' | 'school';
  schoolName?: string | null;
  schoolCode?: string | null;
};

export type SchoolInfo = {
  code: string;
  name: string;
};

export type ProfFollow = {
  name: string;
  handle: string;
};

type SessionUserRow = {
  id: string;
  name: string;
  email: string | null;
  handle: string;
  bio: string | null;
  campus: string | null;
  level: number | null;
  avatar: string | null;
  account_type: "student" | "professor" | "school" | null;
  school_name: string | null;
  school_code: string | null;
};

type IdRow = { id: string };

const mapUser = (r: any): UserProfile => ({
  id: r.id,
  name: r.name,
  email: r.email || `${r.handle}@bloc.app`,
  handle: r.handle,
  bio: r.bio ?? null,
  campus: r.campus ?? null,
  level: r.level ?? 1,
  avatar: r.avatar ?? null,
  accountType: r.account_type || 'student',
});

export async function getSessionUser(): Promise<UserProfile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SessionUserRow>(
    `SELECT u.*, us.school_code, sc.name AS school_name
     FROM session s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN user_schools us ON us.user_id = u.id
     LEFT JOIN schools sc ON sc.code = us.school_code
     WHERE s.id = 1
     LIMIT 1`
  );
  if (!row) return null;
  const base = mapUser(row);
  return {
    ...base,
    schoolName: row.school_name ?? null,
    schoolCode: row.school_code ?? null,
  };
}

// Sign up - créer un nouveau compte
export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  accountType: 'student' | 'professor' | 'school';
  schoolName?: string;
}): Promise<void> {
  const db = await getDb();
  const now = Date.now();

  // Vérifier si l'email existe déjà
  const existing = await db.getFirstAsync<IdRow>(
    `SELECT id FROM users WHERE email = ?`,
    [data.email]
  );

  if (existing) {
    throw new Error("Un compte existe déjà avec cet email");
  }

  const id = `${now}-${Math.random().toString(16).slice(2)}`;
  const handle = `@${data.email.split('@')[0]}`;

  try {
    await db.runAsync(
      `INSERT INTO users (id, name, email, handle, password, bio, campus, level, avatar, account_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.email,
        handle,
        data.password, // En production, utiliser bcrypt
        data.accountType === 'school' ? `Établissement ${data.schoolName || ''}` : "Productivité & notes",
        data.accountType === 'school' ? data.schoolName || 'Campus' : 'Campus',
        1,
        null,
        data.accountType,
        now,
        now
      ]
    );
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error("Impossible de créer le compte");
  }
}

// Sign in - se connecter avec email et password
export async function signIn(email: string, password: string): Promise<UserProfile | null> {
  const db = await getDb();
  const now = Date.now();

  const user = await db.getFirstAsync<SessionUserRow>(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password]
  );

  if (!user) {
    return null;
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO session (id, user_id, created_at, updated_at) VALUES (1, ?, ?, ?)`,
    [user.id, now, now]
  );

  return mapUser(user);
}

export async function signOut() {
  const db = await getDb();
  await db.runAsync(`DELETE FROM session WHERE id = 1`);
}

const SCHOOL_MAP: Record<string, string> = {
  ESGI: "ESGI",
  EPITA: "EPITA",
  ECE: "ECE",
  ESIEA: "ESIEA",
  SORBONNE: "Sorbonne Université",
};

export async function joinSchool(code: string): Promise<SchoolInfo | null> {
  const db = await getDb();
  const user = await getSessionUser();
  if (!user) return null;
  const now = Date.now();
  const clean = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!clean) return null;
  const name = SCHOOL_MAP[clean] ?? `École ${clean}`;

  await db.runAsync(
    `INSERT OR IGNORE INTO schools (code, name, created_at) VALUES (?, ?, ?)`,
    [clean, name, now]
  );
  await db.runAsync(
    `INSERT OR REPLACE INTO user_schools (user_id, school_code, created_at) VALUES (?, ?, ?)`,
    [user.id, clean, now]
  );
  return { code: clean, name };
}

export async function getUserSchool(): Promise<SchoolInfo | null> {
  const user = await getSessionUser();
  if (!user?.schoolCode || !user.schoolName) return null;
  return { code: user.schoolCode, name: user.schoolName };
}

export async function listFollowedProfessors(): Promise<ProfFollow[]> {
  const db = await getDb();
  const user = await getSessionUser();
  if (!user) return [];
  const rows = await db.getAllAsync(
    `SELECT prof_name, prof_handle FROM prof_follows WHERE user_id = ? ORDER BY created_at DESC`,
    [user.id]
  );
  return rows.map((r: any) => ({ name: r.prof_name, handle: r.prof_handle }));
}

export async function followProfessor(name: string, handle: string) {
  const db = await getDb();
  const user = await getSessionUser();
  if (!user) return;
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO prof_follows (user_id, prof_name, prof_handle, created_at) VALUES (?, ?, ?, ?)`,
    [user.id, name.trim() || "Professeur", handle.trim() || "@prof", now]
  );
}

export async function updateProfile(
  patch: Partial<Pick<UserProfile, "name" | "handle" | "bio" | "campus" | "level" | "avatar">>
) {
  const db = await getDb();
  const current = await getSessionUser();
  if (!current) return;
  const now = Date.now();

  await db.runAsync(
    `UPDATE users SET name = ?, handle = ?, bio = ?, campus = ?, level = ?, avatar = ?, updated_at = ? WHERE id = ?`,
    [
      patch.name ?? current.name,
      patch.handle ?? current.handle,
      patch.bio ?? current.bio,
      patch.campus ?? current.campus,
      patch.level ?? current.level,
      patch.avatar ?? current.avatar,
      now,
      current.id,
    ]
  );
}
