import { create } from "zustand";
import { getSupabaseOrThrow } from "../lib/supabase";

export type AppNotification = {
  id: string;
  type: "message" | "follow" | "repost" | "like" | "comment" | "mention";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  from_user_id?: string;
  from_username?: string;
  from_avatar?: string | null;
  target_id?: string;
};

type NotifState = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  load: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  addLocal: (n: AppNotification) => void;
};

// Génère des notifs de démo si la table n'existe pas encore
const DEMO_NOTIFS: AppNotification[] = [
  {
    id: "n1", type: "follow", read: false,
    title: "Nouveau abonné",
    body: "nadia.dev a commencé à te suivre.",
    created_at: new Date(Date.now() - 300000).toISOString(),
    from_username: "nadia.dev",
  },
  {
    id: "n2", type: "like", read: false,
    title: "J'aime",
    body: "prof.martin a aimé ta publication.",
    created_at: new Date(Date.now() - 900000).toISOString(),
    from_username: "prof.martin",
  },
  {
    id: "n3", type: "comment", read: false,
    title: "Nouveau commentaire",
    body: "samir.ds a commenté : \"Très utile, merci !\"",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    from_username: "samir.ds",
  },
  {
    id: "n4", type: "repost", read: true,
    title: "Republication",
    body: "leila.ai a republié ta fiche React Native.",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    from_username: "leila.ai",
  },
  {
    id: "n5", type: "message", read: true,
    title: "Nouveau message",
    body: "bloc.team t'a envoyé un message.",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    from_username: "bloc.team",
  },
];

export const useNotificationsStore = create<NotifState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const supabase = getSupabaseOrThrow();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error || !data || data.length === 0) {
        // Fallback démo
        const unread = DEMO_NOTIFS.filter(n => !n.read).length;
        set({ notifications: DEMO_NOTIFS, unreadCount: unread, loading: false });
        return;
      }
      const notifs = data as AppNotification[];
      const unread = notifs.filter(n => !n.read).length;
      set({ notifications: notifs, unreadCount: unread, loading: false });
    } catch {
      const unread = DEMO_NOTIFS.filter(n => !n.read).length;
      set({ notifications: DEMO_NOTIFS, unreadCount: unread, loading: false });
    }
  },

  markRead: async (id: string) => {
    set(s => {
      const notifications = s.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter(n => !n.read).length;
      return { notifications, unreadCount };
    });
    try {
      const supabase = getSupabaseOrThrow();
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    } catch {}
  },

  markAllRead: async () => {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    try {
      const supabase = getSupabaseOrThrow();
      await supabase.from("notifications").update({ read: true }).eq("read", false);
    } catch {}
  },

  addLocal: (n: AppNotification) => {
    set(s => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    }));
  },
}));
