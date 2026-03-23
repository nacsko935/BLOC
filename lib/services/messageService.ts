/**
 * messageService.ts — BLOC v3
 * Audio upload, présence, groupes privés, statuts
 */

import { getSupabaseOrThrow } from "../supabase";

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
  isAdmin?: boolean;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  text: string;
  timestamp: string;
  mediaUrl?: string | null;
  mediaType?: "audio" | "image" | "video" | "file" | null;
  status?: "sent" | "delivered" | "read";
  replyTo?: { id: string; text: string; senderName: string } | null;
  deleted?: boolean;
};

export type GroupMember = {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  role: "admin" | "member";
  joinedAt: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Upload audio vers Supabase Storage ───────────────────────────────────────

export async function uploadAudioMessage(localUri: string, userId: string): Promise<string> {
  const supabase = getSupabaseOrThrow();
  const filename = `${userId}/${Date.now()}.m4a`;

  // Lire le fichier via XHR — fetch() ne fonctionne pas avec file:// sur Android
  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", localUri);
    xhr.responseType = "blob";
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error("Impossible de lire le fichier audio"));
    xhr.send();
  });

  const { data, error } = await supabase.storage
    .from("messages-media")
    .upload(filename, blob, { contentType: "audio/m4a", upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("messages-media")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

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

  const otherIds = Array.from(new Set(
    convs.map((c: any) => c.participant_a === userId ? c.participant_b : c.participant_a)
  ));
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id,username,full_name,avatar_url")
    .in("id", otherIds);
  const profileMap = new Map((profilesData ?? []).map((p: any) => [p.id, p]));

  const convIds = convs.map((c: any) => c.id);
  const { data: lastMsgsData } = await supabase
    .from("messages")
    .select("id,conversation_id,content,media_type,created_at,status")
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
    let lastText = lastMsg?.content || "Aucun message";
    if (lastMsg?.media_type === "audio") lastText = "🎵 Message vocal";
    if (lastMsg?.media_type === "image") lastText = "📷 Photo";
    if (lastMsg?.media_type === "video") lastText = "🎥 Vidéo";
    if (lastMsg?.media_type === "file")  lastText = "📎 Fichier";
    return {
      conversationId,
      name,
      lastMessage: lastText,
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

// ── Groupes ───────────────────────────────────────────────────────────────────

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

  const { data: myMemberships } = await supabase
    .from("group_members").select("group_id,role").eq("user_id", userId);
  const myGroupMap = new Map((myMemberships ?? []).map((m: any) => [m.group_id, m.role]));

  const { data: membersData } = await supabase
    .from("group_members").select("group_id").in("group_id", groupIds);
  const memberCountMap = new Map<string, number>();
  for (const m of (membersData ?? [])) {
    memberCountMap.set(m.group_id, (memberCountMap.get(m.group_id) || 0) + 1);
  }

  const { data: lastGroupMsgs } = await supabase
    .from("group_messages").select("group_id,content,media_type,created_at")
    .in("group_id", groupIds).order("created_at", { ascending: false });
  const lastGroupMsgMap = new Map<string, any>();
  for (const msg of (lastGroupMsgs ?? [])) {
    if (!lastGroupMsgMap.has(msg.group_id)) lastGroupMsgMap.set(msg.group_id, msg);
  }

  return allGroups.map((group: any) => {
    const groupId = group.id as string;
    const lastMsg = lastGroupMsgMap.get(groupId);
    let lastText = lastMsg?.content || "Aucun message";
    if (lastMsg?.media_type === "audio") lastText = "🎵 Message vocal";
    if (lastMsg?.media_type === "image") lastText = "📷 Photo";
    return {
      groupId,
      name: group.name || "Groupe",
      description: group.description || "",
      filiere: group.filiere ?? null,
      privacy: (group.privacy || "public") as "public" | "private",
      memberCount: memberCountMap.get(groupId) || 0,
      lastMessage: lastText,
      lastActivity: lastMsg?.created_at ? formatTimestamp(lastMsg.created_at) : "",
      unreadCount: 0,
      avatarColor: group.avatar_color || "#654BFF",
      joined: myGroupMap.has(groupId),
      isAdmin: myGroupMap.get(groupId) === "admin",
    } as GroupListItem;
  });
}

export async function createGroup(input: {
  name: string; description?: string; filiere?: string; privacy: "public" | "private";
}): Promise<string> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const colors = ["#654BFF","#2A8CFF","#7C52FF","#4A7BFF","#FF6B6B"];
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
  // Créateur = admin
  await supabase.from("group_members").insert({ group_id: groupId, user_id: userId, role: "admin" });
  return groupId;
}

export async function joinGroup(groupId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("group_members")
    .upsert({ group_id: groupId, user_id: userId, role: "member" }, { onConflict: "group_id,user_id" });
  if (error) throw error;
}

export async function leaveGroup(groupId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("group_members")
    .delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("group_members")
    .select("user_id, role, joined_at, profiles:user_id(username, full_name, avatar_url)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    userId: row.user_id,
    username: row.profiles?.username || "",
    fullName: row.profiles?.full_name || row.profiles?.username || "Utilisateur",
    avatarUrl: row.profiles?.avatar_url ?? null,
    role: row.role as "admin" | "member",
    joinedAt: row.joined_at,
  }));
}

