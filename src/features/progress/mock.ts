import { Progression } from "../../core/data/models";

export const progressionMock: Progression = {
  xp: 1240,
  level: 7,
  streak: 9,
  missions: [
    { id: "m1", title: "1 QCM", progress: 1, target: 1 },
    { id: "m2", title: "20 min de révision", progress: 12, target: 20 },
    { id: "m3", title: "1 résumé", progress: 0, target: 1 },
  ],
  quests: [
    { id: "q1", subject: "Cyber", level: 3, progress: 64 },
    { id: "q2", subject: "Maths", level: 2, progress: 42 },
    { id: "q3", subject: "Anglais", level: 4, progress: 78 },
  ],
};
