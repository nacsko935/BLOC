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
import { MessageBubble } from "../../../src/features/messages/v1/components/MessageBubble";
import { GroupChatMessage, groupMessagesById, initialWorkGroups } from "../../../src/features/messages/v1/mock";

function getStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function GroupChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; name?: string | string[]; members?: string | string[] }>();
  const groupId = getStringParam(params.id);
  const groupNameParam = getStringParam(params.name);
  const membersParam = getStringParam(params.members);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const listRef = useRef<FlatList<GroupChatMessage>>(null);

  const groupMeta = useMemo(() => initialWorkGroups.find((group) => group.groupId === groupId), [groupId]);
  const groupName = groupNameParam || groupMeta?.name || "Groupe";
  const memberCount = Number(membersParam || groupMeta?.memberCount || 0);

  useEffect(() => {
    setMessages(groupMessagesById[groupId] || []);
  }, [groupId]);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const next: GroupChatMessage = {
      id: `g-local-${Date.now()}`,
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{groupName}</Text>
            <Text style={styles.headerSubtitle}>{memberCount} membres</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              text={item.text}
              timestamp={item.timestamp}
              isMe={item.senderId === "me"}
              senderName={item.senderName}
              showSender
            />
          )}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.composer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ecris dans le groupe..."
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#F5F5F5",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#8F8F99",
    fontSize: 12,
    marginTop: 2,
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
    backgroundColor: "#654BFF",
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
