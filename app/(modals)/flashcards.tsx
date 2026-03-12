import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions, Pressable, ScrollView,
  StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import {
  FlashcardDeck, Flashcard,
  getDeck, getDecks,
} from "../../lib/services/flashcardService";

const { width: W } = Dimensions.get("window");

// ── Deck picker ────────────────────────────────────────────────────────────────

function DeckPicker({ onSelect }: { onSelect: (deck: FlashcardDeck) => void }) {
  const { c } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);

  useEffect(() => {
    getDecks().then(setDecks).catch(() => null);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <LinearGradient
        colors={["#1A0A3B", "#0A0A1A"]}
        style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 22, letterSpacing: -0.5 }}>
              Flashcards
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
              Choisis un deck pour réviser
            </Text>
          </View>
          <Pressable onPress={() => router.back()} style={st.closeBtn}>
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {decks.map(deck => (
          <Pressable key={deck.id} onPress={() => onSelect(deck)}
            style={({ pressed }) => [{
              borderRadius: 20, overflow: "hidden",
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }]}
          >
            <LinearGradient
              colors={[deck.color + "33", deck.color + "11"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20, padding: 18,
                borderWidth: 1, borderColor: deck.color + "44",
                flexDirection: "row", alignItems: "center", gap: 16,
              }}
            >
              <View style={{
                width: 52, height: 52, borderRadius: 16,
                backgroundColor: deck.color + "22",
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 26 }}>{deck.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 16 }}>{deck.title}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 3 }}>
                  {deck.cards.length} carte{deck.cards.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={{
                backgroundColor: deck.color + "22", borderRadius: 10,
                paddingHorizontal: 10, paddingVertical: 5,
              }}>
                <Text style={{ color: deck.color, fontWeight: "800", fontSize: 12 }}>
                  Réviser →
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        ))}

        {decks.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 60, gap: 12 }}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 17 }}>Aucun deck</Text>
            <Text style={{ color: c.textSecondary, fontSize: 13, textAlign: "center" }}>
              Les decks par défaut vont apparaître.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Session complete ────────────────────────────────────────────────────────────

function SessionDone({
  deck, known, total, onRestart, onBack,
}: {
  deck: FlashcardDeck; known: number; total: number;
  onRestart: () => void; onBack: () => void;
}) {
  const { c } = useTheme();
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;
  const scaleA = useRef(new Animated.Value(0.7)).current;
  const opA    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleA, { toValue: 1, useNativeDriver: true, tension: 80, friction: 9 }),
      Animated.timing(opA, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "👍" : "💪";
  const msg   = pct === 100 ? "Parfait ! Tu maîtrises tout !" : pct >= 70 ? "Très bien joué !" : pct >= 40 ? "Bien, continue !" : "Continue à pratiquer !";

  return (
    <Animated.View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center", padding: 32, opacity: opA, transform: [{ scale: scaleA }] }}>
      <Text style={{ fontSize: 72 }}>{emoji}</Text>
      <Text style={{ color: c.textPrimary, fontWeight: "900", fontSize: 26, marginTop: 16, textAlign: "center", letterSpacing: -0.5 }}>
        {msg}
      </Text>
      <Text style={{ color: c.textSecondary, fontSize: 14, marginTop: 8, textAlign: "center" }}>
        {deck.title}
      </Text>

      {/* Score ring */}
      <View style={{
        marginTop: 32, width: 130, height: 130, borderRadius: 65,
        borderWidth: 6, borderColor: pct >= 70 ? "#34C759" : pct >= 40 ? "#F59E0B" : "#7B6CFF",
        alignItems: "center", justifyContent: "center",
        backgroundColor: (pct >= 70 ? "#34C759" : pct >= 40 ? "#F59E0B" : "#7B6CFF") + "15",
      }}>
        <Text style={{ color: c.textPrimary, fontWeight: "900", fontSize: 36 }}>{pct}%</Text>
        <Text style={{ color: c.textSecondary, fontSize: 12 }}>{known}/{total}</Text>
      </View>

      <View style={{ marginTop: 40, width: "100%", gap: 12 }}>
        <Pressable onPress={onRestart} style={[st.btn, { backgroundColor: "#7B6CFF" }]}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Recommencer</Text>
        </Pressable>
        <Pressable onPress={onBack} style={[st.btn, { borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }]}>
          <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 14 }}>Changer de deck</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ── Card flip ───────────────────────────────────────────────────────────────────

