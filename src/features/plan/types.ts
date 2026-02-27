export type Goal = {
  id: string;
  title: string;
  subject: string;
  durationMin: number;
  priority: "low" | "med" | "high";
  status: "todo" | "doing" | "done";
  dueAt?: string;
  projectId?: string;
  createdAt: string;
};

export type Deadline = {
  id: string;
  title: string;
  subject: string;
  date: string;
  type: "exam" | "assignment" | "other";
  importance: "low" | "med" | "high";
  notes?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  subjectTags: string[];
  goalIds: string[];
  deadlineIds: string[];
  libraryItemIds: string[];
  progress: number;
};

export type LibraryItem = {
  id: string;
  type: "project" | "pdf" | "flashcards" | "quiz" | "folder" | "note" | "summary" | "group";
  title: string;
  subtitle: string;
  subject: string;
  createdAt: string;
  projectId?: string;
  updatedAt?: string;
  isLocked?: boolean;
  isPinned?: boolean;
  thumbnailUrl?: string;
};

export type CoachTipAction = {
  label: string;
  action: "start_pomodoro" | "review_module" | "plan_goals" | "open_deadlines" | "open_goals";
};

export type CoachTip = {
  id: string;
  title: string;
  message: string;
  actions: CoachTipAction[];
};

export type GoalsFilter = "today" | "week" | "done";
export type PlanWindow = "today" | "week";