export async function addGroupMember(groupId: string, userId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("group_members")
    .upsert({ group_id: groupId, user_id: userId, role: "member" }, { onConflict: "group_id,user_id" });
  if (error) throw error;
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("group_members")
    .delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

export async function promoteToAdmin(groupId: string, userId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("group_members")
    .update({ role: "admin" }).eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

// ── Messages DM ───────────────────────────────────────────────────────────────

export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,content,media_url,media_type,status,created_at")
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
      senderAvatar: p?.avatar_url ?? null,
      text: m.content || "",
      timestamp: new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      mediaUrl: m.media_url ?? null,
      mediaType: m.media_type ?? null,
      status: (m.status || "sent") as ChatMessage["status"],
    } as ChatMessage;
  });
}

export async function fetchGroupMessages(groupId: string): Promise<ChatMessage[]> {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("group_messages")
    .select("id,sender_id,content,media_url,media_type,created_at")
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
      mediaUrl: m.media_url ?? null,
      mediaType: m.media_type ?? null,
    } as ChatMessage;
  });
}

export async function sendMessage(conversationId: string, content: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: userId,
    content: content.trim(),
    status: "sent",
  });
  if (error) throw error;
}

export async function sendMediaMessage(
  conversationId: string,
  mediaUrl: string,
  mediaType: "audio" | "image" | "video" | "file",
  content?: string
): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: userId,
    content: content || null,
    media_url: mediaUrl,
    media_type: mediaType,
    status: "sent",
  });
  if (error) throw error;
}

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

export async function sendGroupMediaMessage(
  groupId: string,
  mediaUrl: string,
  mediaType: "audio" | "image" | "video" | "file",
  content?: string
): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase.from("group_messages").insert({
    group_id: groupId,
    sender_id: userId,
    content: content || null,
    media_url: mediaUrl,
    media_type: mediaType,
  });
  if (error) throw error;
}

export async function ensureDmConversation(otherUserId: string): Promise<string> {
  const supabase = getSupabaseOrThrow();
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_or_create_dm", { other_user_id: otherUserId });
  if (!rpcError && rpcData) return rpcData as string;

  const userId = await requireUserId();
  const { data: existing } = await supabase
    .from("conversations").select("id")
    .or(`and(participant_a.eq.${userId},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${userId})`)
    .limit(1).maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ participant_a: userId, participant_b: otherUserId })
    .select("id").single();
  if (error) {
    if (error.code === "23505") {
      const { data: retry } = await supabase
        .from("conversations").select("id")
        .or(`and(participant_a.eq.${userId},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${userId})`)
        .limit(1).maybeSingle();
      if (retry?.id) return retry.id as string;
    }
    throw error;
  }
  return created.id as string;
}

// ── Subscriptions realtime ────────────────────────────────────────────────────

