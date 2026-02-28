import { useTheme } from "../../core/theme/ThemeProvider";
import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../core/ui/theme";

interface Deadline {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  timeLeft: string;
  priority: "high" | "medium" | "low";
}

interface Suggestion {
  id: string;
  type: "course" | "flashcard" | "quiz" | "revision";
  title: string;
  description: string;
  icon: string;
  action: string;
}

const mockDeadlines: Deadline[] = [
  {
    id: "1",
    title: "Rendu projet React",
    course: "Développement Web",
    dueDate: "2026-02-18",
    timeLeft: "Dans 2 jours",
    priority: "high",
  },
  {
    id: "2",
    title: "QCM Mathématiques",
    course: "Algèbre linéaire",
    dueDate: "2026-02-20",
    timeLeft: "Dans 4 jours",
    priority: "medium",
  },
  {
    id: "3",
    title: "Résumé de cours",
    course: "Cybersécurité",
    dueDate: "2026-02-22",
    timeLeft: "Dans 6 jours",
    priority: "low",
  },
];

const mockSuggestions: Suggestion[] = [
  {
    id: "1",
    type: "flashcard",
    title: "Réviser les dérivées",
    description: "Tu n'as pas révisé depuis 5 jours",
    icon: "🎴",
    action: "flashcards",
  },
  {
    id: "2",
    type: "quiz",
    title: "Quiz Algorithmique",
    description: "Test tes connaissances",
    icon: "🧠",
    action: "quiz",
  },
  {
    id: "3",
    type: "course",
    title: "Nouveau cours disponible",
    description: "Réseaux TCP/IP - Prof. Martin",
    icon: "📚",
    action: "courses",
  },
];

interface DashboardWidgetProps {
  onNavigate: (route: string) => void;
}

export default function DashboardWidget({
  const { c } = useTheme(); onNavigate }: DashboardWidgetProps) {
  const router = useRouter();

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "#ff3b30";
      case "medium":
        return "#ff9500";
      case "low":
        return "#34c759";
    }
  };

  return (
    <View style={styles.container}>
      {/* Deadlines Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>⏰</Text>
            <Text style={styles.sectionTitle}>Deadlines à venir</Text>
          </View>
          <Pressable onPress={() => onNavigate("/deadlines")}>
            <Text style={styles.sectionAction}>Voir tout</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deadlinesScroll}
        >
          {mockDeadlines.map((deadline) => (
            <Pressable
              key={deadline.id}
              style={({ pressed }) => [
                styles.deadlineCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => onNavigate(`/task/${deadline.id}`)}
            >
              <View
                style={[
                  styles.deadlinePriority,
                  { backgroundColor: getPriorityColor(deadline.priority) },
                ]}
              />
              <Text style={styles.deadlineTitle} numberOfLines={2}>
                {deadline.title}
              </Text>
              <Text style={styles.deadlineCourse}>{deadline.course}</Text>
              <View style={styles.deadlineFooter}>
                <Text style={styles.deadlineTime}>📅 {deadline.timeLeft}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* AI Suggestions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>✨</Text>
            <Text style={styles.sectionTitle}>Suggestions pour toi</Text>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>IA</Text>
          </View>
        </View>

        <View style={styles.suggestionsGrid}>
          {mockSuggestions.map((suggestion) => (
            <Pressable
              key={suggestion.id}
              style={({ pressed }) => [
                styles.suggestionCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {
                if (suggestion.action === "flashcards") {
                  router.push("/(modals)/flashcards");
                } else if (suggestion.action === "quiz") {
                  router.push("/(modals)/quiz");
                } else if (suggestion.action === "courses") {
                  onNavigate("/courses");
                }
              }}
            >
              <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>
                  {suggestion.title}
                </Text>
                <Text style={styles.suggestionDescription} numberOfLines={2}>
                  {suggestion.description}
                </Text>
              </View>
              <Text style={styles.suggestionArrow}>→</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>9</Text>
            <Text style={styles.statLabel}>Jours de suite</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Cours suivis</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Complétion</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionAction: {
    color: "#6E5CFF",
    fontSize: 14,
    fontWeight: "700",
  },
  aiBadge: {
    backgroundColor: "rgba(177, 100, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  aiBadgeText: {
    color: "#b164ff",
    fontSize: 11,
    fontWeight: "800",
  },
  deadlinesScroll: {
    gap: 12,
    paddingRight: 20,
  },
  deadlineCard: {
    width: 200,
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    ...theme.shadow.sm,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  deadlinePriority: {
    width: 4,
    height: 40,
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 16,
  },
  deadlineTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 20,
  },
  deadlineCourse: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },
  deadlineFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deadlineTime: {
    color: "#6E5CFF",
    fontSize: 12,
    fontWeight: "700",
  },
  suggestionsGrid: {
    gap: 8,
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  suggestionIcon: {
    fontSize: 32,
  },
  suggestionContent: {
    flex: 1,
    gap: 4,
  },
  suggestionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionDescription: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  suggestionArrow: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 20,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
