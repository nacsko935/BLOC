import AsyncStorage from "@react-native-async-storage/async-storage";

export type Mission = { id: string; title: string; target: number; progress: number; xp: number; icon: string };
export type Badge = { id: string; name: string; icon: string; unlocked: boolean; level: number; desc: string };
export type ProgressState = {
  streak: number;
  xp: number;
  level: number;
  badges: Badge[];
  missions: Mission[];
  lastReset: string;
  totalPosts: number;
  totalReposts: number;
  totalShares: number;
  totalLikes: number;
};

const KEY = "bloc.progress.v2";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const ALL_BADGES: Badge[] = [
  { id:"b1",  name:"Premier pas",    icon:"🌱", level:1,  unlocked:false, desc:"Crée ton premier post" },
  { id:"b2",  name:"Apprenti",       icon:"📚", level:2,  unlocked:false, desc:"Atteins le niveau 2" },
  { id:"b3",  name:"Studieux",       icon:"⭐", level:3,  unlocked:false, desc:"Atteins le niveau 3" },
  { id:"b4",  name:"Contributeur",   icon:"🔥", level:4,  unlocked:false, desc:"Atteins le niveau 4" },
  { id:"b5",  name:"Expert",         icon:"💎", level:5,  unlocked:false, desc:"Atteins le niveau 5" },
  { id:"b6",  name:"Maître",         icon:"🏆", level:6,  unlocked:false, desc:"Atteins le niveau 6" },
  { id:"b7",  name:"Légende",        icon:"👑", level:7,  unlocked:false, desc:"Atteins le niveau 7" },
  { id:"b8",  name:"Streak 7j",      icon:"🔥", level:1,  unlocked:false, desc:"7 jours consécutifs" },
  { id:"b9",  name:"Partageur",      icon:"↗️", level:1,  unlocked:false, desc:"Partage 10 publications" },
  { id:"b10", name:"Populaire",      icon:"❤️", level:1,  unlocked:false, desc:"Reçois 50 j'aimes" },
];

export function computeLevel(xp: number): { level: number; title: string; icon: string; nextXp: number; prevXp: number } {
  // Levels are designed to take weeks of real activity to reach higher tiers
  const LEVELS = [
    { xp:0,    title:"Débutant",      icon:"🌱" },
    { xp:150,  title:"Apprenti",      icon:"📚" },
    { xp:500,  title:"Studieux",      icon:"⭐" },
    { xp:1200, title:"Contributeur",  icon:"🔥" },
    { xp:2500, title:"Expert",        icon:"💎" },
    { xp:5000, title:"Maître",        icon:"🏆" },
    { xp:10000,title:"Légende",       icon:"👑" },
  ];
  let lvl = 1, title = LEVELS[0].title, icon = LEVELS[0].icon, prevXp = 0, nextXp = LEVELS[1].xp;
  for (let i = 1; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) {
      lvl = i + 1; title = LEVELS[i].title; icon = LEVELS[i].icon;
      prevXp = LEVELS[i].xp;
      nextXp = i + 1 < LEVELS.length ? LEVELS[i + 1].xp : LEVELS[LEVELS.length - 1].xp + 2000;
    }
  }
  return { level: lvl, title, icon, nextXp, prevXp };
}

function computeBadges(state: ProgressState): Badge[] {
  const { level, streak, totalShares, totalLikes } = state;
  return ALL_BADGES.map(b => ({
    ...b,
    unlocked:
      (b.id === "b1"  && state.totalPosts >= 3) ||        // Need 3 posts
      (b.id === "b2"  && level >= 2) ||                   // 150 XP
      (b.id === "b3"  && level >= 3) ||                   // 500 XP
      (b.id === "b4"  && level >= 4) ||                   // 1200 XP
      (b.id === "b5"  && level >= 5) ||                   // 2500 XP
      (b.id === "b6"  && level >= 6) ||                   // 5000 XP
      (b.id === "b7"  && level >= 7) ||                   // 10000 XP
      (b.id === "b8"  && streak >= 14) ||                 // 14 days straight
      (b.id === "b9"  && totalShares >= 25) ||            // 25 shares
      (b.id === "b10" && totalLikes >= 100),              // 100 likes received
  }));
}

function initialState(): ProgressState {
  return {
    streak: 1, xp: 0, level: 1,
    badges: ALL_BADGES,
    missions: [
      { id:"m1", title:"Publier un post",     target:1, progress:0, xp:20, icon:"📝" },
      { id:"m2", title:"Faire 1 QCM IA",      target:1, progress:0, xp:30, icon:"🤖" },
      { id:"m3", title:"Enregistrer 3 posts", target:3, progress:0, xp:15, icon:"🔖" },
      { id:"m4", title:"Republier 1 post",    target:1, progress:0, xp:10, icon:"🔁" },
      { id:"m5", title:"Partager 1 post",     target:1, progress:0, xp:10, icon:"↗️" },
    ],
    lastReset: todayKey(),
    totalPosts: 0, totalReposts: 0, totalShares: 0, totalLikes: 0,
  };
}

export async function getProgressState(): Promise<ProgressState> {
  const raw = await AsyncStorage.getItem(KEY).catch(() => null);
  let state: ProgressState;
  if (!raw) {
    state = initialState();
  } else {
    try { state = JSON.parse(raw) as ProgressState; }
    catch { state = initialState(); }
  }
  // Daily reset missions
  if (state.lastReset !== todayKey()) {
    state = { ...state, missions: state.missions.map(m => ({ ...m, progress: 0 })), lastReset: todayKey() };
  }
  // Recompute level + badges from XP
  const { level } = computeLevel(state.xp);
  state.level = level;
  state.badges = computeBadges(state);
  await AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => null);
  return state;
}

export async function addXP(amount: number, reason: string = "") {
  const state = await getProgressState();
  const newXp = state.xp + amount;
  const { level } = computeLevel(newXp);
  const next: ProgressState = { ...state, xp: newXp, level };
  // Track activity
  if (reason === "post")   next.totalPosts   = (state.totalPosts   || 0) + 1;
  if (reason === "repost") next.totalReposts = (state.totalReposts || 0) + 1;
  if (reason === "share")  next.totalShares  = (state.totalShares  || 0) + 1;
  if (reason === "like")   next.totalLikes   = (state.totalLikes   || 0) + 1;
  next.badges = computeBadges(next);
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => null);
  return next;
}

export async function completeMission(missionId: string) {
  const state = await getProgressState();
  let gained = 0;
  const missions = state.missions.map(m => {
    if (m.id !== missionId) return m;
    const newProgress = Math.min(m.target, m.progress + 1);
    if (newProgress === m.target && m.progress < m.target) gained = m.xp;
    return { ...m, progress: newProgress };
  });
  const newXp = state.xp + gained;
  const { level } = computeLevel(newXp);
  const next = { ...state, missions, xp: newXp, level };
  next.badges = computeBadges(next);
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => null);
  return next;
}

// Legacy compat
export async function updateMissionProgress(missionId: string, amount = 1) {
  return completeMission(missionId);
}
