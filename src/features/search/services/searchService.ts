import { getAllCourses } from "../../courses/coursesRepo";
import { listNotes } from "../../notes/notesRepo";
import {
  searchUsers,
  searchPostsPage,
} from "../../../../lib/services/searchService";

export type SearchResultType = "user" | "course" | "post" | "note";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  meta?: string;
  progress?: number;
};

function matchTerm(term: string, ...fields: (string | null | undefined)[]): boolean {
  const q = term.toLowerCase();
  return fields.some(f => f && f.toLowerCase().includes(q));
}

export async function searchAllSources(query: string): Promise<SearchResult[]> {
  const term = query.trim();
  if (!term) return [];

  const [usersResult, coursesResult, postsResult, notesResult] =
    await Promise.allSettled([
      searchUsers(term),
      getAllCourses(),
      searchPostsPage(term, { limit: 10 }),
      listNotes(100),
    ]);

  const results: SearchResult[] = [];

  // Users
  if (usersResult.status === "fulfilled") {
    for (const u of usersResult.value) {
      results.push({
        id: u.id,
        type: "user",
        title: u.display_name ?? u.full_name ?? u.username ?? "Utilisateur",
        subtitle: u.username ? `@${u.username}` : undefined,
        meta: u.filiere ?? undefined,
      });
    }
  }

  // Courses (SQLite — filter client-side)
  if (coursesResult.status === "fulfilled") {
    for (const c of coursesResult.value) {
      if (matchTerm(term, c.name, c.professor?.name)) {
        results.push({
          id: c.id,
          type: "course",
          title: c.name,
          subtitle: c.professor?.name,
          meta: c.semester,
          progress: c.stats?.progress ?? undefined,
        });
      }
    }
  }

  // Posts (Supabase)
  if (postsResult.status === "fulfilled") {
    for (const p of postsResult.value.items) {
      results.push({
        id: p.id,
        type: "post",
        title: p.title ?? "Post sans titre",
        subtitle: p.filiere ?? undefined,
        meta: p.type,
      });
    }
  }

  // Notes (SQLite — filter client-side)
  if (notesResult.status === "fulfilled") {
    for (const n of notesResult.value) {
      if (matchTerm(term, n.title, n.content)) {
        results.push({
          id: n.id,
          type: "note",
          title: n.title,
          subtitle: n.content.slice(0, 60) || undefined,
        });
      }
    }
  }

  return results;
}
