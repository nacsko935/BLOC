/**
 * messageService.ts — BLOC v2 (patché)
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
  if (!id) throw new Error("Session introuvable. Reconnecte-toi.");
  return id;
}

function initials(label: string) {
  return label.split(" ").slice(0, 2).map(s => s.charAt(0).toUpperCase()).join("");
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
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

  // Batch fetch profils
  const otherIds = Array.from(new Set(
    convs.map((c: any) => c.participant_a === userId ? c.participant_b : c.participant_a)
  ));
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id,username,full_name,avatar_url")
    .in("id", otherIds);
  const profileMap = new Map((profilesData ?? []).map((p: any) => [p.id, p]));

  // Batch fetch derniers messages
  const convIds = convs.map((c: any) => c.id);
  const { data: lastMsgsData } = await supabase
    .from("messages")
    .select("id,conversation_id,content,created_at")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  const lastMsgByConv = new Map<string, any>();
  for (const msg of (lastMsgsData ?? [])) {
    if (!lastMsgByConv.has(msg.conversation_id)) {
      lastMsgByConv.set(msg.conversation_id, msg);
    }
  }

  const items: InboxItem[] = convs.map((conv: any) => {
    const conversationId = conv.id as string;
    const otherId = conv.participant_a === userId ? conv.participant_b : conv.participant_a;
    const profile = profileMap.get(otherId);
    const name = profile?.full_name || profile?.username || "Utilisateur";
    const lastMsg = lastMsgByConv.get(conversationId);
    return {
      conversationId,
      name,
      lastMessage: lastMsg?.content || "Aucun message",
      timestamp: lastMsg?.created_at ? formatTimestamp(lastMsg.created_at) : "",
      unreadCount: 0,
      avatar: initials(name),
      avatarUrl: profile?.avatar_url ?? null,
      otherUserId: otherId,
    };
  });

  return items.sort((a, b) => {
    const getMs = (item: InboxItem) => {
      const lastMsg = lastMsgByConv.get(item.conversationId);
      const conv = convs.find((c: any) => c.id === item.conversationId);
      return new Date(lastMsg?.created_at || conv?.created_at || 0).getTime();
    };
    return getMs(b) - getMs(a);
  });
}

// ── fetchGroups ────────────────────────────────────────────────────────────────

export async function fetchGroups(): Promise<GroupListItem[]> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const { data: allGroups, error: groupsError } = await supabase
    .from("groups")
    .select("id, name, description, filiere, privacy, avatar_color, created_at")
    .order("created_at", { ascending: false });

  if (groupsError) { console.warn("groups error:", groupsError.message); return []; }
  if (!allGroups || allGroups.length === 0) return [];

  const groupIds = allGroups.map((g: any) => g.id);

  // Mes appartenances
  const { data: myMemberships } = await supabase
    .from("group_members").select("group_id").eq("user_id", userId);
  const myGroupIds = new Set((myMemberships ?? []).map((m: any) => m.group_id));

  // Comptage membres (batch)
  const { data: membersData } = await supabase
    .from("group_members").select("group_id").in("group_id", groupIds);
  const memberCountMap = new Map<string, number>();
  for (const m of (membersData ?? [])) {
    memberCountMap.set(m.group_id, (memberCountMap.get(m.group_id) || 0) + 1);
  }

  // Derniers messages (batch)
  const { data: lastGroupMsgs } = await supabase
    .from("group_messages").select("group_id,content,created_at")
    .in("group_id", groupIds).order("created_at", { ascending: false });
  const lastGroupMsgMap = new Map<string, any>();
  for (const msg of (lastGroupMsgs ?? [])) {
    if (!lastGroupMsgMap.has(msg.group_id)) lastGroupMsgMap.set(msg.group_id, msg);
  }

  return allGroups.map((group: any) => {
    const groupId = group.id as string;
    const lastMsg = lastGroupMsgMap.get(groupId);
    return {
      groupId,
      name: group.name || "Groupe",
      description: group.description || "",
      filiere: group.filiere ?? null,
      privacy: (group.privacy || "public") as "public" | "private",
      memberCount: memberCountMap.get(groupId) || 0,
      lastMessage: lastMsg?.content || "Aucun message",
      lastActivity: lastMsg?.created_at ? formatTimestamp(lastMsg.created_at) : "",
      unreadCount: 0,
      avatarColor: group.avatar_color || "#654BFF",
      joined: myGroupIds.has(groupId),
    } as GroupListItem;
  });
}

// ── createGroup ────────────────────────────────────────────────────────────────

export async function createGroup(input: {
  name: string; description?: string; filiere?: string; privacy: "public" | "private";
}): Promise<string> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const colors = ["#654BFF", "#2A8CFF", "#7C52FF", "#4A7BFF", "#FF6B6B"];
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      filiere: input.filiere?.trim() || null,
      privacy: input.privacy,
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
      created_by: userId,
    })
    .select("id").single();

  if (error) throw error;

  const groupId = data.id as string;
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
  const { error } = await supabase.from("group_members")
    .delete().eq("group_id", groupId).eq("user_id", userId);
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
  let profileMap = new Map<string, any>();
  if (senderIds.length > 0) {
    const res = await supabase.from("profiles")
      .select("id,username,full_name,avatar_url").in("id", senderIds);
    if (!res.error) profileMap = new Map((res.data ?? []).map((p: any) => [p.id, p]));
  }

  return rows.map((m: any) => {
    const p = profileMap.get(m.sender_id);
    return {
      id: m.id,
      senderId: m.sender_id,
      senderName: p?.full_name || p?.username || "Utilisateur",
      text: m.content || "",
      timestamp: new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      mediaUrl: m.media_url ?? null,
      mediaType: m.media_type ?? null,
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

  if (error) { console.warn("group_messages error:", error.message); return []; }

  const rows = data ?? [];
  const senderIds = Array.from(new Set(rows.map((m: any) => m.sender_id)));
  let profileMap = new Map<string, any>();
  if (senderIds.length > 0) {
    const res = await supabase.from("profiles")
      .select("id,username,full_name,avatar_url").in("id", senderIds);
    if (!res.error) profileMap = new Map((res.data ?? []).map((p: any) => [p.id, p]));
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
  if (error) {
    console.error("sendGroupMessage error:", error.message, error.code);
    throw error;
  }
}

// ── markConversationRead ──────────────────────────────────────────────────────

export async function markConversationRead(_conversationId: string): Promise<void> {
  // no-op (pas de champ last_read_at dans ce schéma)
}

// ── ensureDmConversation ──────────────────────────────────────────────────────

export async function ensureDmConversation(otherUserId: string): Promise<string> {
  const supabase = getSupabaseOrThrow();

  // Utiliser la fonction RPC atomique (définie dans MESSAGING_FIX.sql)
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_or_create_dm", {
    other_user_id: otherUserId,
  });

  if (!rpcError && rpcData) return rpcData as string;

  // Fallback client-side si RPC non déployé
  console.warn("Fallback client ensureDmConversation:", rpcError?.message);
  const userId = await requireUserId();

  const { data: existing } = await supabase
    .from("conversations").select("id")
    .or(
      `and(participant_a.eq.${userId},participant_b.eq.${otherUserId}),` +
      `and(participant_a.eq.${otherUserId},participant_b.eq.${userId})`
    )
    .limit(1).maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ participant_a: userId, participant_b: otherUserId })
    .select("id").single();

  if (error) {
    if (error.code === "23505") {
      // Race condition : retry
      const { data: retry } = await supabase
        .from("conversations").select("id")
        .or(
          `and(participant_a.eq.${userId},participant_b.eq.${otherUserId}),` +
          `and(participant_a.eq.${otherUserId},participant_b.eq.${userId})`
        )
        .limit(1).maybeSingle();
      if (retry?.id) return retry.id as string;
    }
    throw error;
  }

  return created.id as string;
}

// ── subscribeToConversation ───────────────────────────────────────────────────

export function subscribeToConversation(
  conversationId: string,
  onMessageInserted: () => void
): () => void {
  const supabase = getSupabaseOrThrow();
  const channel = supabase
    .channel(`conv:${conversationId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    }, () => onMessageInserted())
    .subscribe((status) => {
      console.log(`[Realtime] conv:${conversationId} →`, status);
    });

  return () => { supabase.removeChannel(channel); };
}

// ── subscribeToGroup ──────────────────────────────────────────────────────────

export function subscribeToGroup(
  groupId: string,
  onMessageInserted: () => void
): () => void {
  const supabase = getSupabaseOrThrow();
  const channel = supabase
    .channel(`group:${groupId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "group_messages",
      filter: `group_id=eq.${groupId}`,
    }, () => onMessageInserted())
    .subscribe((status) => {
      console.log(`[Realtime] group:${groupId} →`, status);
    });

  return () => { supabase.removeChannel(channel); };
}
