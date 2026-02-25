export type TrendItem = {
  id: string;
  title: string;
  tag: string;
  thumbnail: [string, string];
};

export type PostType = "text" | "pdf" | "qcm";
export type AuthorRole = "PROF" | "ETUDIANT";

export type HomePost = {
  id: string;
  authorName: string;
  username: string;
  role: AuthorRole;
  title: string;
  content: string;
  type: PostType;
  fileTitle?: string;
  fileMeta?: string;
  ctaLabel?: string;
  likes: number;
  comments: number;
  shares: number;
  saved: boolean;
  liked: boolean;
  createdAt: string;
};

export const trendsMock: TrendItem[] = [
  { id: "t1", title: "Memoire efficace en 20 min", tag: "#methode", thumbnail: ["#2A2A72", "#009FFD"] },
  { id: "t2", title: "Alternance: CV qui convertit", tag: "#alternance", thumbnail: ["#42275A", "#734B6D"] },
  { id: "t3", title: "SQL: erreurs classiques", tag: "#reseaux", thumbnail: ["#0F2027", "#2C5364"] },
  { id: "t4", title: "Oral de soutenance", tag: "#presentation", thumbnail: ["#1D4350", "#A43931"] },
  { id: "t5", title: "Plan de revision 7 jours", tag: "#planning", thumbnail: ["#16222A", "#3A6073"] },
  { id: "t6", title: "Prompt IA pour resumer", tag: "#ia", thumbnail: ["#141E30", "#243B55"] },
];

export const homePostsMock: HomePost[] = [
  {
    id: "p1",
    authorName: "Nadia Selmi",
    username: "nadia.prof",
    role: "PROF",
    title: "Planning revision SGBD",
    content: "Voici un plan compact pour couvrir les jointures, index et transactions avant le partiel.",
    type: "pdf",
    fileTitle: "PDF SGBD - 8 pages",
    fileMeta: "scheduling + memoire",
    ctaLabel: "Ouvrir",
    likes: 43,
    comments: 6,
    shares: 1,
    saved: false,
    liked: false,
    createdAt: "Il y a 2 h",
  },
  {
    id: "p2",
    authorName: "Yanis B",
    username: "yanis.dev",
    role: "ETUDIANT",
    title: "Fiche React Native",
    content: "J'ai condense les hooks essentiels et les patterns de navigation en 1 page.",
    type: "text",
    likes: 31,
    comments: 9,
    shares: 2,
    saved: true,
    liked: true,
    createdAt: "Il y a 3 h",
  },
  {
    id: "p3",
    authorName: "Leila M",
    username: "leila.qcm",
    role: "ETUDIANT",
    title: "QCM SQL dispo",
    content: "15 questions pour tester les jointures et sous-requetes. Niveau partiel.",
    type: "qcm",
    fileTitle: "QCM SQL - 15 questions",
    fileMeta: "Duree estimee: 12 min",
    ctaLabel: "Commencer",
    likes: 58,
    comments: 14,
    shares: 4,
    saved: false,
    liked: false,
    createdAt: "Il y a 5 h",
  },
  {
    id: "p4",
    authorName: "BLOC Team",
    username: "bloc.app",
    role: "PROF",
    title: "Checklist alternance",
    content: "Template de suivi candidature + relances RH en 3 etapes.",
    type: "text",
    likes: 77,
    comments: 21,
    shares: 7,
    saved: false,
    liked: false,
    createdAt: "Hier",
  },
  {
    id: "p5",
    authorName: "Samir K",
    username: "samir.ds",
    role: "PROF",
    title: "Sujet blanc reseaux",
    content: "Exercice corrige sur subnetting et routage statique.",
    type: "pdf",
    fileTitle: "PDF Reseaux - 6 pages",
    fileMeta: "subnetting + routage",
    ctaLabel: "Ouvrir",
    likes: 22,
    comments: 3,
    shares: 1,
    saved: false,
    liked: false,
    createdAt: "Hier",
  },
  {
    id: "p6",
    authorName: "Ines",
    username: "ines.ui",
    role: "ETUDIANT",
    title: "Resume UX mobile",
    content: "5 heuristiques pour rendre une app etudiante vraiment intuitive.",
    type: "text",
    likes: 19,
    comments: 2,
    shares: 0,
    saved: false,
    liked: false,
    createdAt: "Hier",
  },
  {
    id: "p7",
    authorName: "Karim",
    username: "karim.ops",
    role: "ETUDIANT",
    title: "QCM DevOps",
    content: "Questions CI/CD et Docker pour revision rapide.",
    type: "qcm",
    fileTitle: "QCM DevOps - 12 questions",
    fileMeta: "Duree estimee: 10 min",
    ctaLabel: "Commencer",
    likes: 34,
    comments: 4,
    shares: 1,
    saved: false,
    liked: false,
    createdAt: "Il y a 2 j",
  },
  {
    id: "p8",
    authorName: "Meriem",
    username: "meriem.data",
    role: "ETUDIANT",
    title: "Fiche NoSQL",
    content: "Comparatif MongoDB vs PostgreSQL pour le prochain workshop.",
    type: "pdf",
    fileTitle: "PDF NoSQL - 5 pages",
    fileMeta: "schema + requetes",
    ctaLabel: "Ouvrir",
    likes: 12,
    comments: 1,
    shares: 0,
    saved: false,
    liked: false,
    createdAt: "Il y a 2 j",
  },
  {
    id: "p9",
    authorName: "Mounir",
    username: "mounir.web",
    role: "PROF",
    title: "Methodo oral technique",
    content: "Structure STAR + demo live en 7 minutes pour convaincre un jury.",
    type: "text",
    likes: 51,
    comments: 8,
    shares: 3,
    saved: false,
    liked: false,
    createdAt: "Il y a 3 j",
  },
  {
    id: "p10",
    authorName: "Rania",
    username: "rania.ai",
    role: "ETUDIANT",
    title: "QCM IA generative",
    content: "Series de questions sur prompts, hallucinations et evaluation.",
    type: "qcm",
    fileTitle: "QCM IA - 20 questions",
    fileMeta: "Duree estimee: 15 min",
    ctaLabel: "Commencer",
    likes: 63,
    comments: 11,
    shares: 5,
    saved: false,
    liked: false,
    createdAt: "Il y a 4 j",
  },
];