import AsyncStorage from "@react-native-async-storage/async-storage";

export type Objective = {
  id: string;
  text: string;
  done: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  objectives: Objective[];
  createdAt: string;
};

const KEY = "bloc.projects.v1";
const COLORS = ["#7B6CFF","#FF8C00","#34C759","#FF2D55","#4DA3FF","#AF52DE","#00C7BE","#FFD700"];
const ICONS = ["🎯","📚","💻","🔬","🎨","📊","🔧","⚡"];

function genId() { return `p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

export async function getProjects(): Promise<Project[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch { return []; }
}

export async function createProject(data: { title: string; description: string }): Promise<Project> {
  const projects = await getProjects();
  const idx = projects.length % COLORS.length;
  const project: Project = {
    id: genId(),
    title: data.title,
    description: data.description,
    color: COLORS[idx],
    icon: ICONS[idx],
    objectives: [],
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  await AsyncStorage.setItem(KEY, JSON.stringify(projects));
  return project;
}

export async function addObjective(projectId: string, text: string): Promise<Project | null> {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === projectId);
  if (idx === -1) return null;
  projects[idx].objectives.push({ id: genId(), text, done: false });
  await AsyncStorage.setItem(KEY, JSON.stringify(projects));
  return projects[idx];
}

export async function toggleObjective(projectId: string, objectiveId: string): Promise<Project | null> {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === projectId);
  if (idx === -1) return null;
  const objIdx = projects[idx].objectives.findIndex(o => o.id === objectiveId);
  if (objIdx === -1) return null;
  projects[idx].objectives[objIdx].done = !projects[idx].objectives[objIdx].done;
  await AsyncStorage.setItem(KEY, JSON.stringify(projects));
  return projects[idx];
}

export async function deleteProject(projectId: string): Promise<void> {
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
}

export function getProjectProgress(project: Project): number {
  if (!project.objectives.length) return 0;
  const done = project.objectives.filter(o => o.done).length;
  return Math.round((done / project.objectives.length) * 100);
}
