import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MessageBubble } from "../../src/features/messages/v1/components/MessageBubble";
import { useMessagesStore } from "../../state/useMessagesStore";
import { useAuthStore } from "../../state/useAuthStore";
import { AppButton } from "../../src/core/ui/AppButton";
import * as Haptics from "expo-haptics";

function getStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getStringParam(params.id);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const { user } = useAuthStore();
  const { inbox, messagesByConversation, openConversation, sendMessage, subscribeConversation, markRead, loadingMessages } = useMessagesStore();

  const messages = messagesByConversation[id] || [];
  const contactName = useMemo(
    () => inbox.find((conversation) => conversation.conversationId === id)?.name || "Conversation",
    [id, inbox]
  );

  useEffect(() => {
    if (!id) return;
    openConversation(id).catch(() => null);
    markRead(id).catch(() => null);
    const unsubscribe = subscribeConversation(id);
    return unsubscribe;
  }, [id, openConversation, subscribeConversation, markRead]);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const send = async () => {
    const text = input.trim();
    if (!text || !id || sending) return;

    try {
      setSending(true);
      await sendMessage(id, text);
      Haptics.selectionAsync().catch(() => null);
      setInput("");
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible d'envoyer le message");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <AppButton variant="secondary" onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={20} color="#F5F5F5" />
          </AppButton>
          <Text style={styles.headerTitle}>{contactName}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble text={item.text} timestamp={item.timestamp} isMe={item.senderId === user?.id} senderName={item.senderName} />
          )}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loadingMessages ? <Text style={styles.empty}>Chargement...</Text> : <Text style={styles.empty}>Aucun message</Text>
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ecris un message..."
            placeholderTextColor="#6E6E77"
            style={styles.input}
            multiline
          />
          <AppButton loading={sending} onPress={send} style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} disabled={!input.trim() || sending}>
            Envoyer
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  keyboard: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#17171D",
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#16161C",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, textAlign: "center", color: "#F5F5F5", fontSize: 18, fontWeight: "700" },
  headerSpacer: { width: 34 },
  messagesContent: { paddingHorizontal: 12, paddingVertical: 14, gap: 8, paddingBottom: 22 },
  empty: { color: "#8F8F99", textAlign: "center", marginTop: 20 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#17171D",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    backgroundColor: "#09090C",
  },
  input: {
    flex: 1,
    backgroundColor: "#14141A",
    borderWidth: 1,
    borderColor: "#22222B",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F5F5F5",
    maxHeight: 110,
  },
  sendButton: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C7BFF",
  },
  sendButtonDisabled: { opacity: 0.45 },
  sendButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
});
