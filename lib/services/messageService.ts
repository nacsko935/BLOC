/**
 * messageService.ts — schéma BLOC v2
 *
 * conversations: id, participant_a, participant_b, type ('dm'|'group'),
 *                title, description, filiere, privacy, avatar_color, created_by, created_at
 * messages:      id, conversation_id, sender_id, content, media_url, media_type, created_at
 *
 * Pour les DM  → participant_a/participant_b remplis, type='dm'
 * Pour groupes → participant_a=created_by, participant_b=created_by (même valeur), type='group'
 *                Les membres sont dans group_members (id, group_id, user_id)
 */

import { getSupabaseOrThrow } from "../supabase";
import { Profile } from "../../types/db";

// ── Types ──────────────────────────────────────────────────────────────────────

export type InboxItem = {
  conversationId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  avatarUrl: string | null;
  otherUserId: string;
};

export type GroupListItem = {
  groupId: string;
  name: string;
  description: string;
  filiere: string | null;
  privacy: "public" | "private";
  memberCount: number;
  lastMessage: string;
  lastActivity: string;
  unreadCount: number;
  avatarColor: string;
  joined: boolean;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

async function requireUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const id = data.user?.id;
  if (!id) throw new Error("Session introuvable");
  return id;
}

function initials(label: string) {
  return label.split(" ").slice(0, 2).map(s => s.charAt(0).toUpperCase()).join("");
}

// ── fetchInbox ─────────────────────────────────────────────────────────────────