function FlipCard({
  card, flipped, onFlip,
  deckColor,
}: {
  card: Flashcard; flipped: boolean; onFlip: () => void;
  deckColor: string;
}) {
  const { c } = useTheme();
  const flipA = useRef(new Animated.Value(0)).current;
  const prevFlipped = useRef(false);

  useEffect(() => {
    if (flipped === prevFlipped.current) return;
    prevFlipped.current = flipped;
    Animated.spring(flipA, {
      toValue: flipped ? 180 : 0,
      tension: 80, friction: 8, useNativeDriver: true,
    }).start();
  }, [flipped]);

  const frontRot = flipA.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backRot  = flipA.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

  return (
    <Pressable onPress={onFlip} style={st.cardPressable}>
      {/* Front */}
      <Animated.View style={[st.card, { backgroundColor: c.card, borderColor: "rgba(130,110,255,0.2)", transform: [{ rotateY: frontRot }] }, flipped && { opacity: 0 }]}>
        <Text style={{ color: deckColor, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>
          Question
        </Text>
        <Text style={{ color: c.textPrimary, fontSize: 20, fontWeight: "800", textAlign: "center", lineHeight: 28, letterSpacing: -0.3 }}>
          {card.question}
        </Text>
        <View style={{ position: "absolute", bottom: 22, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="sync-outline" size={13} color={c.textSecondary} />
          <Text style={{ color: c.textSecondary, fontSize: 12 }}>Appuie pour retourner</Text>
        </View>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[st.card, { borderColor: deckColor + "55", transform: [{ rotateY: backRot }] }, !flipped && { opacity: 0 }]}>
        <LinearGradient
          colors={[deckColor + "22", deckColor + "0A"]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={{ color: deckColor, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>
          Réponse
        </Text>
        <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "700", textAlign: "center", lineHeight: 25 }}>
          {card.answer}
        </Text>
        <View style={{ position: "absolute", bottom: 22, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="sync-outline" size={13} color={c.textSecondary} />
          <Text style={{ color: c.textSecondary, fontSize: 12 }}>Appuie pour retourner</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Session ─────────────────────────────────────────────────────────────────────

function Session({
  deck, onBack,
}: {
  deck: FlashcardDeck; onBack: () => void;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  // Queue: each card can appear multiple times until known
  const [queue, setQueue] = useState<Flashcard[]>(() => [...deck.cards]);
  const [known, setKnown] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const slideA = useRef(new Animated.Value(0)).current;

  const current = queue[0];
  const total = deck.cards.length;
  const remaining = queue.length;

  const animateNext = useCallback((direction: 1 | -1, cb: () => void) => {
    Animated.sequence([
      Animated.timing(slideA, { toValue: direction * 60, duration: 120, useNativeDriver: true }),
      Animated.timing(slideA, { toValue: -direction * 30, duration: 0, useNativeDriver: true }),
      Animated.spring(slideA, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
    ]).start(cb);
  }, []);

  const handleKnown = () => {
    animateNext(1, () => {
      setKnown(k => k + 1);
      setFlipped(false);
      const next = queue.slice(1);
      if (next.length === 0) setDone(true);
      else setQueue(next);
    });
  };

  const handleReview = () => {
    animateNext(-1, () => {
      setFlipped(false);
      // Move card to end of queue
      setQueue(q => [...q.slice(1), q[0]]);
    });
  };

  const handleRestart = () => {
    setQueue([...deck.cards]);
    setKnown(0);
    setFlipped(false);
    setDone(false);
  };

  if (done) {
    return (
      <SessionDone
        deck={deck}
        known={known}
        total={total}
        onRestart={handleRestart}
        onBack={onBack}
      />
    );
  }

  const progress = total > 0 ? (known / total) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <LinearGradient
        colors={["#1A0A3B", "#0A0A1A"]}
        style={{ paddingTop: insets.top + 10, paddingBottom: 14, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={onBack} style={st.closeBtn}>
            <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>{deck.title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 1 }}>
              {remaining} restante{remaining !== 1 ? "s" : ""} · {known} connue{known !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={{
            backgroundColor: deck.color + "22", borderRadius: 10,
            paddingHorizontal: 9, paddingVertical: 4,
          }}>
            <Text style={{ color: deck.color, fontWeight: "800", fontSize: 11 }}>
              {deck.emoji} {deck.title}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ height: 3, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 14, overflow: "hidden" }}>
          <Animated.View style={{
            height: "100%", borderRadius: 2,
            backgroundColor: deck.color,
            width: `${progress * 100}%`,
          }} />
        </View>
      </LinearGradient>

      {/* Card */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={{ transform: [{ translateX: slideA }], width: W - 32 }}>
          <FlipCard
            card={current}
            flipped={flipped}
            onFlip={() => setFlipped(f => !f)}
            deckColor={deck.color}
          />
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20, gap: 10 }}>
        {flipped ? (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={handleReview}
              style={({ pressed }) => [st.actionBtn, {
                backgroundColor: "rgba(255,59,48,0.12)", borderWidth: 1, borderColor: "rgba(255,59,48,0.3)",
                flex: 1, opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Ionicons name="refresh" size={18} color="#FF3B30" />
              <Text style={{ color: "#FF3B30", fontWeight: "800", fontSize: 14 }}>À revoir</Text>
            </Pressable>
            <Pressable
              onPress={handleKnown}
              style={({ pressed }) => [st.actionBtn, {
                backgroundColor: "rgba(52,199,89,0.12)", borderWidth: 1, borderColor: "rgba(52,199,89,0.3)",
                flex: 1, opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Ionicons name="checkmark" size={18} color="#34C759" />
              <Text style={{ color: "#34C759", fontWeight: "800", fontSize: 14 }}>Je sais !</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setFlipped(true)}
            style={({ pressed }) => [st.actionBtn, {
              backgroundColor: deck.color, justifyContent: "center",
              opacity: pressed ? 0.85 : 1,
            }]}
          >
            <Ionicons name="sync-outline" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Voir la réponse</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────────

export default function FlashcardsModal() {
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const router = useRouter();
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  // Load deck from param if provided
  useEffect(() => {
    if (!deckId) return;
    getDeck(deckId as string).then(d => { if (d) setSelectedDeck(d); }).catch(() => null);
  }, [deckId]);

  if (!selectedDeck) {
    return <DeckPicker onSelect={setSelectedDeck} />;
  }

  return (
    <Session
      deck={selectedDeck}
      onBack={() => {
        if (deckId) router.back();
        else setSelectedDeck(null);
      }}
    />
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  cardPressable: {
    width: "100%", height: 360,
  },
  card: {
    position: "absolute", width: "100%", height: "100%",
    borderRadius: 24, borderWidth: 1,
    padding: 28, alignItems: "center", justifyContent: "center",
    backfaceVisibility: "hidden", overflow: "hidden",
    shadowColor: "#6B5FFF", shadowOpacity: 0.2,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  btn: {
    height: 52, borderRadius: 999,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  actionBtn: {
    height: 52, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
});
