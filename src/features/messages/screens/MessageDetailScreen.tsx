import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { theme } from "../../../core/ui/theme";
import { AppText } from "../../../core/ui/AppText";
import {
  mockConversations,
  mockMessages,
  Message,
  Conversation,
} from "../messagesData";
import { useConversations } from "../../../core/context/ConversationsContext";

type MessageRowProps = {
  item: Message;
  isGroup: boolean;
};

const MessageRow = memo(function MessageRow({ item, isGroup }: MessageRowProps) {
  const isMe = item.senderId === "me";

  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.messageContainerMe : styles.messageContainerOther,
      ]}
    >
      {!isMe && (
        <View style={styles.messageAvatar}>
          <AppText style={styles.messageAvatarText}>{item.senderName.charAt(0)}</AppText>
        </View>
      )}

      <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
        {!isMe && isGroup ? <AppText style={styles.messageSender}>{item.senderName}</AppText> : null}
        <AppText style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
          {item.type === "file" ? `?? ${item.fileName ?? "Fichier"}` : item.content}
        </AppText>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <AppText style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeOther]}>
            {new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </AppText>
          {isMe ? (
            <AppText style={[styles.messageTime, styles.messageTimeMe]}>{item.isRead ? "Vu" : "Envoye"}</AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
});

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateLastMessage } = useConversations();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const conv = mockConversations.find((c) => c.id === id);
    setConversation(conv || null);
    setMessages(mockMessages[id || ""] || []);
  }, [id]);

  const display = useMemo(() => {
    if (!conversation) return { name: "", subtitle: "" };
    if (conversation.isGroup) {
      return {
        name: conversation.groupName || "Groupe",
        subtitle: `${conversation.participants.length} participants`,
      };
    }
    const participant = conversation.participants[0];
    return { name: participant.name, subtitle: participant.isOnline ? "En ligne" : "Hors ligne" };
  }, [conversation]);

  const pushMessage = (message: Message) => {
    if (!conversation) return;
    setMessages((prev) => [...prev, message]);
    updateLastMessage(conversation.id, message);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 40);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !conversation) return;

    pushMessage({
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: "me",
      senderName: "Moi",
      senderHandle: "@me",
      content: newMessage.trim(),
      type: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setNewMessage("");

    // Typing indicator mock for peer.
    setTyping(true);
    setTimeout(() => setTyping(false), 1500);
  };

  const sendAttachment = async () => {
    if (!conversation) return;
    const picked = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.[0]) return;
    const file = picked.assets[0];
    pushMessage({
      id: `msg-file-${Date.now()}`,
      conversationId: conversation.id,
      senderId: "me",
      senderName: "Moi",
      senderHandle: "@me",
      content: "",
      type: "file",
      fileUrl: file.uri,
      fileName: file.name,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AppText style={{ marginTop: 40, textAlign: "center" }}>Conversation non trouvee</AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.circleButton, pressed && styles.buttonPressed]}>
            <AppText style={{ fontSize: 22 }}>?</AppText>
          </Pressable>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={styles.headerName}>{display.name}</AppText>
            <AppText style={styles.headerSubtitle}>{display.subtitle}</AppText>
          </View>
          <Pressable
            onPress={() => Alert.alert("Infos", "Options de conversation disponibles bientot.")}
            style={({ pressed }) => [styles.circleButton, pressed && styles.buttonPressed]}
          >
            <AppText style={{ fontSize: 18 }}>?</AppText>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageRow item={item} isGroup={conversation.isGroup} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            typing ? (
              <View style={{ paddingLeft: 8, paddingTop: 6 }}>
                <AppText muted variant="caption">En train d'ecrire...</AppText>
              </View>
            ) : null
          }
        />

        <View style={styles.inputContainer}>
          <Pressable onPress={sendAttachment} style={({ pressed }) => [styles.attachButton, pressed && styles.buttonPressed]}>
            <AppText style={{ fontSize: 18 }}>+</AppText>
          </Pressable>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Message..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            style={({ pressed }) => [styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled, pressed && styles.buttonPressed]}
          >
            <AppText style={{ color: "#fff", fontWeight: "800" }}>?</AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: { opacity: 0.7 },
  headerName: { fontSize: 16, fontWeight: "800" },
  headerSubtitle: { color: theme.colors.textMuted, fontSize: 12 },
  messagesList: { paddingHorizontal: 14, paddingVertical: 14, flexGrow: 1 },
  messageContainer: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  messageContainerMe: { justifyContent: "flex-end" },
  messageContainerOther: { justifyContent: "flex-start" },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceElevated,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatarText: { fontSize: 13, fontWeight: "800" },
  messageBubble: { maxWidth: "76%", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  messageBubbleMe: { backgroundColor: theme.colors.accent, borderBottomRightRadius: 6 },
  messageBubbleOther: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 6 },
  messageSender: { color: theme.colors.textMuted, fontSize: 11, marginBottom: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: "#fff" },
  messageTextOther: { color: theme.colors.text },
  messageTime: { fontSize: 11 },
  messageTimeMe: { color: "rgba(255,255,255,0.75)" },
  messageTimeOther: { color: theme.colors.textMuted },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceElevated,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceElevated,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
});
