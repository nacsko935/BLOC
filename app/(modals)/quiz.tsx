import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const mockQuiz: QuizQuestion[] = [
  {
    id: "1",
    question: "Quelle est la dérivée de x² ?",
    options: ["x", "2x", "x²", "2"],
    correctAnswer: 1,
    explanation: "La dérivée de x² est 2x selon la règle de dérivation des puissances.",
  },
  {
    id: "2",
    question: "Qu'est-ce qu'un algorithme ?",
    options: [
      "Un programme informatique",
      "Une suite d'instructions pour résoudre un problème",
      "Un langage de programmation",
      "Un type de données",
    ],
    correctAnswer: 1,
    explanation: "Un algorithme est une suite finie et ordonnée d'instructions permettant de résoudre un problème.",
  },
  {
    id: "3",
    question: "Que signifie POO en informatique ?",
    options: [
      "Programmation Orientée Objet",
      "Planification Optimale des Opérations",
      "Programme Organisé Oralement",
      "Procédure d'Organisation Optimisée",
    ],
    correctAnswer: 0,
    explanation: "POO signifie Programmation Orientée Objet, un paradigme de programmation basé sur les objets.",
  },
];

export default function QuizModal() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const currentQuestion = mockQuiz[currentIndex];
  const progress = ((currentIndex + 1) / mockQuiz.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;

    setSelectedAnswer(index);
    setShowExplanation(true);

    if (!answeredQuestions.has(currentQuestion.id)) {
      setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]));
      if (index === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < mockQuiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz terminé
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showExplanation) {
      return selectedAnswer === index ? styles.optionSelected : null;
    }

    if (index === currentQuestion.correctAnswer) {
      return styles.optionCorrect;
    }

    if (selectedAnswer === index && !isCorrect) {
      return styles.optionIncorrect;
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Quiz</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentIndex + 1} / {mockQuiz.length}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <Pressable
              key={index}
              onPress={() => handleSelectAnswer(index)}
              disabled={showExplanation}
              style={({ pressed }) => [
                styles.option,
                getOptionStyle(index),
                pressed && !showExplanation && styles.optionPressed,
              ]}
            >
              <View style={styles.optionNumber}>
                <Text style={styles.optionNumberText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={styles.optionText}>{option}</Text>
              
              {showExplanation && index === currentQuestion.correctAnswer && (
                <Text style={styles.optionIcon}>✓</Text>
              )}
              {showExplanation && selectedAnswer === index && !isCorrect && (
                <Text style={styles.optionIcon}>✕</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Explanation */}
        {showExplanation && (
          <View style={[styles.explanation, isCorrect ? styles.explanationCorrect : styles.explanationIncorrect]}>
            <View style={styles.explanationHeader}>
              <Text style={styles.explanationIcon}>{isCorrect ? "✓" : "✕"}</Text>
              <Text style={styles.explanationTitle}>
                {isCorrect ? "Bravo !" : "Pas tout à fait"}
              </Text>
            </View>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={({ pressed }) => [
            styles.navButton,
            styles.navButtonSecondary,
            currentIndex === 0 && styles.navButtonDisabled,
            pressed && styles.navButtonPressed,
          ]}
        >
          <Text style={styles.navButtonText}>← Précédent</Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={!showExplanation}
          style={({ pressed }) => [
            styles.navButton,
            styles.navButtonPrimary,
            !showExplanation && styles.navButtonDisabled,
            pressed && styles.navButtonPressed,
          ]}
        >
          <Text style={[styles.navButtonText, { color: "#ffffff" }]}>
            {currentIndex === mockQuiz.length - 1 ? "Terminer" : "Suivant →"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
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
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "600",
  },
  headerInfo: {
    alignItems: "center",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  scoreContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007aff",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007aff",
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  questionContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 24,
    ...theme.shadow.md,
  },
  questionText: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionSelected: {
    borderColor: "#007aff",
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  optionCorrect: {
    borderColor: "#34c759",
    backgroundColor: "rgba(52, 199, 89, 0.1)",
  },
  optionIncorrect: {
    borderColor: "#ff3b30",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  optionNumberText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  optionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  optionIcon: {
    fontSize: 24,
  },
  explanation: {
    borderRadius: theme.radius.lg,
    padding: 20,
    gap: 12,
  },
  explanationCorrect: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderWidth: 1,
    borderColor: "#34c759",
  },
  explanationIncorrect: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  explanationIcon: {
    fontSize: 24,
  },
  explanationTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  explanationText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  navigation: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    alignItems: "center",
  },
  navButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  navButtonPrimary: {
    backgroundColor: "#007aff",
  },
  navButtonSecondary: {
    backgroundColor: theme.colors.surface,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
