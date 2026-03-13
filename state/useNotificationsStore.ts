import { create } from "zustand";
import { getSupabaseOrThrow } from "../lib/supabase";

export type AppNotification = {
  id: string;
  type: "message" | "follow" | "repost" | "like" | "comment" | "mention" | "reaction";
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
  subscribed: boolean;
  load: (userId: string) => Promise<void>;
  subscribe: (userId: string) => () => void;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  addLocal: (n: AppNotification) => void;
};

export const useNotificationsStore = create<NotifState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  subscribed: false,

  load: async (userId: string) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const supabase = getSupabaseOrThrow();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        // Table might not exist yet - show empty state
        set({ notifications: [], unreadCount: 0, loading: false });
        return;
      }

      const notifs = (data || []) as AppNotification[];
      set({
        notifications: notifs,
        unreadCount: notifs.filter(n => !n.read).length,
        loading: false,
      });
    } catch {
      set({ notifications: [], unreadCount: 0, loading: false });
    }
  },

  subscribe: (userId: string) => {
    if (!userId || get().subscribed) return () => {};
    try {
      const supabase = getSupabaseOrThrow();
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const n = payload.new as AppNotification;
          set(state => ({
            notifications: [n, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        })
        .subscribe();

      set({ subscribed: true });
      return () => {
        supabase.removeChannel(channel);
        set({ subscribed: false });
      };
    } catch {
      return () => {};
    }
  },

  markAllRead: async () => {
    const { notifications } = get();
    const unread = notifications.filter(n => !n.read).map(n => n.id);
    if (!unread.length) return;
    try {
      const supabase = getSupabaseOrThrow();
      await supabase.from("notifications").update({ read: true }).in("id", unread);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  markRead: async (id: string) => {
    try {
      const supabase = getSupabaseOrThrow();
      await supabase.from("notifications").update({ read: true }).eq("id", id);
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  addLocal: (n: AppNotification) => {
    set(state => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

// Helper to insert a notification in Supabase (called from actions like like, comment, etc.)
export async function sendNotification(opts: {
  toUserId: string;
  fromUserId: string;
  type: AppNotification["type"];
  title: string;
  body: string;
  targetId?: string;
}) {
  try {
    const supabase = getSupabaseOrThrow();
    await supabase.from("notifications").insert({
      user_id: opts.toUserId,
      from_user_id: opts.fromUserId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      target_id: opts.targetId,
      read: false,
    });
  } catch {}
}
