import { Qcm } from "../../core/data/models";

const store: Qcm[] = [
  { id: "qcm1", title: "Réseaux – TCP/IP", subject: "Réseaux", questions: 12, status: "termine", score: 86 },
  { id: "qcm2", title: "Cyber – OWASP", subject: "Cyber", questions: 10, status: "en_cours" },
  { id: "qcm3", title: "Maths – Probabilités", subject: "Maths", questions: 15, status: "termine", score: 74 },
];

export function listQcms() {
  return [...store];
}

export function getQcm(id: string) {
  return store.find((q) => q.id === id) ?? null;
}

export function createQcm(input: { title: string; subject: string; questions: number }) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  store.unshift({
    id,
    title: input.title || "Nouveau QCM",
    subject: input.subject || "Général",
    questions: input.questions || 1,
    status: "en_cours",
  });
  return id;
}

export function completeQcm(id: string, score: number) {
  const item = store.find((q) => q.id === id);
  if (!item) return;
  item.status = "termine";
  item.score = score;
}
