// Types pour la messagerie
export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface Participant {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  accountType: 'student' | 'professor';
  isOnline: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderHandle: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
}

// Mock data pour les conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [
      {
        id: 'user1',
        name: 'Sophie Laurent',
        handle: '@sophie.l',
        accountType: 'student',
        isOnline: true,
      },
    ],
    lastMessage: {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'user1',
      senderName: 'Sophie Laurent',
      senderHandle: '@sophie.l',
      content: 'Salut ! T\'as compris l\'exercice 3 de BDD ? 🤔',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isGroup: false,
  },
  {
    id: 'conv2',
    participants: [
      {
        id: 'prof1',
        name: 'Dr. Martin',
        handle: '@m.martin',
        accountType: 'professor',
        isOnline: false,
      },
    ],
    lastMessage: {
      id: 'msg2',
      conversationId: 'conv2',
      senderId: 'prof1',
      senderName: 'Dr. Martin',
      senderHandle: '@m.martin',
      content: 'Les résultats du QCM sont disponibles sur la plateforme 👍',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isGroup: false,
  },
  {
    id: 'conv3',
    participants: [
      {
        id: 'user2',
        name: 'Alex Dubois',
        handle: '@alex.d',
        accountType: 'student',
        isOnline: true,
      },
      {
        id: 'user3',
        name: 'Marie Chen',
        handle: '@marie.c',
        accountType: 'student',
        isOnline: false,
      },
      {
        id: 'user4',
        name: 'Lucas Martin',
        handle: '@lucas.m',
        accountType: 'student',
        isOnline: true,
      },
    ],
    lastMessage: {
      id: 'msg3',
      conversationId: 'conv3',
      senderId: 'user2',
      senderName: 'Alex Dubois',
      senderHandle: '@alex.d',
      content: 'On se retrouve à la bib demain 15h ? 📚',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    },
    unreadCount: 5,
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isGroup: true,
    groupName: 'Groupe BDD 🗄️',
  },
  {
    id: 'conv4',
    participants: [
      {
        id: 'user5',
        name: 'Emma Rousseau',
        handle: '@emma.r',
        accountType: 'student',
        isOnline: false,
      },
    ],
    lastMessage: {
      id: 'msg4',
      conversationId: 'conv4',
      senderId: 'user5',
      senderName: 'Emma Rousseau',
      senderHandle: '@emma.r',
      content: 'Merci pour tes notes ! Elles sont super claires 🙏',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isGroup: false,
  },
  {
    id: 'conv5',
    participants: [
      {
        id: 'prof2',
        name: 'Pr. Dubois',
        handle: '@p.dubois',
        accountType: 'professor',
        isOnline: true,
      },
    ],
    lastMessage: {
      id: 'msg5',
      conversationId: 'conv5',
      senderId: 'prof2',
      senderName: 'Pr. Dubois',
      senderHandle: '@p.dubois',
      content: 'Rendez-vous demain 14h pour discuter de votre projet',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isGroup: false,
  },
];

// Mock messages pour une conversation
export const mockMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: 'msg1-1',
      conversationId: 'conv1',
      senderId: 'me',
      senderName: 'Moi',
      senderHandle: '@me',
      content: 'Salut Sophie ! Comment ça va ?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg1-2',
      conversationId: 'conv1',
      senderId: 'user1',
      senderName: 'Sophie Laurent',
      senderHandle: '@sophie.l',
      content: 'Ça va bien merci ! Et toi ?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg1-3',
      conversationId: 'conv1',
      senderId: 'me',
      senderName: 'Moi',
      senderHandle: '@me',
      content: 'Super ! Tu bosses sur quoi en ce moment ?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg1-4',
      conversationId: 'conv1',
      senderId: 'user1',
      senderName: 'Sophie Laurent',
      senderHandle: '@sophie.l',
      content: 'Les exercices de BDD, c\'est assez compliqué 😅',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg1-5',
      conversationId: 'conv1',
      senderId: 'user1',
      senderName: 'Sophie Laurent',
      senderHandle: '@sophie.l',
      content: 'Salut ! T\'as compris l\'exercice 3 de BDD ? 🤔',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ],
};
