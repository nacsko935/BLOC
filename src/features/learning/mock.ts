import { Badge, Collection, Lesson, Module, Progress, ToolPreset, User } from "./types";

export const learningUserMock: User = {
  id: "demo-user",
  role: "standard",
  xp: 1280,
  level: 5,
};

export const learningModulesMock: Module[] = [
  {
    id: "mod-web-basics",
    title: "Web Basics",
    subtitle: "HTML, CSS et JS pour bien debuter",
    authorName: "Nina Rousseau",
    coverUrl: "cover-web",
    certified: true,
    isFree: true,
    tags: ["web", "frontend", "starter"],
    level: "debutant",
    durationMinutes: 180,
    ratingAvg: 4.8,
    ratingCount: 321,
  },
  {
    id: "mod-ia-starter",
    title: "IA Starter",
    subtitle: "Prompting et workflows IA etudiants",
    authorName: "Pr. Zhang",
    coverUrl: "cover-ia",
    certified: true,
    isFree: false,
    priceCents: 1299,
    tags: ["ia", "prompt", "outils"],
    level: "intermediaire",
    durationMinutes: 220,
    ratingAvg: 4.7,
    ratingCount: 210,
  },
  {
    id: "mod-secu-101",
    title: "Secu 101",
    subtitle: "Les reflexes cyber essentiels",
    authorName: "Lea Martin",
    coverUrl: "cover-secu",
    certified: true,
    isFree: true,
    tags: ["securite", "cyber"],
    level: "debutant",
    durationMinutes: 150,
    ratingAvg: 4.6,
    ratingCount: 142,
  },
  {
    id: "mod-sql-fast",
    title: "SQL Sprint",
    subtitle: "Requetes utiles pour TD et projets",
    authorName: "Karim Bellah",
    coverUrl: "cover-sql",
    certified: false,
    isFree: true,
    tags: ["sql", "database"],
    level: "intermediaire",
    durationMinutes: 140,
    ratingAvg: 4.5,
    ratingCount: 97,
  },
  {
    id: "mod-revision-rapide",
    title: "Revision rapide",
    subtitle: "Methode 30 min pour preparer un partiel",
    authorName: "Amina Charef",
    coverUrl: "cover-revision",
    certified: true,
    isFree: true,
    tags: ["revision", "methodo"],
    level: "debutant",
    durationMinutes: 90,
    ratingAvg: 4.4,
    ratingCount: 78,
  },
  {
    id: "mod-alternance",
    title: "Alternance kit",
    subtitle: "CV, pitch et entretiens techniques",
    authorName: "Riad Messaoud",
    coverUrl: "cover-alt",
    certified: true,
    isFree: false,
    priceCents: 899,
    tags: ["alternance", "emploi"],
    level: "intermediaire",
    durationMinutes: 165,
    ratingAvg: 4.7,
    ratingCount: 188,
  },
];

export const lessonsMock: Lesson[] = [
  {
    id: "les-web-1",
    moduleId: "mod-web-basics",
    title: "Structure HTML",
    content: "Decouvre les balises, la semantique et la structure d'une page.",
    order: 1,
  },
  {
    id: "les-web-2",
    moduleId: "mod-web-basics",
    title: "Mise en forme CSS",
    content: "Travaille la mise en page, les espacements et les composants.",
    order: 2,
  },
  {
    id: "les-web-3",
    moduleId: "mod-web-basics",
    title: "Interactions JS",
    content: "Ajoute des comportements utilisateur simples et robustes.",
    order: 3,
    quiz: {
      question: "Quelle methode ajoute une classe CSS ?",
      answers: ["classList.add()", "style.append()", "queryClass()"],
      correctIndex: 0,
    },
  },
  {
    id: "les-ia-1",
    moduleId: "mod-ia-starter",
    title: "Prompt clair et testable",
    content: "Apprends a formuler un prompt avec contexte, role et objectif.",
    order: 1,
  },
  {
    id: "les-ia-2",
    moduleId: "mod-ia-starter",
    title: "Evaluation des reponses",
    content: "Valide la qualite avec une grille simple: precision, couverture, action.",
    order: 2,
  },
  {
    id: "les-secu-1",
    moduleId: "mod-secu-101",
    title: "Menaces courantes",
    content: "Reconnais phishing, fuites de mots de passe et faux liens.",
    order: 1,
  },
  {
    id: "les-secu-2",
    moduleId: "mod-secu-101",
    title: "Hygiene numerique",
    content: "Applique les bonnes pratiques sur tes comptes et appareils.",
    order: 2,
  },
];

export const badgesMock: Badge[] = [
  { id: "badge-web", name: "Web Basics", description: "Terminer le module Web Basics", icon: "globe-outline", unlocked: false },
  { id: "badge-ia", name: "IA Starter", description: "Reussir le quiz final IA", icon: "sparkles-outline", unlocked: false },
  { id: "badge-secu", name: "Secu 101", description: "Valider les reflexes cyber", icon: "shield-checkmark-outline", unlocked: true },
  { id: "badge-sql", name: "SQL Sprint", description: "Faire 3 requetes sans erreur", icon: "server-outline", unlocked: false },
];

export const progressMock: Progress[] = [
  {
    userId: "demo-user",
    moduleId: "mod-web-basics",
    completedLessonIds: ["les-web-1"],
    percent: 33,
    status: "in_progress",
  },
  {
    userId: "demo-user",
    moduleId: "mod-secu-101",
    completedLessonIds: ["les-secu-1", "les-secu-2"],
    percent: 100,
    status: "done",
  },
];

export const toolPresetsMock: ToolPreset[] = [
  { id: "tool-flashcards", title: "Flashcards", icon: "albums-outline", badge: "AI", route: "/create/flashcards" },
  { id: "tool-quiz", title: "Quiz", icon: "help-circle-outline", badge: "AI", route: "/create/qcm" },
  { id: "tool-summary", title: "Resume", icon: "document-text-outline", badge: "AI", route: "/create/pdf" },
  { id: "tool-plan", title: "Plan revision", icon: "calendar-outline", badge: "Beta", route: "/(modals)/deadlines" },
  { id: "tool-exam", title: "Fiches examen", icon: "reader-outline", route: "/(modals)/note-new" },
  { id: "tool-import", title: "Importer", icon: "cloud-upload-outline", route: "/create/import" },
];

export const collectionsMock: Collection[] = [
  { id: "col-revision", title: "Revisions Express", subtitle: "Sessions courtes, impact rapide", moduleCount: 20, tone: "red" },
  { id: "col-exams", title: "Examens a venir", subtitle: "Parcours focuses sur partiels", moduleCount: 14, tone: "purple" },
  { id: "col-emploi", title: "Stage & Alternance", subtitle: "Prepare tes candidatures", moduleCount: 12, tone: "blue" },
];
