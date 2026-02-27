import { deadlinesMock, goalsMock, libraryItemsMock, projectsMock } from "./mock";
import { CoachTip, Deadline, Goal, GoalsFilter, LibraryItem, Project } from "./types";

let goalsDb: Goal[] = [...goalsMock];
let deadlinesDb: Deadline[] = [...deadlinesMock];
let projectsDb: Project[] = [...projectsMock];
let libraryDb: LibraryItem[] = [...libraryItemsMock];

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

export async function listGoals(filter: GoalsFilter = "today"): Promise<Goal[]> {
  const now = new Date();
  if (filter === "done") return sortGoals(goalsDb.filter((g) => g.status === "done"));

  if (filter === "today") {
    const today = startOfDay(now);
    return sortGoals(
      goalsDb.filter((g) => {
        if (g.status === "done") return false;
        if (!g.dueAt) return true;
        return startOfDay(new Date(g.dueAt)).getTime() <= today.getTime();
      })
    );
  }

  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return sortGoals(
    goalsDb.filter((g) => {
      if (g.status === "done") return false;
      if (!g.dueAt) return true;
      const due = new Date(g.dueAt);
      return due <= in7days;
    })
  );
}

export async function createGoal(input: Omit<Goal, "id" | "createdAt" | "status"> & { status?: Goal["status"] }) {
  const goal: Goal = {
    id: uid("goal"),
    createdAt: new Date().toISOString(),
    status: input.status ?? "todo",
    ...input,
  };
  goalsDb = [goal, ...goalsDb];
  if (goal.projectId) {
    projectsDb = projectsDb.map((p) => (p.id === goal.projectId ? { ...p, goalIds: Array.from(new Set([...p.goalIds, goal.id])) } : p));
  }
  return goal;
}

export async function updateGoal(id: string, patch: Partial<Goal>) {
  goalsDb = goalsDb.map((g) => (g.id === id ? { ...g, ...patch } : g));
  return goalsDb.find((g) => g.id === id) ?? null;
}

export async function completeGoal(id: string) {
  return updateGoal(id, { status: "done" });
}

export async function postponeGoal(id: string) {
  const goal = goalsDb.find((g) => g.id === id);
  if (!goal) return null;
  const base = goal.dueAt ? new Date(goal.dueAt) : new Date();
  base.setDate(base.getDate() + 1);
  return updateGoal(id, { dueAt: base.toISOString(), status: "todo" });
}

export async function prioritizeGoal(id: string) {
  return updateGoal(id, { priority: "high" });
}

export async function listDeadlines() {
  return [...deadlinesDb].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function createDeadline(input: Omit<Deadline, "id">) {
  const deadline: Deadline = { id: uid("deadline"), ...input };
  deadlinesDb = [deadline, ...deadlinesDb];
  return deadline;
}

export async function listProjects() {
  return [...projectsDb].sort((a, b) => b.progress - a.progress);
}

export async function createProject(input: Omit<Project, "id" | "goalIds" | "deadlineIds" | "libraryItemIds" | "progress">) {
  const project: Project = {
    id: uid("project"),
    goalIds: [],
    deadlineIds: [],
    libraryItemIds: [],
    progress: 0,
    ...input,
  };
  projectsDb = [project, ...projectsDb];
  return project;
}

export async function getProject(id: string) {
  return projectsDb.find((p) => p.id === id) ?? null;
}

export async function listLibraryItems() {
  return [...libraryDb].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function searchLibraryItems(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listLibraryItems();
  return (await listLibraryItems()).filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      (item.subtitle ?? "").toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
  );
}

export async function getCoachTips(context?: { goals?: Goal[]; deadlines?: Deadline[]; recentActivityHours?: number }): Promise<CoachTip[]> {
  const goals = context?.goals ?? goalsDb;
  const deadlines = context?.deadlines ?? deadlinesDb;
  const lateGoals = goals.filter((g) => g.status !== "done" && g.dueAt && daysUntil(g.dueAt) < 0);
  const urgentDeadlines = deadlines.filter((d) => daysUntil(d.date) <= 7);
  const lowActivity = (context?.recentActivityHours ?? 24) > 18;

  const tips: CoachTip[] = [];

  if (lateGoals.length > 0) {
    tips.push({
      id: "tip-late",
      title: "Objectifs en retard",
      message: `Tu as ${lateGoals.length} objectifs en retard. Lance une session de 25 min maintenant.`,
      actions: [
        { label: "Session 25 min", action: "start_pomodoro" },
        { label: "Voir objectifs", action: "open_goals" },
      ],
    });
  }

  if (urgentDeadlines.length > 0) {
    tips.push({
      id: "tip-deadline",
      title: "Deadlines proches",
      message: `${urgentDeadlines.length} deadline(s) dans les 7 jours. Planifie 2 objectifs de revision.`,
      actions: [
        { label: "Planifier", action: "plan_goals" },
        { label: "Voir deadlines", action: "open_deadlines" },
      ],
    });
  }

  if (lowActivity) {
    tips.push({
      id: "tip-activity",
      title: "Relance douce",
      message: "Peu d'activite recente. Fais une session breve pour garder ton rythme.",
      actions: [
        { label: "Demarrer", action: "start_pomodoro" },
        { label: "Reviser un module", action: "review_module" },
      ],
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: "tip-good",
      title: "Bon rythme",
      message: "Tu es dans le bon tempo cette semaine. Continue avec une session de consolidation.",
      actions: [{ label: "Planifier 1 objectif", action: "plan_goals" }],
    });
  }

  return tips;
}

export async function autoGoalsFromDeadline(deadlineId: string) {
  const deadline = deadlinesDb.find((d) => d.id === deadlineId);
  if (!deadline) return [] as Goal[];

  const templates = [
    `Revoir cours - ${deadline.subject}`,
    `Faire 10 QCM - ${deadline.subject}`,
    `Creer 1 fiche synthese - ${deadline.subject}`,
  ];

  const created: Goal[] = [];
  for (const [idx, title] of templates.entries()) {
    const goal = await createGoal({
      title,
      subject: deadline.subject,
      durationMin: idx === 1 ? 25 : 45,
      priority: deadline.importance === "high" ? "high" : "med",
      dueAt: deadline.date,
      projectId: undefined,
    });
    created.push(goal);
  }
  return created;
}
