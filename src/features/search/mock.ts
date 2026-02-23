import { Post, User } from "../../core/data/models";

const people: User[] = [
  { id: "s1", name: "Lina", handle: "@lina", campus: "ESGI", level: 1 },
  { id: "s2", name: "Prof. Elias", handle: "@elias", campus: "ESGI", level: 7 },
  { id: "s3", name: "Nadia", handle: "@nadia", campus: "ESGI", level: 3 },
];

const posts: Post[] = [
  {
    id: "sp1",
    type: "text",
    author: people[0],
    title: "Fiche Réseaux – modèle",
    content: "Format prêt à remplir + checklist.",
    tags: ["réseaux", "fiche"],
    stats: { likes: 64, comments: 8, saves: 21 },
    source: "tendance",
    createdAt: "hier",
  },
  {
    id: "sp2",
    type: "link",
    author: people[1],
    title: "Méthode Pomodoro",
    content: "Guide en 3 étapes pour réviser.",
    tags: ["méthode", "productivité"],
    stats: { likes: 53, comments: 5, saves: 18 },
    source: "prof",
    createdAt: "il y a 1 j",
  },
  {
    id: "sp3",
    type: "qcm",
    author: people[2],
    title: "QCM Réseau – niveau 1",
    content: "10 questions · corrigé instantané.",
    tags: ["qcm", "réseaux"],
    stats: { likes: 31, comments: 4, saves: 9 },
    source: "campus",
    createdAt: "il y a 3 j",
  },
];

export const searchMock = { people, posts };
