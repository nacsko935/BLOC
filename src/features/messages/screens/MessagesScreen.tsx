import { useTheme } from "../../../core/theme/ThemeProvider";
﻿import { memo, useCallback, useMemo, useRef, useState } from "react";
import { View, TextInput, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import Screen from "../../../core/ui/Screen";
import { theme } from "../../../core/ui/theme";
import { Conversation } from "../../../features/messages/messagesData";
import { useConversations } from "../../../core/context/ConversationsContext";
import { AppText } from "../../../core/ui/AppText";
import { AppHeader } from "../../../core/ui/AppHeader";
import { Avatar } from "../../../core/ui/Avatar";
import { PressableScale } from "../../../core/ui/PressableScale";
import { SkeletonCard } from "../../../core/ui/SkeletonCard";
import { EmptyState } from "../../../core/ui/EmptyStateNew";

type RowProps = {
  item: Conversation;
  onPress: (id: string) => void;
};

const ConversationRow = memo(function ConversationRow({ item, onPress }: RowProps) {
  const hasUnread = item.unreadCount > 0;
  const display = item.isGroup
    ? { name: item.groupName || "Groupe", subtitle: `${item.participants.length} participants` }
    : { name: item.participants[0]?.name || "", subtitle: item.participants[0]?.handle || "" };

  return (
    <PressableScale onPress={() => onPress(item.id)} style={styles.conversationItem}>
      <View style={styles.avatarContainer}>
        <Avatar name={item.isGroup ? "G" : display.name} size={52} />
        {!item.isGroup && item.participants[0]?.isOnline ? <View style={styles.onlineIndicator} /> : null}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <AppText style={[styles.conversationName, hasUnread && styles.conversationNameUnread]}>{display.name}</AppText>
          <AppText variant="micro" style={[styles.conversationTime, hasUnread && styles.conversationTimeUnread]}>
            {item.lastMessage ? formatTime(item.lastMessage.createdAt) : ""}
          </AppText>
        </View>

        <View style={styles.conversationFooter}>
          <AppText
            variant="caption"
            muted={!hasUnread}
            style={[styles.conversationMessage, hasUnread && styles.conversationMessageUnread]}
            numberOfLines={1}
          >
            {item.lastMessage?.content || "Aucun message"}
          </AppText>
          {hasUnread ? (
            <View style={styles.unreadBadge}>
              <AppText variant="micro" style={styles.unreadBadgeText}>
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
});

function formatTime(date: string): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Maintenant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `${diffDays}j`;
  return messageDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MessagesScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { conversations } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 350);
      fadeAnim.setValue(0);
      slideAnim.setValue(16);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 90, friction: 10, useNativeDriver: true }),
      ]).start();
      return () => clearTimeout(t);
    }, [fadeAnim, slideAnim]),
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      if (conv.isGroup && conv.groupName) return conv.groupName.toLowerCase().includes(q);
      return conv.participants.some((p) => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
    });
  }, [conversations, searchQuery]);

  return (
    <Screen>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <AppHeader title="Messages" subtitle="Conversations et groupes" rightLabel="Nouveau" onRightPress={() => router.push("/(modals)/new-conversation")} />

        <BlurView intensity={30} tint="dark" style={styles.searchContainer}>
          <AppText style={styles.searchIcon}>🔍</AppText>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une conversation..."
            placeholderTextColor={"rgba(255,255,255,0.45)"}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 ? (
            <PressableScale onPress={() => setSearchQuery("")}>
              <AppText style={styles.clearButton}>×</AppText>
            </PressableScale>
          ) : null}
        </BlurView>

        {loading ? (
          <View style={{ gap: 10 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlashList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ConversationRow item={item} onPress={(id) => router.push({ pathname: "/messages/[id]", params: { id } })} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState title="Aucune conversation" description="Commence une conversation pour discuter." />}
          />
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: { color: "rgba(255,255,255,0.50)", fontSize: 20, padding: 2 },
  listContent: { paddingBottom: 80 },
  conversationItem: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#111111",
    borderRadius: theme.radius.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  avatarContainer: { position: "relative", marginRight: 12 },
  onlineIndicator: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34c759",
    borderWidth: 2,
    borderColor: "#16161b",
  },
  conversationContent: { flex: 1 },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversationName: { fontWeight: "700" },
  conversationNameUnread: { fontWeight: "800" },
  conversationTime: { color: "rgba(255,255,255,0.50)" },
  conversationTimeUnread: { color: "#6E5CFF" },
  conversationFooter: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  conversationMessage: { flex: 1 },
  conversationMessageUnread: { color: "#FFFFFF" },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#6E5CFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: "#fff", fontWeight: "800" },
});
