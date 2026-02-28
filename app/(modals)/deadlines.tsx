import { useTheme } from "../../src/core/theme/ThemeProvider";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

interface Deadline {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  timeLeft: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

const mockDeadlines: Deadline[] = [
  {
    id: "1",
    title: "Rendu projet React Native",
    course: "Développement Mobile",
    description: "Finaliser l'application BLOC avec toutes les fonctionnalités",
    dueDate: "2026-02-18",
    timeLeft: "Dans 2 jours",
    priority: "high",
    completed: false,
  },
  {
    id: "2",
    title: "QCM Mathématiques",
    course: "Algèbre linéaire",
    description: "QCM sur les matrices et déterminants",
    dueDate: "2026-02-20",
    timeLeft: "Dans 4 jours",
    priority: "medium",
    completed: false,
  },
  {
    id: "3",
    title: "Résumé de cours",
    course: "Cybersécurité",
    description: "Résumer le chapitre sur le cryptage RSA",
    dueDate: "2026-02-22",
    timeLeft: "Dans 6 jours",
    priority: "low",
    completed: false,
  },
  {
    id: "4",
    title: "Présentation groupe",
    course: "Management de projet",
    description: "Préparer slides + démo",
    dueDate: "2026-02-25",
    timeLeft: "Dans 9 jours",
    priority: "medium",
    completed: false,
  },
  {
    id: "5",
    title: "TP Réseaux terminé",
    course: "Réseaux TCP/IP",
    description: "Configuration routeur et firewall",
    dueDate: "2026-02-10",
    timeLeft: "Il y a 6 jours",
    priority: "low",
    completed: true,
  },
];

export default function DeadlinesScreen() {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<Deadline[]>(mockDeadlines);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDeadlines = deadlines.filter((deadline) => {
    // Filter by status
    if (filter === "active" && deadline.completed) return false;
    if (filter === "completed" && !deadline.completed) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        deadline.title.toLowerCase().includes(query) ||
        deadline.course.toLowerCase().includes(query) ||
        deadline.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const toggleComplete = (id: string) => {
    setDeadlines(
      deadlines.map((d) =>
        d.id === id ? { ...d, completed: !d.completed } : d
      )
    );
  };

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

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "Urgent";
      case "medium":
        return "Important";
      case "low":
        return "Normal";
    }
  };

  const activeCount = deadlines.filter((d) => !d.completed).length;
  const completedCount = deadlines.filter((d) => d.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Deadlines</Text>
        <Pressable
          onPress={() => {/* Add new deadline */}}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>À faire</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {activeCount > 0
              ? Math.round((completedCount / (activeCount + completedCount)) * 100)
              : 100}
            %
          </Text>
          <Text style={styles.statLabel}>Complétion</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher une deadline..."
          placeholderTextColor={"rgba(255,255,255,0.45)"}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text style={styles.clearButton}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Pressable
          onPress={() => setFilter("all")}
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "all" && styles.filterButtonTextActive,
            ]}
          >
            Toutes ({deadlines.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter("active")}
          style={[
            styles.filterButton,
            filter === "active" && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "active" && styles.filterButtonTextActive,
            ]}
          >
            Actives ({activeCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter("completed")}
          style={[
            styles.filterButton,
            filter === "completed" && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "completed" && styles.filterButtonTextActive,
            ]}
          >
            Terminées ({completedCount})
          </Text>
        </Pressable>
      </View>

      {/* Deadlines List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredDeadlines.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateTitle}>Aucune deadline</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Aucun résultat pour cette recherche"
                : "Ajoutez vos premières deadlines"}
            </Text>
          </View>
        ) : (
          filteredDeadlines.map((deadline) => (
            <Pressable
              key={deadline.id}
              onPress={() => router.push(`/task/${deadline.id}`)}
              style={({ pressed }) => [
                styles.deadlineCard,
                deadline.completed && styles.deadlineCardCompleted,
                pressed && styles.deadlineCardPressed,
              ]}
            >
              {/* Priority indicator */}
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(deadline.priority) },
                ]}
              />

              {/* Checkbox */}
              <Pressable
                onPress={() => toggleComplete(deadline.id)}
                style={[
                  styles.checkbox,
                  deadline.completed && styles.checkboxChecked,
                ]}
              >
                {deadline.completed && (
                  <Text style={styles.checkboxCheck}>✓</Text>
                )}
              </Pressable>

              {/* Content */}
              <View style={styles.deadlineContent}>
                <Text
                  style={[
                    styles.deadlineTitle,
                    deadline.completed && styles.deadlineTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {deadline.title}
                </Text>

                <Text style={styles.deadlineCourse}>{deadline.course}</Text>

                <Text style={styles.deadlineDescription} numberOfLines={2}>
                  {deadline.description}
                </Text>

                <View style={styles.deadlineFooter}>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: `${getPriorityColor(deadline.priority)}15`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityBadgeText,
                        { color: getPriorityColor(deadline.priority) },
                      ]}
                    >
                      {getPriorityLabel(deadline.priority)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.deadlineTime,
                      deadline.completed && styles.deadlineTimeCompleted,
                    ]}
                  >
                    📅 {deadline.timeLeft}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6E5CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 28,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 11,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 18,
    padding: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: "#111111",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  filterButtonActive: {
    backgroundColor: "#6E5CFF",
    borderColor: "#6E5CFF",
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deadlineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    gap: 12,
  },
  deadlineCardCompleted: {
    opacity: 0.6,
  },
  deadlineCardPressed: {
    opacity: 0.7,
  },
  priorityIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#6E5CFF",
    borderColor: "#6E5CFF",
  },
  checkboxCheck: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  deadlineContent: {
    flex: 1,
    gap: 6,
  },
  deadlineTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  deadlineTitleCompleted: {
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.50)",
  },
  deadlineCourse: {
    color: "#6E5CFF",
    fontSize: 13,
    fontWeight: "600",
  },
  deadlineDescription: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  deadlineFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  deadlineTime: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineTimeCompleted: {
    color: "rgba(255,255,255,0.50)",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyStateText: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
