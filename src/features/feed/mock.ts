import { Post, User } from "../../core/data/models";

const users: User[] = [
  { id: "u1", name: "Noura Ben", handle: "@noura", campus: "ESGI", level: 2 },
  { id: "u2", name: "Prof. Martin", handle: "@martin", campus: "ESGI", level: 9 },
  { id: "u3", name: "Samir", handle: "@samir", campus: "ESGI", level: 1 },
];

export const feedPosts: Post[] = [
  {
    id: "p1",
    type: "text",
    author: users[0],
    title: "Nouveauté étude",
    content: "Deadline : fiche Réseaux à rendre vendredi 17h.",
    tags: ["réseaux", "deadline"],
    stats: { likes: 42, comments: 6, saves: 12 },
    source: "campus",
    createdAt: "il y a 2 h",
    schoolCode: "ESGI",
  },
  {
    id: "p2",
    type: "qcm",
    author: users[1],
    title: "QCM officiel – Sécurité",
    content: "15 questions, corrigé inclus.",
    tags: ["sécurité", "qcm"],
    stats: { likes: 86, comments: 14, saves: 33 },
    source: "prof",
    createdAt: "il y a 3 h",
  },
  {
    id: "p3",
    type: "file",
    author: users[2],
    title: "Résumé Systèmes",
    content: "PDF 8 pages : scheduling + mémoire.",
    tags: ["systèmes", "pdf"],
    stats: { likes: 19, comments: 2, saves: 7 },
    source: "amis",
    createdAt: "il y a 5 h",
  },
];
