/**
 * aiService.ts — IA 100% locale, GRATUITE, sans API payante
 *
 * Fonctionnement : parsing heuristique du texte extrait d'un document.
 * - Résumé : extraction des phrases-clés par TF-IDF simplifié
 * - Flashcards : détection de définitions / concepts-clés
 * - QCM : génération de questions à partir de phrases affirmatives
 *
 * Aucune dépendance externe, aucun appel réseau.
 */

// ── Types publics ──────────────────────────────────────────────────────────────

export type Flashcard = {
  id: string;
  front: string;   // question / terme
  back: string;    // réponse / définition
};

export type QCMQuestion = {
  id: string;
  question: string;
  options: string[];     // 4 options
  correctIndex: number;  // index de la bonne réponse
  explanation: string;
};

export type AIAnalysisResult = {
  summary: string;
  keyPoints: string[];
  flashcards: Flashcard[];
  qcm: QCMQuestion[];
  wordCount: number;
  estimatedReadTime: number; // minutes
};

// ── Utilitaires ────────────────────────────────────────────────────────────────

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 400);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map(p => p.replace(/\n/g, " ").trim())
    .filter(p => p.length > 40);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zàâäéèêëîïôùûüç\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);
}

const STOP_WORDS = new Set([
  "avec","dans","pour","cette","plus","sans","mais","bien","très","tout","même",
  "aussi","après","avant","alors","comme","donc","moins","nous","vous","leur",
  "leurs","notre","votre","entre","chaque","selon","ainsi","chez","vers","depuis",
  "dont","seul","seule","être","avoir","faire","pouvoir","devoir","vouloir",
  "aller","venir","voir","mettre","donner","prendre","partir","passer","rester",
  "tous","toutes","autre","autres","elle","elles","they","that","this","with",
  "from","have","will","been","what","when","which","their","there","about",
  "your","mais","donc","aussi","alors","même","tant","sous","entre","over",
  "that","than","them","then","they","this","time","were","what","when","will",
]);

function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (!STOP_WORDS.has(t)) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

function topTerms(text: string, n = 15): string[] {
  const tokens = tokenize(text);
  const freq = termFrequency(tokens);
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([term]) => term);
}

function scoreSentence(sentence: string, keywords: string[]): number {
  const lower = sentence.toLowerCase();
  return keywords.reduce((score, kw) => score + (lower.includes(kw) ? 1 : 0), 0);
}

// ── Résumé ─────────────────────────────────────────────────────────────────────