export function subscribeToConversation(conversationId: string, onNew: () => void): () => void {
  const supabase = getSupabaseOrThrow();
  const channel = supabase
    .channel(`conv:${conversationId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, onNew)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeToGroup(groupId: string, onNew: () => void): () => void {
  const supabase = getSupabaseOrThrow();
  const channel = supabase
    .channel(`group:${groupId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${groupId}` }, onNew)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ── Présence ──────────────────────────────────────────────────────────────────

export async function setPresence(online: boolean): Promise<void> {
  try {
    const supabase = getSupabaseOrThrow();
    const { error } = await supabase.rpc("update_presence", { p_online: online });
    if (error) console.warn("presence error:", error.message);
  } catch {}
}

export async function getContactPresence(userId: string): Promise<{ isOnline: boolean; lastSeen: string | null }> {
  try {
    const supabase = getSupabaseOrThrow();
    const { data } = await supabase
      .from("profiles").select("is_online,last_seen_at").eq("id", userId).single();
    if (data) return { isOnline: !!data.is_online, lastSeen: data.last_seen_at };
  } catch {}
  return { isOnline: false, lastSeen: null };
}

// ── Lecture / statuts ────────────────────────────────────────────────────────

export async function markConversationRead(conversationId: string): Promise<void> {
  try {
    const supabase = getSupabaseOrThrow();
    await supabase.rpc("mark_messages_read", { p_conversation_id: conversationId });
  } catch {}
}

export async function getMessageSeenStatus(conversationId: string): Promise<{ userId: string; readAt: string }[]> {
  try {
    const supabase = getSupabaseOrThrow();
    const { data } = await supabase
      .from("conversation_reads")
      .select("user_id,read_at")
      .eq("conversation_id", conversationId);
    return (data ?? []).map((r: any) => ({ userId: r.user_id, readAt: r.read_at }));
  } catch { return []; }
}

export async function deleteMessage(messageId: string, isGroup = false): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const table = isGroup ? "group_messages" : "messages";
  const { error } = await supabase.from(table).delete().eq("id", messageId).eq("sender_id", userId);
  if (error) throw error;
}

// ── Invitations groupes privés ────────────────────────────────────────────────

export type GroupInvitation = {
  id: string;
  groupId: string;
  groupName: string;
  groupColor: string;
  invitedBy: string;
  invitedByName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export async function inviteUserToGroup(groupId: string, userId: string): Promise<void> {
  const supabase = getSupabaseOrThrow();
  const me = await requireUserId();
  const { error } = await supabase.from("group_invitations").insert({
    group_id: groupId,
    invited_by: me,
    invited_user_id: userId,
    status: "pending",
  });
  if (error) throw error;
}

export async function fetchMyInvitations(): Promise<GroupInvitation[]> {
  const supabase = getSupabaseOrThrow();
  const me = await requireUserId();
  const { data, error } = await supabase
    .from("group_invitations")
    .select(`
      id, group_id, status, created_at,
      invited_by,
      groups:group_id(name, avatar_color),
      inviter:invited_by(full_name, username)
    `)
    .eq("invited_user_id", me)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    groupId: row.group_id,
    groupName: row.groups?.name || "Groupe",
    groupColor: row.groups?.avatar_color || "#654BFF",
    invitedBy: row.invited_by,
    invitedByName: row.inviter?.full_name || row.inviter?.username || "Quelqu'un",
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function respondToInvitation(invitationId: string, accept: boolean): Promise<string | null> {
  const supabase = getSupabaseOrThrow();
  const me = await requireUserId();

  // Récupérer le groupId avant de répondre
  const { data: inv } = await supabase
    .from("group_invitations").select("group_id").eq("id", invitationId).single();

  await supabase.from("group_invitations")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("id", invitationId).eq("invited_user_id", me);

  if (accept && inv?.group_id) {
    await supabase.from("group_members").upsert(
      { group_id: inv.group_id, user_id: me, role: "member" },
      { onConflict: "group_id,user_id" }
    );
    return inv.group_id as string;
  }
  return null;
}

export async function fetchGroupInvitations(groupId: string): Promise<{
  id: string; userId: string; userName: string; createdAt: string;
}[]> {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("group_invitations")
    .select("id, invited_user_id, created_at, profiles:invited_user_id(full_name, username)")
    .eq("group_id", groupId)
    .eq("status", "pending");
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.invited_user_id,
    userName: row.profiles?.full_name || row.profiles?.username || "Utilisateur",
    createdAt: row.created_at,
  }));
}
