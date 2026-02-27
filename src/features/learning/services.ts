import {
  badgesMock,
  collectionsMock,
  learningModulesMock,
  learningUserMock,
  lessonsMock,
  progressMock,
  toolPresetsMock,
} from "./mock";
import { Badge, Collection, Lesson, Module, Progress, ToolPreset, User } from "./types";

let progressState: Progress[] = [...progressMock];
let badgesState: Badge[] = [...badgesMock];

export type ListModuleFilters = {
  query?: string;
  level?: Module["level"] | "all";
  certified?: boolean;
  recommended?: boolean;
  popular?: boolean;
  newest?: boolean;
  inProgressOnly?: boolean;
  userId?: string;
};

function scoreModule(module: Module) {
  return module.ratingAvg * module.ratingCount;
}

function computePercent(moduleId: string, completedLessonIds: string[]) {
  const total = lessonsMock.filter((l) => l.moduleId === moduleId).length;
  if (total === 0) return 0;
  return Math.min(100, Math.round((completedLessonIds.length / total) * 100));
}

export async function getLearningUser(userId = "demo-user"): Promise<User> {
  return { ...learningUserMock, id: userId };
}

export async function listToolPresets(): Promise<ToolPreset[]> {
  return toolPresetsMock;
}

export async function listCollections(): Promise<Collection[]> {
  return collectionsMock;
}

export async function listModules(filters: ListModuleFilters = {}): Promise<Module[]> {
  const userId = filters.userId ?? "demo-user";
  let data = [...learningModulesMock];

  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    data = data.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.authorName.toLowerCase().includes(q) ||
        m.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filters.level && filters.level !== "all") {
    data = data.filter((m) => m.level === filters.level);
  }

  if (filters.certified) {
    data = data.filter((m) => m.certified);
  }

  if (filters.inProgressOnly) {
    const inProgressIds = new Set(
      progressState
        .filter((p) => p.userId === userId && p.status === "in_progress")
        .map((p) => p.moduleId)
    );
    data = data.filter((m) => inProgressIds.has(m.id));
  }

  if (filters.recommended) {
    data = [...data].sort((a, b) => scoreModule(b) - scoreModule(a)).slice(0, 8);
  }

  if (filters.popular) {
    data = [...data].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 8);
  }

  if (filters.newest) {
    data = [...data].reverse().slice(0, 10);
  }

  return data;
}

export async function getModule(id: string): Promise<Module | null> {
  return learningModulesMock.find((m) => m.id === id) ?? null;
}

export async function getLessons(moduleId: string): Promise<Lesson[]> {
  return lessonsMock
    .filter((lesson) => lesson.moduleId === moduleId)
    .sort((a, b) => a.order - b.order);
}

export async function getMyProgress(userId = "demo-user"): Promise<Progress[]> {
  return progressState.filter((p) => p.userId === userId);
}

export async function completeLesson(moduleId: string, lessonId: string, userId = "demo-user"): Promise<Progress> {
  const lessons = await getLessons(moduleId);
  const current = progressState.find((p) => p.userId === userId && p.moduleId === moduleId);
  const completed = new Set(current?.completedLessonIds ?? []);
  completed.add(lessonId);
  const completedLessonIds = Array.from(completed);
  const percent = computePercent(moduleId, completedLessonIds);
  const status: Progress["status"] = percent >= 100 ? "done" : "in_progress";

  const nextProgress: Progress = {
    userId,
    moduleId,
    completedLessonIds,
    percent,
    status,
  };

  progressState = progressState.filter((p) => !(p.userId === userId && p.moduleId === moduleId)).concat(nextProgress);
  return nextProgress;
}

export async function finishModule(moduleId: string, userId = "demo-user"): Promise<{
  badgeUnlocked?: Badge;
  xpGained: number;
}> {
  const lessons = await getLessons(moduleId);
  const completedLessonIds = lessons.map((lesson) => lesson.id);
  progressState = progressState
    .filter((p) => !(p.userId === userId && p.moduleId === moduleId))
    .concat({
      userId,
      moduleId,
      completedLessonIds,
      percent: 100,
      status: "done",
    });

  let badgeUnlocked: Badge | undefined;
  const badgeMap: Record<string, string> = {
    "mod-web-basics": "badge-web",
    "mod-ia-starter": "badge-ia",
    "mod-secu-101": "badge-secu",
    "mod-sql-fast": "badge-sql",
  };
  const badgeId = badgeMap[moduleId];
  if (badgeId) {
    const badge = badgesState.find((b) => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      badgeUnlocked = badge;
    }
  }

  return { badgeUnlocked, xpGained: 120 };
}

export async function getBadges(): Promise<Badge[]> {
  return badgesState;
}
