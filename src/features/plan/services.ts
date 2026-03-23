import AsyncStorage from "@react-native-async-storage/async-storage";
import { deadlinesMock, goalsMock, libraryItemsMock } from "./mock";
import { CoachTip, Deadline, Goal, GoalsFilter, LibraryItem, Project } from "./types";

// ── Clés AsyncStorage par userId ─────────────────────────────────────────────
// Chaque utilisateur a ses propres données, jamais mélangées

let _currentUserId: string | null = null;

export function setPlanUserId(uid: string | null) {
  _currentUserId = uid;
}

function key(suffix: string) {
  const uid = _currentUserId ?? "anonymous";
  return `bloc_plan_${uid}_${suffix}`;
}

// ── Helpers stockage ─────────────────────────────────────────────────────────

async function loadList<T>(k: string, fallback: T[]): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch { return fallback; }
}

async function saveList<T>(k: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(k, JSON.stringify(data));
}

// ── Mémoire locale (cache session) ──────────────────────────────────────────
// Rechargé depuis AsyncStorage à chaque changement d'utilisateur

let goalsCache: Goal[] | null = null;
let deadlinesCache: Deadline[] | null = null;
let projectsCache: Project[] | null = null;
let libraryCache: LibraryItem[] | null = null;

export function clearPlanCache() {
  goalsCache = null;
  deadlinesCache = null;
  projectsCache = null;
  libraryCache = null;
}

