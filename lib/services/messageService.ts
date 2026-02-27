import { getSupabaseOrThrow } from "../supabase";
import { Profile } from "../../types/db";

export type InboxItem = {
  conversationId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
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
};

async function requireUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const id = data.user?.id;
  if (!id) throw new Error("Session introuvable");
  return id;
}

function initials(label: string) {
  return label
    .split(" ")
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");
}

export async function fetchInbox() {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const { data: memberships, error: membershipsError } = await supabase
    .from("conversation_members")
    .select("conversation_id,last_read_at,conversations!inner(id,type,title)")
    .eq("user_id", userId)
    .eq("conversations.type", "dm");

  if (membershipsError) throw membershipsError;

  const rows = memberships ?? [];

  const items = await Promise.all(
    rows.map(async (row: any) => {
      const conversationId = row.conversation_id as string;
      const lastReadAt = row.last_read_at as string | null;

      const [otherMemberRes, lastMessageRes] = await Promise.all([
        supabase
          .from("conversation_members")
          .select("user_id")
          .eq("conversation_id", conversationId)
          .neq("user_id", userId)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("messages")
          .select("id,content,created_at,sender_id")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (otherMemberRes.error) throw otherMemberRes.error;
      if (lastMessageRes.error) throw lastMessageRes.error;

      const otherId = otherMemberRes.data?.user_id as string | undefined;
      let profile: Profile | null = null;
      if (otherId) {
        const profileRes = await supabase
          .from("profiles")
          .select("id,username,full_name,bio,filiere,niveau,avatar_url")
          .eq("id", otherId)
          .maybeSingle();
        if (profileRes.error) throw profileRes.error;
        profile = (profileRes.data as Profile | null) ?? null;
      }

      let unreadQuery = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId);

      if (lastReadAt) unreadQuery = unreadQuery.gt("created_at", lastReadAt);

      const unreadRes = await unreadQuery;
      if (unreadRes.error) throw unreadRes.error;

      const title = profile?.full_name || profile?.username || row.conversations?.title || "Discussion";
      const lastMessage = (lastMessageRes.data?.content as string | undefined) || "Aucun message";
      const lastDate = lastMessageRes.data?.created_at
        ? new Date(lastMessageRes.data.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "";

      return {
        conversationId,
        name: title,
        lastMessage,
        timestamp: lastDate || "",
        unreadCount: unreadRes.count || 0,
        avatar: initials(title),
      } as InboxItem;
    })
  );

  return items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export async function fetchGroups() {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const [conversationsRes, membershipsRes] = await Promise.all([
    supabase
      .from("conversations")
      .select("id,title,description,filiere,privacy,avatar_color,type,created_at")
      .eq("type", "group"),
    supabase.from("conversation_members").select("conversation_id,last_read_at").eq("user_id", userId),
  ]);

  if (conversationsRes.error) throw conversationsRes.error;
  if (membershipsRes.error) throw membershipsRes.error;

  const groups = conversationsRes.data ?? [];
  const memberships = membershipsRes.data ?? [];
  const membershipMap = new Map<string, string | null>(memberships.map((m) => [m.conversation_id, m.last_read_at]));

  const items = await Promise.all(
    groups.map(async (group: any) => {
      const groupId = group.id as string;
      const joined = membershipMap.has(groupId);
      const lastReadAt = membershipMap.get(groupId) || null;

      const [memberCountRes, lastMessageRes] = await Promise.all([
        supabase
          .from("conversation_members")
          .select("user_id", { count: "exact", head: true })
          .eq("conversation_id", groupId),
        supabase
          .from("messages")
          .select("content,created_at")
          .eq("conversation_id", groupId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (memberCountRes.error) throw memberCountRes.error;
      if (lastMessageRes.error) throw lastMessageRes.error;

      let unreadCount = 0;
      if (joined) {
        let unreadQuery = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", groupId)
          .neq("sender_id", userId);
        if (lastReadAt) unreadQuery = unreadQuery.gt("created_at", lastReadAt);
        const unreadRes = await unreadQuery;
        if (unreadRes.error) throw unreadRes.error;
        unreadCount = unreadRes.count || 0;
      }

      return {
        groupId,
        name: group.title || "Groupe",
        description: group.description || "Groupe de travail",
        filiere: group.filiere || null,
        privacy: (group.privacy || "public") as "public" | "private",
        memberCount: memberCountRes.count || 0,
        lastMessage: (lastMessageRes.data?.content as string | undefined) || "Aucun message",
        lastActivity: lastMessageRes.data?.created_at
          ? new Date(lastMessageRes.data.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "",
        unreadCount,
        avatarColor: group.avatar_color || "#654BFF",
        joined,
      } as GroupListItem;
    })
  );

  return items;
}

export async function createGroup(input: {
  name: string;
  description?: string;
  filiere?: string;
  privacy: "public" | "private";
}) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      type: "group",
      title: input.name.trim(),
      description: input.description?.trim() || null,
      filiere: input.filiere?.trim() || null,
      privacy: input.privacy,
      avatar_color: ["#654BFF", "#2A8CFF", "#7C52FF", "#4A7BFF"][Date.now() % 4],
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw error;

  const { error: memberError } = await supabase
    .from("conversation_members")
    .insert({ conversation_id: data.id, user_id: userId, last_read_at: new Date().toISOString() });

  if (memberError) throw memberError;
  return data.id as string;
}

export async function joinGroup(groupId: string) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("conversation_members")
    .upsert({ conversation_id: groupId, user_id: userId, last_read_at: new Date().toISOString() }, { onConflict: "conversation_id,user_id" });
  if (error) throw error;
}

export async function leaveGroup(groupId: string) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("conversation_members")
    .delete()
    .eq("conversation_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function fetchConversationMessages(conversationId: string) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,content,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = data ?? [];
  const senderIds = Array.from(new Set(rows.map((message: any) => message.sender_id)));

  let profileMap = new Map<string, Profile>();
  if (senderIds.length > 0) {
    const profilesRes = await supabase
      .from("profiles")
      .select("id,username,full_name,bio,filiere,niveau,avatar_url")
      .in("id", senderIds);
    if (profilesRes.error) throw profilesRes.error;
    profileMap = new Map((profilesRes.data ?? []).map((profile: any) => [profile.id, profile as Profile]));
  }

  return rows.map((message: any) => {
    const profile = profileMap.get(message.sender_id);
    return {
      id: message.id,
      senderId: message.sender_id,
      senderName: profile?.full_name || profile?.username || "Utilisateur",
      text: message.content,
      timestamp: new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    } as ChatMessage;
  });
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const senderProfile = await supabase
    .from("profiles")
    .select("username,full_name")
    .eq("id", userId)
    .maybeSingle();
  if (senderProfile.error) throw senderProfile.error;

  const inserted = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
    })
    .select("id,content")
    .single();
  if (inserted.error) throw inserted.error;

  const [convRes, recipientsRes] = await Promise.all([
    supabase.from("conversations").select("id,type,title").eq("id", conversationId).maybeSingle(),
    supabase.from("conversation_members").select("user_id").eq("conversation_id", conversationId).neq("user_id", userId),
  ]);
  if (convRes.error) throw convRes.error;
  if (recipientsRes.error) throw recipientsRes.error;

  const recipientIds = (recipientsRes.data ?? []).map((row) => row.user_id);
  if (recipientIds.length > 0) {
    await supabase.functions.invoke("new-message-push", {
      body: {
        message_id: inserted.data.id,
        conversation_id: conversationId,
        sender_id: userId,
        sender_name: senderProfile.data?.full_name || senderProfile.data?.username || "Nouveau message",
        body: inserted.data.content,
        type: convRes.data?.type === "group" ? "group" : "dm",
        recipient_user_ids: recipientIds,
      },
    });
  }
}

export async function markConversationRead(conversationId: string) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function ensureDmConversation(otherUserId: string) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const myMemberships = await supabase
    .from("conversation_members")
    .select("conversation_id,conversations!inner(id,type)")
    .eq("user_id", userId)
    .eq("conversations.type", "dm");
  if (myMemberships.error) throw myMemberships.error;

  const ids = (myMemberships.data ?? []).map((row: any) => row.conversation_id);

  if (ids.length > 0) {
    const existing = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .in("conversation_id", ids)
      .eq("user_id", otherUserId)
      .maybeSingle();

    if (existing.error) throw existing.error;
    if (existing.data?.conversation_id) return existing.data.conversation_id as string;
  }

  const created = await supabase
    .from("conversations")
    .insert({ type: "dm", title: null, created_by: userId })
    .select("id")
    .single();
  if (created.error) throw created.error;

  const cid = created.data.id as string;
  const membersRes = await supabase.from("conversation_members").insert([
    { conversation_id: cid, user_id: userId, last_read_at: new Date().toISOString() },
    { conversation_id: cid, user_id: otherUserId, last_read_at: null },
  ]);
  if (membersRes.error) throw membersRes.error;

  return cid;
}

export function subscribeToConversation(conversationId: string, onMessageInserted: () => void) {
  const supabase = getSupabaseOrThrow();
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      () => onMessageInserted()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
