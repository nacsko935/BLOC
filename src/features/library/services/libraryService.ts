import AsyncStorage from "@react-native-async-storage/async-storage";

export type LibraryItem = {
  id: string;
  kind: "QCM" | "Flashcards" | "Notes";
  title: string;
  status: "en_cours" | "termine";
  favorite: boolean;
  subject: string;
  date: string;
  difficulty: "facile" | "moyen" | "difficile";
};

const KEY = "bloc.library.items";

const seed: LibraryItem[] = [
  { id: "l1", kind: "QCM", title: "QCM Reseaux", status: "en_cours", favorite: true, subject: "Reseaux", date: "2026-02-19", difficulty: "moyen" },
  { id: "l2", kind: "Flashcards", title: "BDD Basics", status: "termine", favorite: false, subject: "BDD", date: "2026-02-18", difficulty: "facile" },
  { id: "l3", kind: "Notes", title: "Synthese IA", status: "en_cours", favorite: true, subject: "IA", date: "2026-02-17", difficulty: "difficile" },
];

export async function getLibraryItems(): Promise<LibraryItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    await AsyncStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as LibraryItem[];
  } catch {
    return seed;
  }
}
