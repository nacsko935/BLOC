export type User = {
  id: string;
  role: "standard" | "certified";
  xp: number;
  level: number;
};

export type Badge = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  unlocked: boolean;
};

export type Module = {
  id: string;
  title: string;
  subtitle: string;
  authorName: string;
  coverUrl: string;
  tags: string[];
  durationMinutes: number;
  level: "debutant" | "intermediaire" | "avance";
  certified: boolean;
  priceCents?: number;
  isFree: boolean;
  ratingAvg: number;
  ratingCount: number;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  quiz?: {
    question: string;
    answers: string[];
    correctIndex: number;
  };
};

export type Progress = {
  userId: string;
  moduleId: string;
  percent: number;
  completedLessonIds: string[];
  status: "in_progress" | "done";
};

export type ToolPreset = {
  id: string;
  title: string;
  icon: string;
  badge?: "AI" | "Beta" | "Certifie";
  route?: string;
};

export type Collection = {
  id: string;
  title: string;
  subtitle: string;
  moduleCount: number;
  tone: "red" | "purple" | "blue" | "green";
};

export type LearningModule = Module;
export type LearningUser = User;