export async function fetchInbox(): Promise<InboxItem[]> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const { data: convs, error } = await supabase
    .from("conversations")
    .select("id, participant_a, participant_b, created_at")
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!convs || convs.length === 0) return [];

  const items = await Promise.all(
    convs.map(async (conv: any) => {
      const conversationId = conv.id as string;
      const otherId =
        conv.participant_a === userId ? conv.participant_b : conv.participant_a;

      const profileRes = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url")
        .eq("id", otherId)
        .maybeSingle();

      const profile = profileRes.data as Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
      const name = profile?.full_name || profile?.username || "Utilisateur";

      const lastMsgRes = await supabase
        .from("messages")
        .select("id,content,created_at,sender_id")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastMsg = lastMsgRes.data;
      const lastMessage = lastMsg?.content || "Aucun message";
      const timestamp = lastMsg?.created_at
        ? new Date(lastMsg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "";

      return {
        conversationId,
        name,
        lastMessage,
        timestamp,
        unreadCount: 0,
        avatar: initials(name),
        avatarUrl: profile?.avatar_url ?? null,
        otherUserId: otherId,
      } as InboxItem;
    })
  );

  return items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

// ── fetchGroups ────────────────────────────────────────────────────────────────

export async function fetchGroups(): Promise<GroupListItem[]> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  // Tous les groupes publics
  const { data: allGroups, error: groupsError } = await supabase
    .from("groups")
    .select("id, name, description, filiere, privacy, avatar_color, created_at")
    .order("created_at", { ascending: false });

  if (groupsError) {
    // Table groups n'existe pas encore → retourner []
    console.warn("groups table not found:", groupsError.message);
    return [];
  }

  if (!allGroups || allGroups.length === 0) return [];

  // Groupes dont je suis membre
  const { data: myMemberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  const myGroupIds = new Set((myMemberships ?? []).map((m: any) => m.group_id));

  const items = await Promise.all(
    allGroups.map(async (group: any) => {
      const groupId = group.id as string;
      const joined = myGroupIds.has(groupId);

      const [memberCountRes, lastMessageRes] = await Promise.all([
        supabase
          .from("group_members")
          .select("user_id", { count: "exact", head: true })
          .eq("group_id", groupId),
        supabase
          .from("group_messages")
          .select("content,created_at")
          .eq("group_id", groupId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        groupId,
        name: group.name || "Groupe",
        description: group.description || "",
        filiere: group.filiere ?? null,
        privacy: (group.privacy || "public") as "public" | "private",
        memberCount: memberCountRes.count || 0,
        lastMessage: lastMessageRes.data?.content || "Aucun message",
        lastActivity: lastMessageRes.data?.created_at
          ? new Date(lastMessageRes.data.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "",
        unreadCount: 0,
        avatarColor: group.avatar_color || "#654BFF",
        joined,
      } as GroupListItem;
    })
  );

  return items;
}

// ── createGroup ────────────────────────────────────────────────────────────────

export async function createGroup(input: {
  name: string;
  description?: string;
  filiere?: string;
  privacy: "public" | "private";
}): Promise<string> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      filiere: input.filiere?.trim() || null,
      privacy: input.privacy,
      avatar_color: ["#654BFF","#2A8CFF","#7C52FF","#4A7BFF","#FF6B6B"][Math.floor(Math.random()*5)],
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw error;

  const groupId = data.id as string;

  // Ajouter le créateur comme membre
  await supabase.from("group_members").insert({ group_id: groupId, user_id: userId });

  return groupId;
}

// ── joinGroup ──────────────────────────────────────────────────────────────────

export async function joinGroup(groupId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("group_members")
    .upsert({ group_id: groupId, user_id: userId }, { onConflict: "group_id,user_id" });
  if (error) throw error;
}

// ── leaveGroup ─────────────────────────────────────────────────────────────────

export async function leaveGroup(groupId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── fetchConversationMessages ─────────────────────────────────────────────────

export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,content,media_url,media_type,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const senderIds = Array.from(new Set(rows.map((m: any) => m.sender_id)));

  let profileMap = new Map<string, Profile>();
  if (senderIds.length > 0) {
    const profilesRes = await supabase
      .from("profiles")
      .select("id,username,full_name,avatar_url")
      .in("id", senderIds);
    if (!profilesRes.error) {
      profileMap = new Map((profilesRes.data ?? []).map((p: any) => [p.id, p as Profile]));
    }
  }

  return rows.map((message: any) => {
    const profile = profileMap.get(message.sender_id);
    return {
      id: message.id,
      senderId: message.sender_id,
      senderName: profile?.full_name || profile?.username || "Utilisateur",
      text: message.content || "",
      timestamp: new Date(message.created_at).toLocaleTimeString("fr-FR", {
        hour: "2-digit", minute: "2-digit",
      }),
      mediaUrl: message.media_url ?? null,
      mediaType: message.media_type ?? null,
    } as ChatMessage;
  });
}

// ── fetchGroupMessages ─────────────────────────────────────────────────────────

export async function fetchGroupMessages(groupId: string): Promise<ChatMessage[]> {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("group_messages")
    .select("id,sender_id,content,created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("group_messages table:", error.message);
    return [];
  }

  const rows = data ?? [];
  const senderIds = Array.from(new Set(rows.map((m: any) => m.sender_id)));
  let profileMap = new Map<string, Profile>();

  if (senderIds.length > 0) {
    const res = await supabase.from("profiles").select("id,username,full_name,avatar_url").in("id", senderIds);
    if (!res.error) profileMap = new Map((res.data ?? []).map((p: any) => [p.id, p as Profile]));
  }

  return rows.map((m: any) => {
    const p = profileMap.get(m.sender_id);
    return {
      id: m.id,
      senderId: m.sender_id,
      senderName: p?.full_name || p?.username || "Utilisateur",
      text: m.content || "",
      timestamp: new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    } as ChatMessage;
  });
}

// ── sendMessage ───────────────────────────────────────────────────────────────

export async function sendMessage(conversationId: string, content: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: userId,
    content: content.trim(),
  });
  if (error) throw error;
}

// ── sendGroupMessage ───────────────────────────────────────────────────────────

export async function sendGroupMessage(groupId: string, content: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("group_messages").insert({
    group_id: groupId,
    sender_id: userId,
    content: content.trim(),
  });
  if (error) throw error;
}

// ── markConversationRead ──────────────────────────────────────────────────────

export async function markConversationRead(_conversationId: string): Promise<void> {
  // Pas de last_read_at dans le schéma simplifié — no-op
}

// ── ensureDmConversation ──────────────────────────────────────────────────────

export async function ensureDmConversation(otherUserId: string): Promise<string> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  // Chercher conversation DM existante dans les deux sens
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_a.eq.${userId},participant_b.eq.${otherUserId}),` +
      `and(participant_a.eq.${otherUserId},participant_b.eq.${userId})`
    )
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  // Créer nouvelle conversation DM
  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ participant_a: userId, participant_b: otherUserId })
    .select("id")
    .single();

  if (error) throw error;
  return created.id as string;
}

// ── subscribeToConversation ───────────────────────────────────────────────────

export function subscribeToConversation(
  conversationId: string,
  onMessageInserted: () => void
): () => void {
  const supabase = getSupabaseOrThrow();
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    }, () => onMessageInserted())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── subscribeToGroup ──────────────────────────────────────────────────────────

export function subscribeToGroup(
  groupId: string,
  onMessageInserted: () => void
): () => void {
  const supabase = getSupabaseOrThrow();
  const channel = supabase
    .channel(`group-messages-${groupId}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "group_messages",
      filter: `group_id=eq.${groupId}`,
    }, () => onMessageInserted())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
