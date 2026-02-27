import { create } from "zustand";
import {
  ChatMessage,
  GroupListItem,
  InboxItem,
  createGroup,
  fetchConversationMessages,
  fetchGroups,
  fetchInbox,
  joinGroup,
  leaveGroup,
  markConversationRead,
  sendMessage,
  subscribeToConversation,
} from "../lib/services/messageService";
import { track } from "../lib/services/analyticsService";

type MessagesState = {
  inbox: InboxItem[];
  groups: GroupListItem[];
  loading: boolean;
  loadingMessages: boolean;
  messagesByConversation: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  loadInbox: () => Promise<void>;
  loadGroups: () => Promise<void>;
  createGroup: (input: { name: string; description?: string; filiere?: string; privacy: "public" | "private" }) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  subscribeConversation: (conversationId: string) => () => void;
};

const pendingSendMap = new Set<string>();

export const useMessagesStore = create<MessagesState>((set, get) => ({
  inbox: [],
  groups: [],
  loading: false,
  loadingMessages: false,
  messagesByConversation: {},
  activeConversationId: null,

  loadInbox: async () => {
    set({ loading: true });
    try {
      const inbox = await fetchInbox();
      set({ inbox, loading: false });
    } catch {
      set({ loading: false, inbox: [] });
    }
  },

  loadGroups: async () => {
    set({ loading: true });
    try {
      const groups = await fetchGroups();
      set({ groups, loading: false });
    } catch {
      set({ loading: false, groups: [] });
    }
  },

  createGroup: async (input) => {
    await createGroup(input);
    await get().loadGroups();
    track("group_create", { name: input.name }).catch(() => null);
  },

  joinGroup: async (groupId) => {
    await joinGroup(groupId);
    await Promise.all([get().loadGroups(), get().loadInbox()]);
    track("group_join", { group_id: groupId }).catch(() => null);
  },

  leaveGroup: async (groupId) => {
    await leaveGroup(groupId);
    await Promise.all([get().loadGroups(), get().loadInbox()]);
  },

  openConversation: async (conversationId) => {
    set({ loadingMessages: true, activeConversationId: conversationId });
    const messages = await fetchConversationMessages(conversationId);
    set((state) => ({
      messagesByConversation: { ...state.messagesByConversation, [conversationId]: messages },
      loadingMessages: false,
    }));
  },

  sendMessage: async (conversationId, text) => {
    const key = `${conversationId}:${text}`;
    if (pendingSendMap.has(key)) return;
    pendingSendMap.add(key);
    try {
      await sendMessage(conversationId, text);
      await get().openConversation(conversationId);
      await get().loadInbox();
      await get().loadGroups();
      track("msg_send", { conversation_id: conversationId }).catch(() => null);
    } finally {
      pendingSendMap.delete(key);
    }
  },

  markRead: async (conversationId) => {
    await markConversationRead(conversationId);
    await get().loadInbox();
    await get().loadGroups();
  },

  subscribeConversation: (conversationId) => {
    return subscribeToConversation(conversationId, async () => {
      await get().openConversation(conversationId);
      await get().loadInbox();
      await get().loadGroups();
    });
  },
}));