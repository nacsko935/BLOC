import AsyncStorage from "@react-native-async-storage/async-storage";

export type Mission = { id: string; title: string; target: number; progress: number };
export type ProgressState = {
  streak: number;
  xp: number;
  level: number;
  badges: string[];
  missions: Mission[];
  lastReset: string;
};

const KEY = "bloc.progress.state";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function initialState(): ProgressState {
  return {
    streak: 3,
    xp: 420,
    level: 4,
    badges: ["Focus", "7 jours"],
    missions: [
      { id: "m1", title: "Reviser 10 min", target: 10, progress: 0 },
      { id: "m2", title: "Faire 1 QCM", target: 1, progress: 0 },
      { id: "m3", title: "Sauver 3 posts", target: 3, progress: 0 },
    ],
    lastReset: todayKey(),
  };
}

export async function getProgressState(): Promise<ProgressState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    const init = initialState();
    await AsyncStorage.setItem(KEY, JSON.stringify(init));
    return init;
  }

  let state: ProgressState;
  try {
    state = JSON.parse(raw) as ProgressState;
  } catch {
    state = initialState();
  }

  if (state.lastReset !== todayKey()) {
    state = {
      ...state,
      missions: state.missions.map((m) => ({ ...m, progress: 0 })),
      lastReset: todayKey(),
    };
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  }

  return state;
}

export async function updateMissionProgress(missionId: string, amount = 1) {
  const state = await getProgressState();
  const missions = state.missions.map((m) =>
    m.id === missionId ? { ...m, progress: Math.min(m.target, m.progress + amount) } : m
  );
  const next = { ...state, missions };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
