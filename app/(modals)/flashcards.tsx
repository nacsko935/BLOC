import { useTheme } from "../../src/core/theme/ThemeProvider";
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    question: "Qu'est-ce qu'une fonction ?",
    answer: "Une fonction est une relation qui associe à chaque élément d'un ensemble de départ un unique élément d'un ensemble d'arrivée.",
    category: "Mathématiques",
  },
  {
    id: "2",
    question: "Définir la dérivée",
    answer: "La dérivée d'une fonction en un point représente le taux de variation instantané de cette fonction en ce point.",
    category: "Mathématiques",
  },
  {
    id: "3",
    question: "Qu'est-ce que la POO ?",
    answer: "La Programmation Orientée Objet (POO) est un paradigme de programmation basé sur le concept d'objets qui contiennent des données et du code.",
    category: "Informatique",
  },
  {
    id: "4",
    question: "Définir l'algorithme",
    answer: "Un algorithme est une suite finie et non ambiguë d'opérations permettant de résoudre un problème.",
    category: "Informatique",
  },
];

export default function FlashcardsModal() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const flipAnim = new Animated.Value(0);

  const currentCard = mockFlashcards[currentIndex];
  const progress = ((currentIndex + 1) / mockFlashcards.length) * 100;

  const handleFlip = () => {
    if (flipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start(() => setFlipped(false));
    } else {
      setFlipped(true);
      Animated.spring(flipAnim, {
        toValue: 180,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleNext = (isKnown: boolean) => {
    if (isKnown) {
      setKnown([...known, currentCard.id]);
    }

    if (currentIndex < mockFlashcards.length - 1) {
      setFlipped(false);
      flipAnim.setValue(0);
      setCurrentIndex(currentIndex + 1);
    } else {
      // Session terminée
      router.back();
    }
  };

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} / {mockFlashcards.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Category */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{currentCard.category}</Text>
        </View>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <Pressable onPress={handleFlip} style={styles.cardPressable}>
          {/* Front */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontRotation }] },
              flipped && styles.cardHidden,
            ]}
          >
            <Text style={styles.cardLabel}>Question</Text>
            <Text style={styles.cardText}>{currentCard.question}</Text>
            <Text style={styles.tapHint}>Appuyez pour retourner</Text>
          </Animated.View>

          {/* Back */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ rotateY: backRotation }] },
              !flipped && styles.cardHidden,
            ]}
          >
            <Text style={styles.cardLabel}>Réponse</Text>
            <Text style={styles.cardText}>{currentCard.answer}</Text>
            <Text style={styles.tapHint}>Appuyez pour retourner</Text>
          </Animated.View>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => handleNext(false)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.unknownButton,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.actionButtonIcon}>❌</Text>
          <Text style={styles.actionButtonText}>À revoir</Text>
        </Pressable>

        <Pressable
          onPress={() => handleNext(true)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.knownButton,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.actionButtonIcon}>✓</Text>
          <Text style={[styles.actionButtonText, { color: c.textPrimary }]}>
            Je connais
          </Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{known.length}</Text>
          <Text style={styles.statLabel}>Connues</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{mockFlashcards.length - known.length}</Text>
          <Text style={styles.statLabel}>Restantes</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  headerInfo: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#111111",
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007aff",
    borderRadius: 2,
  },
  categoryContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  categoryBadge: {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  categoryText: {
    color: "#007aff",
    fontSize: 14,
    fontWeight: "700",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardPressable: {
    width: SCREEN_WIDTH - 40,
    height: 400,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#111111",
    borderRadius: theme.radius.xl,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadow.xl,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    backgroundColor: "#111111",
  },
  cardBack: {
    backgroundColor: "#007aff",
  },
  cardHidden: {
    opacity: 0,
  },
  cardLabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  cardText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  tapHint: {
    position: "absolute",
    bottom: 24,
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
    ...theme.shadow.sm,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  unknownButton: {
    backgroundColor: "#111111",
  },
  knownButton: {
    backgroundColor: "#34c759",
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 32,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  statLabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
