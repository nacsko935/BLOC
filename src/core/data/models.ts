export type User = {
  id: string;
  name: string;
  handle: string;
  campus: string;
  level: number;
  avatar?: string;
};

export type FileItem = {
  id: string;
  type: "pdf" | "image" | "doc" | "audio" | "link";
  title: string;
  url?: string;
  size?: string;
};

export type Post = {
  id: string;
  type: "text" | "image" | "file" | "link" | "qcm" | "audio";
  author: User;
  title: string;
  content: string;
  tags: string[];
  stats: { likes: number; comments: number; saves: number };
  source: "amis" | "campus" | "prof" | "tendance";
  createdAt: string;
  schoolCode?: string;
};

export type Qcm = {
  id: string;
  title: string;
  subject: string;
  questions: number;
  status: "en_cours" | "termine";
  score?: number;
};

export type Mission = {
  id: string;
  title: string;
  progress: number;
  target: number;
};

export type Quest = {
  id: string;
  subject: string;
  level: number;
  progress: number;
};

export type Progression = {
  xp: number;
  level: number;
  streak: number;
  missions: Mission[];
  quests: Quest[];
};
