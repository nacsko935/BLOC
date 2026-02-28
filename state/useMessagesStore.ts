import { create } from "zustand";
import {
  ChatMessage,
  GroupListItem,
  InboxItem,
  createGroup,
  fetchConversationMessages,
  fetchGroupMessages,
  fetchGroups,
  fetchInbox,
  joinGroup,
  leaveGroup,
  markConversationRead,
  sendMessage,
  sendGroupMessage,
  subscribeToConversation,
  subscribeToGroup,
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
  openGroup: (groupId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  sendGroupMessage: (groupId: string, text: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  subscribeConversation: (conversationId: string) => () => void;
  subscribeGroup: (groupId: string) => () => void;
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
      set({ groups: [], loading: false });
    }
  },

  createGroup: async (input) => {
    await createGroup(input);
    await get().loadGroups();
    track("group_create", { name: input.name }).catch(() => null);
  },

  joinGroup: async (groupId) => {
    await joinGroup(groupId);
    await get().loadGroups();
    track("group_join", { group_id: groupId }).catch(() => null);
  },

  leaveGroup: async (groupId) => {
    await leaveGroup(groupId);
    await get().loadGroups();
  },

  openConversation: async (conversationId) => {
    set({ loadingMessages: true, activeConversationId: conversationId });
    try {
      const messages = await fetchConversationMessages(conversationId);
      set(state => ({
        messagesByConversation: { ...state.messagesByConversation, [conversationId]: messages },
        loadingMessages: false,
      }));
    } catch {
      set({ loadingMessages: false });
    }
  },

  openGroup: async (groupId) => {
    set({ loadingMessages: true, activeConversationId: groupId });
    try {
      const messages = await fetchGroupMessages(groupId);
      set(state => ({
        messagesByConversation: { ...state.messagesByConversation, [groupId]: messages },
        loadingMessages: false,
      }));
    } catch {
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (conversationId, text) => {
    const key = `dm:${conversationId}:${text}`;
    if (pendingSendMap.has(key)) return;
    pendingSendMap.add(key);
    try {
      await sendMessage(conversationId, text);
      await get().openConversation(conversationId);
      await get().loadInbox();
      track("msg_send", { conversation_id: conversationId }).catch(() => null);
    } finally {
      pendingSendMap.delete(key);
    }
  },

  sendGroupMessage: async (groupId, text) => {
    const key = `group:${groupId}:${text}`;
    if (pendingSendMap.has(key)) return;
    pendingSendMap.add(key);
    try {
      await sendGroupMessage(groupId, text);
      await get().openGroup(groupId);
      track("group_msg_send", { group_id: groupId }).catch(() => null);
    } finally {
      pendingSendMap.delete(key);
    }
  },

  markRead: async (conversationId) => {
    await markConversationRead(conversationId);
    await get().loadInbox();
  },

  subscribeConversation: (conversationId) => {
    return subscribeToConversation(conversationId, async () => {
      await get().openConversation(conversationId);
      await get().loadInbox();
    });
  },

  subscribeGroup: (groupId) => {
    return subscribeToGroup(groupId, async () => {
      await get().openGroup(groupId);
    });
  },
}));
