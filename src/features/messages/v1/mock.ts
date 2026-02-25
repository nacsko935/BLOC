export type ConversationPreview = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
};

export type DirectChatMessage = {
  id: string;
  senderId: "me" | "other";
  senderName: string;
  text: string;
  timestamp: string;
};

export type GroupPrivacy = "public" | "private";

export type WorkGroup = {
  groupId: string;
  name: string;
  description: string;
  track: string;
  privacy: GroupPrivacy;
  memberCount: number;
  lastMessage: string;
  lastActivity: string;
  unreadCount: number;
  avatarColor: string;
};

export type GroupChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
};

export const conversations: ConversationPreview[] = [
  {
    id: "sophie",
    name: "Sophie Laurent",
    lastMessage: "Tu as le PDF de BDD ?",
    timestamp: "09:42",
    unreadCount: 2,
    avatar: "SL",
  },
  {
    id: "martin",
    name: "Dr Martin",
    lastMessage: "Les notes du QCM sont en ligne.",
    timestamp: "Hier",
    unreadCount: 0,
    avatar: "DM",
  },
  {
    id: "alex",
    name: "Alex Dubois",
    lastMessage: "On se capte a la bibliotheque ?",
    timestamp: "Lun",
    unreadCount: 5,
    avatar: "AD",
  },
];

export const conversationMessages: Record<string, DirectChatMessage[]> = {
  sophie: [
    { id: "1", senderId: "other", senderName: "Sophie", text: "Salut !", timestamp: "09:38" },
    { id: "2", senderId: "me", senderName: "Moi", text: "Hello, tu vas bien ?", timestamp: "09:39" },
    { id: "3", senderId: "other", senderName: "Sophie", text: "Tu as le PDF de BDD ?", timestamp: "09:42" },
  ],
  martin: [
    { id: "1", senderId: "other", senderName: "Dr Martin", text: "Bonjour.", timestamp: "18:11" },
    { id: "2", senderId: "other", senderName: "Dr Martin", text: "Les notes du QCM sont en ligne.", timestamp: "18:12" },
  ],
  alex: [
    { id: "1", senderId: "me", senderName: "Moi", text: "Tu bosses sur le projet IA ?", timestamp: "14:01" },
    { id: "2", senderId: "other", senderName: "Alex", text: "Oui, j'avance.", timestamp: "14:04" },
    { id: "3", senderId: "other", senderName: "Alex", text: "On se capte a la bibliotheque ?", timestamp: "14:06" },
  ],
};

export const initialWorkGroups: WorkGroup[] = [
  {
    groupId: "grp-bdd",
    name: "BDD L3",
    description: "Exercices, annales et revision SQL.",
    track: "Licence 3",
    privacy: "public",
    memberCount: 18,
    lastMessage: "Quelqu'un a corrige la requete 7 ?",
    lastActivity: "11:12",
    unreadCount: 3,
    avatarColor: "#5546FF",
  },
  {
    groupId: "grp-algo",
    name: "Algo Avancee",
    description: "Sessions de travail sur graphes et complexite.",
    track: "Master 1",
    privacy: "private",
    memberCount: 11,
    lastMessage: "On fait un call ce soir 20h.",
    lastActivity: "Hier",
    unreadCount: 0,
    avatarColor: "#2A8CFF",
  },
];

export const groupMessagesById: Record<string, GroupChatMessage[]> = {
  "grp-bdd": [
    { id: "g1", senderId: "u1", senderName: "Sophie", text: "Je bloque sur les jointures.", timestamp: "10:48" },
    { id: "g2", senderId: "me", senderName: "Moi", text: "Tu veux qu'on regarde ensemble ?", timestamp: "10:51" },
    { id: "g3", senderId: "u2", senderName: "Yanis", text: "Quelqu'un a corrige la requete 7 ?", timestamp: "11:12" },
  ],
  "grp-algo": [
    { id: "g4", senderId: "u7", senderName: "Lea", text: "Je partage mes notes ce soir.", timestamp: "18:09" },
    { id: "g5", senderId: "u9", senderName: "Mehdi", text: "On fait un call ce soir 20h.", timestamp: "18:12" },
  ],
};
