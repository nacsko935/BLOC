import AsyncStorage from "@react-native-async-storage/async-storage";

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

export type FlashcardDeck = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  cards: Flashcard[];
  createdAt: string;
};

const KEY = "bloc.flashcards.v1";

function genId() { return `fc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

const DEFAULT_DECKS: FlashcardDeck[] = [
  {
    id: "default_algo",
    title: "Algorithmique",
    emoji: "🧮",
    color: "#7B6CFF",
    createdAt: new Date(0).toISOString(),
    cards: [
      { id: "a1", question: "Qu'est-ce qu'un algorithme ?", answer: "Une suite finie et non-ambiguë d'instructions permettant de résoudre un problème." },
      { id: "a2", question: "Quelle est la complexité d'une recherche binaire ?", answer: "O(log n) — on divise l'espace de recherche par 2 à chaque étape." },
      { id: "a3", question: "Qu'est-ce qu'une structure LIFO ?", answer: "Last In, First Out — une pile (Stack) : le dernier élément inséré est le premier sorti." },
      { id: "a4", question: "Qu'est-ce qu'une structure FIFO ?", answer: "First In, First Out — une file (Queue) : le premier élément inséré est le premier sorti." },
      { id: "a5", question: "Quelle est la complexité du tri à bulles ?", answer: "O(n²) dans le pire cas — peu efficace sur de grandes listes." },
      { id: "a6", question: "Qu'est-ce que la récursivité ?", answer: "Une fonction qui s'appelle elle-même avec un cas de base pour éviter une boucle infinie." },
    ],
  },
  {
    id: "default_maths",
    title: "Mathématiques",
    emoji: "📐",
    color: "#10B981",
    createdAt: new Date(0).toISOString(),
    cards: [
      { id: "m1", question: "Qu'est-ce qu'une dérivée ?", answer: "Le taux de variation instantané d'une fonction en un point — la pente de la tangente." },
      { id: "m2", question: "Que vaut ∫ x² dx ?", answer: "x³/3 + C (constante d'intégration)." },
      { id: "m3", question: "Quelle est la formule d'Euler ?", answer: "e^(iπ) + 1 = 0 — relie les constantes fondamentales e, i, π, 1 et 0." },
      { id: "m4", question: "Qu'est-ce qu'une matrice carrée inversible ?", answer: "Une matrice A telle qu'il existe B avec AB = BA = I (matrice identité)." },
      { id: "m5", question: "Que signifie « une suite converge » ?", answer: "Elle tend vers une limite finie quand n → +∞." },
    ],
  },
  {
    id: "default_cyber",
    title: "Cybersécurité",
    emoji: "🔒",
    color: "#F59E0B",
    createdAt: new Date(0).toISOString(),
    cards: [
      { id: "c1", question: "Qu'est-ce qu'une attaque XSS ?", answer: "Cross-Site Scripting — injection de code malveillant dans une page web vue par d'autres utilisateurs." },
      { id: "c2", question: "Qu'est-ce qu'une injection SQL ?", answer: "Insertion de code SQL malveillant dans une requête pour manipuler la base de données." },
      { id: "c3", question: "Qu'est-ce que le chiffrement asymétrique ?", answer: "Utilise une paire clé publique/clé privée (ex. RSA). Ce qui est chiffré avec l'une ne peut être déchiffré qu'avec l'autre." },
      { id: "c4", question: "Qu'est-ce qu'un hash cryptographique ?", answer: "Une empreinte de taille fixe d'un message — déterministe, rapide à calculer, irréversible (ex. SHA-256)." },
      { id: "c5", question: "Qu'est-ce qu'une attaque MITM ?", answer: "Man-In-The-Middle — un attaquant intercepte et peut modifier les communications entre deux parties." },
      { id: "c6", question: "Qu'est-ce que le principe du moindre privilège ?", answer: "Donner à chaque entité uniquement les droits minimaux dont elle a besoin pour fonctionner." },
    ],
  },
];

async function load(): Promise<FlashcardDeck[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const saved: FlashcardDeck[] = raw ? JSON.parse(raw) : [];
    // Merge defaults that haven't been deleted by user
    const savedIds = new Set(saved.map(d => d.id));
    const defaults = DEFAULT_DECKS.filter(d => !savedIds.has(d.id));
    return [...defaults, ...saved.filter(d => !DEFAULT_DECKS.some(dd => dd.id === d.id)), ...saved.filter(d => DEFAULT_DECKS.some(dd => dd.id === d.id))];
  } catch { return DEFAULT_DECKS; }
}

async function save(decks: FlashcardDeck[]): Promise<void> {
  // Only persist non-default decks or modified default decks
  await AsyncStorage.setItem(KEY, JSON.stringify(decks));
}

export async function getDecks(): Promise<FlashcardDeck[]> {
  return load();
}

export async function getDeck(deckId: string): Promise<FlashcardDeck | null> {
  const decks = await load();
  return decks.find(d => d.id === deckId) ?? null;
}

export async function createDeck(data: { title: string; emoji?: string; color?: string }): Promise<FlashcardDeck> {
  const decks = await load();
  const deck: FlashcardDeck = {
    id: genId(),
    title: data.title,
    emoji: data.emoji ?? "📚",
    color: data.color ?? "#7B6CFF",
    cards: [],
    createdAt: new Date().toISOString(),
  };
  decks.push(deck);
  await save(decks);
  return deck;
}

export async function addCard(deckId: string, card: { question: string; answer: string }): Promise<FlashcardDeck | null> {
  const decks = await load();
  const idx = decks.findIndex(d => d.id === deckId);
  if (idx === -1) return null;
  decks[idx].cards.push({ id: genId(), ...card });
  await save(decks);
  return decks[idx];
}

export async function deleteDeck(deckId: string): Promise<void> {
  const decks = await load();
  await save(decks.filter(d => d.id !== deckId));
}
