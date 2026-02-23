import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockConversations, Conversation, Message } from '../../features/messages/messagesData';

interface ConversationsContextType {
  conversations: Conversation[];
  updateLastMessage: (conversationId: string, message: Message) => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

  const updateLastMessage = (conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: message.senderId === 'me' ? conv.unreadCount : conv.unreadCount + 1,
          };
        }
        return conv;
      })
    );
  };

  return (
    <ConversationsContext.Provider value={{ conversations, updateLastMessage }}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within ConversationsProvider');
  }
  return context;
}
