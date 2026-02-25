import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MessageBubble } from "../../src/features/messages/v1/components/MessageBubble";
import { DirectChatMessage, conversationMessages, conversations } from "../../src/features/messages/v1/mock";

function getStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getStringParam(params.id);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const listRef = useRef<FlatList<DirectChatMessage>>(null);

  const contactName = useMemo(
    () => conversations.find((conversation) => conversation.id === id)?.name || "Conversation",
    [id]
  );

  useEffect(() => {
    setMessages(conversationMessages[id] || []);
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const next: DirectChatMessage = {
      id: `local-${Date.now()}`,
      senderId: "me",
      senderName: "Moi",
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, next]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={20} color="#F5F5F5" />
          </Pressable>
          <Text style={styles.headerTitle}>{contactName}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble text={item.text} timestamp={item.timestamp} isMe={item.senderId === "me"} />
          )}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
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
          <Pressable
            onPress={send}
            style={({ pressed }) => [styles.sendButton, !input.trim() && styles.sendButtonDisabled, pressed && styles.pressed]}
            disabled={!input.trim()}
          >
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboard: {
    flex: 1,
  },
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#F5F5F5",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 34,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
    paddingBottom: 22,
  },
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
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  pressed: {
    opacity: 0.82,
  },
});
