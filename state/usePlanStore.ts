import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  autoGoalsFromDeadline,
  completeGoal,
  createDeadline,
  createGoal,
  createProject,
  getCoachTips,
  getProject,
  listDeadlines,
  listGoals,
  listLibraryItems,
  listProjects,
  postponeGoal,
  prioritizeGoal,
  searchLibraryItems,
  updateGoal,
} from "../src/features/plan/services";
import { CoachTip, Deadline, Goal, GoalsFilter, LibraryItem, Project } from "../src/features/plan/types";

const LIB_CACHE_KEY = "bloc_plan_library_cache_v1";

type PlanState = {
  goals: Goal[];
  deadlines: Deadline[];
  projects: Project[];
  libraryItems: LibraryItem[];
  coachTips: CoachTip[];
  loading: boolean;
  initialized: boolean;
  loadAll: () => Promise<void>;
  refreshCoach: () => Promise<void>;
  getGoals: (filter: GoalsFilter) => Goal[];
  addGoal: (input: Omit<Goal, "id" | "createdAt" | "status"> & { status?: Goal["status"] }) => Promise<void>;
  setGoalStatus: (id: string, status: Goal["status"]) => Promise<void>;
  postponeGoalByOneDay: (id: string) => Promise<void>;
  prioritizeGoalHigh: (id: string) => Promise<void>;
  addDeadline: (input: Omit<Deadline, "id">) => Promise<void>;
  addProject: (input: Omit<Project, "id" | "goalIds" | "deadlineIds" | "libraryItemIds" | "progress">) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getProjectDataById: (id: string) => { project?: Project; goals: Goal[]; deadlines: Deadline[]; libraryItems: LibraryItem[] };
  autoCreateGoalsForDeadline: (deadlineId: string) => Promise<number>;
  searchLibrary: (query: string) => Promise<LibraryItem[]>;
};

export const usePlanStore = create<PlanState>((set, get) => ({
  goals: [],
  deadlines: [],
  projects: [],
  libraryItems: [],
  coachTips: [],
  loading: false,
  initialized: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      const [todayGoals, weekGoals, doneGoals, deadlines, projects, tips] = await Promise.all([
        listGoals("today"),
        listGoals("week"),
        listGoals("done"),
        listDeadlines(),
        listProjects(),
        getCoachTips(),
      ]);

      const mergedGoals = Array.from(new Map([...todayGoals, ...weekGoals, ...doneGoals].map((g) => [g.id, g])).values());

      const cachedLibraryRaw = await AsyncStorage.getItem(LIB_CACHE_KEY);
      const cachedLibrary = cachedLibraryRaw ? (JSON.parse(cachedLibraryRaw) as LibraryItem[]) : null;
      const library = cachedLibrary && cachedLibrary.length > 0 ? cachedLibrary : await listLibraryItems();
      await AsyncStorage.setItem(LIB_CACHE_KEY, JSON.stringify(library));

      set({
        goals: mergedGoals,
        deadlines,
        projects,
        libraryItems: library,
        coachTips: tips,
        loading: false,
        initialized: true,
      });
    } catch {
      set({ loading: false, initialized: true });
    }
  },

  refreshCoach: async () => {
    const { goals, deadlines } = get();
    const tips = await getCoachTips({ goals, deadlines, recentActivityHours: 22 });
    set({ coachTips: tips });
  },

  getGoals: (filter) => {
    const goals = get().goals;
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (filter === "done") return goals.filter((g) => g.status === "done");
    if (filter === "today") {
      return goals.filter((g) => {
        if (g.status === "done") return false;
        if (!g.dueAt) return true;
        return new Date(g.dueAt).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
      });
    }

    return goals.filter((g) => {
      if (g.status === "done") return false;
      if (!g.dueAt) return true;
      return new Date(g.dueAt) <= in7;
    });
  },

  addGoal: async (input) => {
    const goal = await createGoal(input);
    set((state) => ({ goals: [goal, ...state.goals] }));
    await get().refreshCoach();
  },

  setGoalStatus: async (id, status) => {
    const next =
      status === "done" ? await completeGoal(id) : await updateGoal(id, { status });
    if (!next) return;
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? next : g)) }));
    await get().refreshCoach();
  },

  postponeGoalByOneDay: async (id) => {
    const next = await postponeGoal(id);
    if (!next) return;
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? next : g)) }));
    await get().refreshCoach();
  },

  prioritizeGoalHigh: async (id) => {
    const next = await prioritizeGoal(id);
    if (!next) return;
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? next : g)) }));
    await get().refreshCoach();
  },

  addDeadline: async (input) => {
    const deadline = await createDeadline(input);
    set((state) => ({ deadlines: [...state.deadlines, deadline].sort((a, b) => +new Date(a.date) - +new Date(b.date)) }));
    await get().refreshCoach();
  },

  addProject: async (input) => {
    const project = await createProject(input);
    set((state) => ({ projects: [project, ...state.projects] }));
  },

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  getProjectDataById: (id) => {
    const { projects, goals, deadlines, libraryItems } = get();
    const project = projects.find((p) => p.id === id);
    if (!project) return { project: undefined, goals: [], deadlines: [], libraryItems: [] };
    return {
      project,
      goals: goals.filter((g) => project.goalIds.includes(g.id) || g.projectId === project.id),
      deadlines: deadlines.filter((d) => project.deadlineIds.includes(d.id)),
      libraryItems: libraryItems.filter((l) => project.libraryItemIds.includes(l.id) || l.projectId === project.id),
    };
  },

  autoCreateGoalsForDeadline: async (deadlineId) => {
    const created = await autoGoalsFromDeadline(deadlineId);
    if (!created.length) return 0;
    set((state) => ({ goals: [...created, ...state.goals] }));
    await get().refreshCoach();
    return created.length;
  },

  searchLibrary: async (query) => {
    const results = await searchLibraryItems(query);
    return results;
  },
}));