// ── Goals ───────────────────────────────────────────────────────────────────

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function daysUntil(dateIso: string) {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(dateIso));
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function sortGoals(items: Goal[]) {
  const priorityWeight: Record<Goal["priority"], number> = { high: 3, med: 2, low: 1 };
  return [...items].sort((a, b) => {
    const da = a.dueAt ? daysUntil(a.dueAt) : 999;
    const db = b.dueAt ? daysUntil(b.dueAt) : 999;
    if (da !== db) return da - db;
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
}

async function getGoalsDb(): Promise<Goal[]> {
  if (goalsCache) return goalsCache;
  // Pas de mock par défaut — chaque user commence avec 0 goals
  goalsCache = await loadList<Goal>(key("goals"), []);
  return goalsCache;
}

async function setGoalsDb(goals: Goal[]) {
  goalsCache = goals;
  await saveList(key("goals"), goals);
}

export async function listGoals(filter: GoalsFilter = "today"): Promise<Goal[]> {
  const db = await getGoalsDb();
  const now = new Date();

  if (filter === "done") return sortGoals(db.filter(g => g.status === "done"));

  if (filter === "today") {
    const today = startOfDay(now);
    return sortGoals(db.filter(g => {
      if (g.status === "done") return false;
      if (!g.dueAt) return true;
      return startOfDay(new Date(g.dueAt)).getTime() <= today.getTime();
    }));
  }

  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return sortGoals(db.filter(g => {
    if (g.status === "done") return false;
    if (!g.dueAt) return true;
    return new Date(g.dueAt) <= in7days;
  }));
}

export async function createGoal(input: Omit<Goal, "id" | "createdAt" | "status"> & { status?: Goal["status"] }) {
  const db = await getGoalsDb();
  const goal: Goal = { id: uid("goal"), createdAt: new Date().toISOString(), status: input.status ?? "todo", ...input };
  const updated = [goal, ...db];
  await setGoalsDb(updated);

  // Lier au projet si projectId
  if (goal.projectId) {
    const projects = await getProjectsDb();
    await setProjectsDb(projects.map(p =>
      p.id === goal.projectId ? { ...p, goalIds: Array.from(new Set([...p.goalIds, goal.id])) } : p
    ));
  }
  return goal;
}

export async function updateGoal(id: string, patch: Partial<Goal>) {
  const db = await getGoalsDb();
  const updated = db.map(g => g.id === id ? { ...g, ...patch } : g);
  await setGoalsDb(updated);
  return updated.find(g => g.id === id) ?? null;
}

export async function completeGoal(id: string) {
  return updateGoal(id, { status: "done" });
}

export async function postponeGoal(id: string) {
  const db = await getGoalsDb();
  const goal = db.find(g => g.id === id);
  if (!goal) return null;
  const base = goal.dueAt ? new Date(goal.dueAt) : new Date();
  base.setDate(base.getDate() + 1);
  return updateGoal(id, { dueAt: base.toISOString(), status: "todo" });
}

export async function prioritizeGoal(id: string) {
  return updateGoal(id, { priority: "high" });
}

// ── Deadlines ────────────────────────────────────────────────────────────────

async function getDeadlinesDb(): Promise<Deadline[]> {
  if (deadlinesCache) return deadlinesCache;
  deadlinesCache = await loadList<Deadline>(key("deadlines"), []);
  return deadlinesCache;
}

async function setDeadlinesDb(deadlines: Deadline[]) {
  deadlinesCache = deadlines;
  await saveList(key("deadlines"), deadlines);
}

export async function listDeadlines() {
  const db = await getDeadlinesDb();
  return [...db].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function createDeadline(input: Omit<Deadline, "id">) {
  const db = await getDeadlinesDb();
  const deadline: Deadline = { id: uid("deadline"), ...input };
  await setDeadlinesDb([deadline, ...db]);
  return deadline;
}

// ── Projects ─────────────────────────────────────────────────────────────────

async function getProjectsDb(): Promise<Project[]> {
  if (projectsCache) return projectsCache;
  // Aucun projet par défaut — chaque user commence vide
  projectsCache = await loadList<Project>(key("projects"), []);
  return projectsCache;
}

async function setProjectsDb(projects: Project[]) {
  projectsCache = projects;
  await saveList(key("projects"), projects);
}

export async function listProjects() {
  const db = await getProjectsDb();
  return [...db].sort((a, b) => b.progress - a.progress);
}

export async function createProject(input: Omit<Project, "id" | "goalIds" | "deadlineIds" | "libraryItemIds" | "progress">) {
  const db = await getProjectsDb();
  const project: Project = { id: uid("project"), goalIds: [], deadlineIds: [], libraryItemIds: [], progress: 0, ...input };
  await setProjectsDb([project, ...db]);
  return project;
}

export async function getProject(id: string) {
  const db = await getProjectsDb();
  return db.find(p => p.id === id) ?? null;
}

// ── Library ──────────────────────────────────────────────────────────────────

async function getLibraryDb(): Promise<LibraryItem[]> {
  if (libraryCache) return libraryCache;
  libraryCache = await loadList<LibraryItem>(key("library"), [...libraryItemsMock]);
  return libraryCache;
}

export async function listLibraryItems() {
  const db = await getLibraryDb();
  return [...db].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function searchLibraryItems(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listLibraryItems();
  return (await listLibraryItems()).filter(item =>
    item.title.toLowerCase().includes(q) ||
    (item.subtitle ?? "").toLowerCase().includes(q) ||
    item.subject.toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q)
  );
}

// ── Coach ────────────────────────────────────────────────────────────────────

export async function getCoachTips(context?: { goals?: Goal[]; deadlines?: Deadline[]; recentActivityHours?: number }): Promise<CoachTip[]> {
  const goals = context?.goals ?? await getGoalsDb();
  const deadlines = context?.deadlines ?? await getDeadlinesDb();
  const lateGoals = goals.filter(g => g.status !== "done" && g.dueAt && daysUntil(g.dueAt) < 0);
  const urgentDeadlines = deadlines.filter(d => daysUntil(d.date) <= 7);
  const lowActivity = (context?.recentActivityHours ?? 24) > 18;

  const tips: CoachTip[] = [];

  if (lateGoals.length > 0) {
    tips.push({ id: "tip-late", title: "Objectifs en retard",
      message: `Tu as ${lateGoals.length} objectifs en retard. Lance une session de 25 min maintenant.`,
      actions: [{ label: "Session 25 min", action: "start_pomodoro" }, { label: "Voir objectifs", action: "open_goals" }] });
  }
  if (urgentDeadlines.length > 0) {
    tips.push({ id: "tip-deadline", title: "Deadlines proches",
      message: `${urgentDeadlines.length} deadline(s) dans les 7 jours. Planifie 2 objectifs de révision.`,
      actions: [{ label: "Planifier", action: "plan_goals" }, { label: "Voir deadlines", action: "open_deadlines" }] });
  }
  if (lowActivity) {
    tips.push({ id: "tip-activity", title: "Relance douce",
      message: "Peu d'activité récente. Fais une session brève pour garder ton rythme.",
      actions: [{ label: "Démarrer", action: "start_pomodoro" }, { label: "Réviser un module", action: "review_module" }] });
  }
  if (tips.length === 0) {
    tips.push({ id: "tip-good", title: "Bon rythme",
      message: "Tu es dans le bon tempo cette semaine. Continue avec une session de consolidation.",
      actions: [{ label: "Planifier 1 objectif", action: "plan_goals" }] });
  }
  return tips;
}

export async function autoGoalsFromDeadline(deadlineId: string) {
  const db = await getDeadlinesDb();
  const deadline = db.find(d => d.id === deadlineId);
  if (!deadline) return [] as Goal[];

  const templates = [
    `Revoir cours - ${deadline.subject}`,
    `Faire 10 QCM - ${deadline.subject}`,
    `Créer 1 fiche synthèse - ${deadline.subject}`,
  ];

  const created: Goal[] = [];
  for (const [idx, title] of templates.entries()) {
    const goal = await createGoal({
      title, subject: deadline.subject,
      durationMin: idx === 1 ? 25 : 45,
      priority: deadline.importance === "high" ? "high" : "med",
      dueAt: deadline.date,
    });
    created.push(goal);
  }
  return created;
}
