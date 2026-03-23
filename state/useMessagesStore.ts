import { create } from "zustand";
import {
  ChatMessage, GroupListItem, InboxItem, GroupMember,
  createGroup, fetchConversationMessages, fetchGroupMessages,
  fetchGroups, fetchInbox, joinGroup, leaveGroup,
  markConversationRead, sendMessage, sendMediaMessage,
  sendGroupMessage, sendGroupMediaMessage, subscribeToConversation,
  subscribeToGroup, fetchGroupMembers, addGroupMember,
  removeGroupMember, promoteToAdmin,
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
  sendMediaMessage: (conversationId: string, mediaUrl: string, mediaType: "audio"|"image"|"video"|"file") => Promise<void>;
  sendGroupMessage: (groupId: string, text: string) => Promise<void>;
  sendGroupMediaMessage: (groupId: string, mediaUrl: string, mediaType: "audio"|"image"|"video"|"file") => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  subscribeConversation: (conversationId: string) => () => void;
  subscribeGroup: (groupId: string) => () => void;
  fetchGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  addGroupMember: (groupId: string, userId: string) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  promoteToAdmin: (groupId: string, userId: string) => Promise<void>;
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
    try { const inbox = await fetchInbox(); set({ inbox, loading: false }); }
    catch { set({ loading: false, inbox: [] }); }
  },

  loadGroups: async () => {
    set({ loading: true });
    try { const groups = await fetchGroups(); set({ groups, loading: false }); }
    catch { set({ groups: [], loading: false }); }
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
      set(state => ({ messagesByConversation: { ...state.messagesByConversation, [conversationId]: messages }, loadingMessages: false }));
    } catch { set({ loadingMessages: false }); }
  },

  openGroup: async (groupId) => {
    set({ loadingMessages: true, activeConversationId: groupId });
    try {
      const messages = await fetchGroupMessages(groupId);
      set(state => ({ messagesByConversation: { ...state.messagesByConversation, [groupId]: messages }, loadingMessages: false }));
    } catch { set({ loadingMessages: false }); }
  },

  sendMessage: async (conversationId, text) => {
    const key = `dm:${conversationId}:${text}:${Date.now()}`;
    if (pendingSendMap.has(`dm:${conversationId}:${text}`)) return;
    pendingSendMap.add(`dm:${conversationId}:${text}`);
    try {
      await sendMessage(conversationId, text);
      await get().openConversation(conversationId);
      await get().loadInbox();
      track("msg_send", { conversation_id: conversationId }).catch(() => null);
    } finally { pendingSendMap.delete(`dm:${conversationId}:${text}`); }
  },

  sendMediaMessage: async (conversationId, mediaUrl, mediaType) => {
    await sendMediaMessage(conversationId, mediaUrl, mediaType);
    await get().openConversation(conversationId);
    await get().loadInbox();
  },

  sendGroupMessage: async (groupId, text) => {
    const key = `group:${groupId}:${text}`;
    if (pendingSendMap.has(key)) return;
    pendingSendMap.add(key);
    try {
      await sendGroupMessage(groupId, text);
      await get().openGroup(groupId);
      track("group_msg_send", { group_id: groupId }).catch(() => null);
    } finally { pendingSendMap.delete(key); }
  },

  sendGroupMediaMessage: async (groupId, mediaUrl, mediaType) => {
    await sendGroupMediaMessage(groupId, mediaUrl, mediaType);
    await get().openGroup(groupId);
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

  fetchGroupMembers: (groupId) => fetchGroupMembers(groupId),
  addGroupMember:   (groupId, userId) => addGroupMember(groupId, userId),
  removeGroupMember: (groupId, userId) => removeGroupMember(groupId, userId),
  promoteToAdmin:   (groupId, userId) => promoteToAdmin(groupId, userId),
}));
