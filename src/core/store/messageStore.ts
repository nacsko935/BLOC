import { create } from "zustand";
import { Conversation } from "../../features/messages/messagesData";

type MessageState = {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
};

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
}));
