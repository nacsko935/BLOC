import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

interface User {
  id: string;
  name: string;
  handle: string;
  type: "student" | "professor" | "school";
  isOnline: boolean;
}

// Mock users for demo
const mockUsers: User[] = [
  { id: "1", name: "Dr. Thomas", handle: "@dr.thomas", type: "professor", isOnline: true },
  { id: "2", name: "Sophie Martin", handle: "@sophie.m", type: "student", isOnline: true },
  { id: "3", name: "Marie Dubois", handle: "@marie.d", type: "student", isOnline: false },
  { id: "4", name: "Prof. Dupont", handle: "@prof.dupont", type: "professor", isOnline: true },
  { id: "5", name: "ESGI Paris", handle: "@esgi_paris", type: "school", isOnline: true },
  { id: "6", name: "Lucas Bernard", handle: "@lucas.b", type: "student", isOnline: false },
];

export default function NewConversationModal() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = mockUsers.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.handle.toLowerCase().includes(query)
    );
  });

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;

    // In real app, create conversation in database
    // For now, just navigate to a new conversation
    router.back();
  };

  const getBadgeConfig = (type: "student" | "professor" | "school") => {
    switch (type) {
      case "professor":
        return { text: "Pro", color: "#ff9500", bg: "rgba(255, 149, 0, 0.15)" };
      case "school":
        return { text: "🏫", color: "#af52de", bg: "rgba(175, 82, 222, 0.15)" };
      default:
        return { text: "Ét", color: "#007aff", bg: "rgba(0, 122, 255, 0.15)" };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nouvelle conversation</Text>
        <Pressable
          onPress={handleCreateConversation}
          disabled={selectedUsers.length === 0}
          style={[
            styles.createButton,
            selectedUsers.length === 0 && styles.createButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.createButtonText,
              selectedUsers.length === 0 && styles.createButtonTextDisabled,
            ]}
          >
            Créer
          </Text>
        </Pressable>
      </View>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedLabel}>
            {selectedUsers.length} sélectionné{selectedUsers.length > 1 ? "s" : ""}
          </Text>
          <View style={styles.selectedList}>
            {selectedUsers.map((userId) => {
              const user = mockUsers.find((u) => u.id === userId);
              if (!user) return null;

              return (
                <Pressable
                  key={userId}
                  onPress={() => toggleUserSelection(userId)}
                  style={styles.selectedChip}
                >
                  <Text style={styles.selectedChipText}>{user.name}</Text>
                  <Text style={styles.selectedChipRemove}>✕</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text style={styles.clearButton}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedUsers.includes(item.id);
          const badge = getBadgeConfig(item.type);

          return (
            <Pressable
              onPress={() => toggleUserSelection(item.id)}
              style={({ pressed }) => [
                styles.userItem,
                pressed && styles.userItemPressed,
                isSelected && styles.userItemSelected,
              ]}
            >
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                {item.isOnline && <View style={styles.onlineIndicator} />}
              </View>

              {/* Info */}
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>
                      {badge.text}
                    </Text>
                  </View>
                </View>
                <Text style={styles.userHandle}>{item.handle}</Text>
              </View>

              {/* Selection indicator */}
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateText}>Aucun utilisateur trouvé</Text>
          </View>
        )}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  createButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  selectedSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  selectedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.accent,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selectedChipText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  selectedChipRemove: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    color: theme.colors.textMuted,
    fontSize: 18,
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userItemPressed: {
    opacity: 0.7,
  },
  userItemSelected: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderColor: theme.colors.accent,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#34c759",
    borderWidth: 2,
    borderColor: theme.colors.bg,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  userHandle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  checkboxCheck: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