function generateSummary(text: string, maxSentences = 5): string {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences.join(" ");
  const keywords = topTerms(text, 20);
  const scored = sentences.map(s => ({ s, score: scoreSentence(s, keywords) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, maxSentences).map(x => x.s);
  // Re-ordonner dans l'ordre d'apparition
  const inOrder = sentences.filter(s => top.includes(s));
  return inOrder.join(" ");
}

function extractKeyPoints(text: string, max = 6): string[] {
  const paras = splitParagraphs(text);
  const keywords = topTerms(text, 25);
  const scored = paras.map(p => ({ p, score: scoreSentence(p, keywords) }));
  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, max)
    .map(x => {
      const s = x.p.length > 120 ? x.p.slice(0, 120) + "…" : x.p;
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
}

// ── Flashcards ─────────────────────────────────────────────────────────────────

const DEFINITION_PATTERNS = [
  /(.{5,50})\s*(?:est|est un|est une|désigne|signifie|correspond à|représente|se définit comme)\s+(.{10,150})/i,
  /(?:on appelle|on nomme|le terme|la notion de)\s+["«]?(.{3,50})["»]?\s+(?:ce qui|le fait que|la capacité de|le processus de|l'ensemble des?)\s+(.{10,150})/i,
  /(.{5,50})\s*[:=–—]\s*(.{15,150})/,
];

function extractFlashcards(text: string, max = 8): Flashcard[] {
  const sentences = splitSentences(text);
  const cards: Flashcard[] = [];

  for (const sentence of sentences) {
    if (cards.length >= max) break;
    for (const pattern of DEFINITION_PATTERNS) {
      const match = sentence.match(pattern);
      if (match && match[1] && match[2]) {
        const front = match[1].trim().replace(/^[A-Za-z\s]+:\s*/, "");
        const back  = match[2].trim();
        if (front.length > 3 && back.length > 10) {
          cards.push({
            id: `fc-${cards.length}`,
            front: front.charAt(0).toUpperCase() + front.slice(1),
            back:  back.charAt(0).toUpperCase() + back.slice(1),
          });
          break;
        }
      }
    }
  }

  // Compléter avec les concepts-clés si pas assez de flashcards
  if (cards.length < 3) {
    const keywords = topTerms(text, 20);
    for (const kw of keywords.slice(0, 5)) {
      if (cards.length >= max) break;
      // Trouver la première phrase contenant ce mot
      const defSentence = sentences.find(s =>
        s.toLowerCase().includes(kw) && s.length > 30
      );
      if (defSentence) {
        cards.push({
          id: `fc-kw-${cards.length}`,
          front: `Qu'est-ce que "${kw}" ?`,
          back:  defSentence.trim(),
        });
      }
    }
  }

  return cards;
}

// ── QCM ────────────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DISTRACTOR_PAIRS: Record<string, string[]> = {
  "vrai":     ["faux", "probable", "incertain"],
  "augmente": ["diminue", "stagne", "oscille"],
  "positif":  ["négatif", "neutre", "variable"],
  "grand":    ["petit", "moyen", "variable"],
  "rapide":   ["lent", "modéré", "constant"],
  "premier":  ["dernier", "intermédiaire", "quelconque"],
  "simple":   ["complexe", "modéré", "inconnu"],
};

function generateQCM(text: string, max = 5): QCMQuestion[] {
  const sentences = splitSentences(text);
  const keywords = topTerms(text, 30);
  const questions: QCMQuestion[] = [];

  const candidates = sentences.filter(s =>
    keywords.some(kw => s.toLowerCase().includes(kw)) &&
    s.length > 40
  );

  for (let i = 0; i < Math.min(candidates.length, max); i++) {
    const sentence = candidates[i];
    const words = tokenize(sentence).filter(w => !STOP_WORDS.has(w) && w.length > 4);
    if (!words.length) continue;

    // Choisir un mot-clé à "tester"
    const targetWord = words[Math.floor(Math.random() * Math.min(words.length, 3))];

    // Trouver des distracteurs pertinents
    let distractors: string[] = [];
    for (const [key, values] of Object.entries(DISTRACTOR_PAIRS)) {
      if (sentence.toLowerCase().includes(key)) {
        distractors = values;
        break;
      }
    }
    // Fallback: utiliser d'autres mots-clés du texte
    if (distractors.length < 3) {
      distractors = keywords
        .filter(kw => kw !== targetWord && kw.length > 3)
        .slice(0, 3);
    }
    while (distractors.length < 3) distractors.push("Aucune de ces réponses");

    const correctAnswer = targetWord;
    const allOptions = shuffleArray([correctAnswer, ...distractors.slice(0, 3)]);
    const correctIndex = allOptions.indexOf(correctAnswer);

    // Générer la question
    const questionText = sentence
      .replace(new RegExp(`\\b${targetWord}\\b`, "i"), "___")
      .slice(0, 140);

    questions.push({
      id: `qcm-${i}`,
      question: questionText + " ?",
      options: allOptions,
      correctIndex,
      explanation: `La bonne réponse est "${correctAnswer}". ${sentence.slice(0, 100)}`,
    });
  }

  return questions;
}

// ── Fonction principale ─────────────────────────────────────────────────────────

export async function analyzeText(rawText: string): Promise<AIAnalysisResult> {
  const text = cleanText(rawText);
  if (text.length < 50) {
    throw new Error("Le texte est trop court pour être analysé (minimum 50 caractères).");
  }

  const wordCount = tokenize(text).length;
  const estimatedReadTime = Math.max(1, Math.round(wordCount / 200));

  const [summary, keyPoints, flashcards, qcm] = await Promise.all([
    Promise.resolve(generateSummary(text, 5)),
    Promise.resolve(extractKeyPoints(text, 6)),
    Promise.resolve(extractFlashcards(text, 8)),
    Promise.resolve(generateQCM(text, 5)),
  ]);

  return { summary, keyPoints, flashcards, qcm, wordCount, estimatedReadTime };
}

/**
 * Extrait le texte brut d'un PDF (via l'URL) en utilisant fetch
 * Fonctionne uniquement si le PDF contient du texte sélectionnable (pas scanné).
 * Retourne le texte extrait ou null si impossible.
 */
export async function extractTextFromPdfUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // Extraction naïve des strings ASCII/UTF-8 du PDF
    let text = "";
    const decoder = new TextDecoder("utf-8", { fatal: false });
    text = decoder.decode(bytes);
    // Extraire uniquement les blocs de texte (entre BT et ET dans un PDF)
    const btEtMatches = text.matchAll(/BT\s*([\s\S]*?)\s*ET/g);
    const extracted: string[] = [];
    for (const m of btEtMatches) {
      const block = m[1];
      // Extraire les strings entre parenthèses : (text)Tj
      const strMatches = block.matchAll(/\(([^)]{1,300})\)\s*T[jJ]/g);
      for (const sm of strMatches) {
        const clean = sm[1].replace(/\\n/g, " ").replace(/\\\(/g, "(").replace(/\\\)/g, ")").trim();
        if (clean.length > 2) extracted.push(clean);
      }
    }
    const result = extracted.join(" ").trim();
    return result.length > 100 ? result : null;
  } catch {
    return null;
  }
}
