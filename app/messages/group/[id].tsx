import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, AppState, FlatList,
  KeyboardAvoidingView, Modal, Platform, Pressable,
  Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageBubble } from "../../../src/features/messages/v1/components/MessageBubble";
import { useMessagesStore } from "../../../state/useMessagesStore";
import { useAuthStore } from "../../../state/useAuthStore";
import { useTheme } from "../../../src/core/theme/ThemeProvider";
import {
  setPresence, GroupMember, inviteUserToGroup, fetchGroupInvitations,
} from "../../../lib/services/messageService";
import { searchUsers } from "../../../lib/services/searchService";

function getStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default function GroupChatScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  const groupId = getStr(useLocalSearchParams<{ id?: string | string[] }>().id);

  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [membersOpen,   setMembersOpen]   = useState(false);
  const [members,       setMembers]       = useState<GroupMember[]>([]);
  const [loadingMem,    setLoadingMem]    = useState(false);
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [inviteQuery,   setInviteQuery]   = useState("");
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSending, setInviteSending] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<{ id: string; userId: string; userName: string; createdAt: string }[]>([]);

  const listRef = useRef<FlatList<any>>(null);

  const { user } = useAuthStore();
  const {
    groups, messagesByConversation, openGroup, sendGroupMessage,
    subscribeGroup, markRead, leaveGroup,
    fetchGroupMembers, removeGroupMember, promoteToAdmin,
  } = useMessagesStore();

  const messages   = messagesByConversation[groupId] || [];
  const groupMeta  = useMemo(() => groups.find(g => g.groupId === groupId), [groups, groupId]);
  const groupName  = groupMeta?.name || "Groupe";
  const memberCount = groupMeta?.memberCount || 0;
  const isAdmin    = groupMeta?.isAdmin || false;
  const avatarColor = groupMeta?.avatarColor || "#654BFF";
  const isPrivate  = groupMeta?.privacy === "private";

  useEffect(() => {
    if (!groupId) return;
    openGroup(groupId).catch(() => null);
    markRead(groupId).catch(() => null);
    const unsub = subscribeGroup(groupId);
    return unsub;
  }, [groupId, openGroup, subscribeGroup, markRead]);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length]);

  useEffect(() => {
    if (!user?.id) return;
    setPresence(true);
    const sub = AppState.addEventListener("change", (state) => setPresence(state === "active"));
    return () => { sub.remove(); setPresence(false); };
  }, [user?.id]);

  // ── Membres ──────────────────────────────────────────────────────────────────
  const loadMembers = async () => {
    setLoadingMem(true);
    try {
      const [list, pending] = await Promise.all([
        fetchGroupMembers(groupId),
        fetchGroupInvitations(groupId).catch(() => []),
      ]);
      setMembers(list);
      setPendingInvites(pending);
    } catch {}
    finally { setLoadingMem(false); }
  };

  const handleKick = (member: GroupMember) => {
    if (!isAdmin) return;
    Alert.alert("Exclure", `Exclure ${member.fullName} du groupe ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Exclure", style: "destructive", onPress: async () => {
        await removeGroupMember(groupId, member.userId);
        setMembers(p => p.filter(m => m.userId !== member.userId));
      }},
    ]);
  };

  const handlePromote = (member: GroupMember) => {
    if (!isAdmin) return;
    Alert.alert("Promouvoir", `Rendre ${member.fullName} administrateur ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Promouvoir", onPress: async () => {
        await promoteToAdmin(groupId, member.userId);
        setMembers(p => p.map(m => m.userId === member.userId ? { ...m, role: "admin" } : m));
      }},
    ]);
  };

  const handleLeave = () => {
    Alert.alert("Quitter", `Quitter "${groupName}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Quitter", style: "destructive", onPress: async () => {
        await leaveGroup(groupId);
        router.back();
      }},
    ]);
  };

  // ── Invitation ────────────────────────────────────────────────────────────────
  const searchForInvite = async (q: string) => {
    setInviteQuery(q);
    if (!q.trim()) { setInviteResults([]); return; }
    setInviteLoading(true);
    try {
      const found = await searchUsers(q);
      const memberIds = new Set(members.map(m => m.userId));
      const pendingIds = new Set(pendingInvites.map(p => p.userId));
      setInviteResults(found.filter((u: any) => !memberIds.has(u.id) && !pendingIds.has(u.id)));
    } catch {}
    finally { setInviteLoading(false); }
  };

  const doInvite = async (userId: string, userName: string) => {
    setInviteSending(userId);
    try {
      await inviteUserToGroup(groupId, userId);
      setPendingInvites(p => [...p, { id: Date.now().toString(), userId, userName, createdAt: new Date().toISOString() }]);
      setInviteResults(r => r.filter((u: any) => u.id !== userId));
      Alert.alert("✅ Invitation envoyée", `${userName} a reçu ton invitation.`);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'inviter.");
    } finally { setInviteSending(null); }
  };

  // ── Envoi message ─────────────────────────────────────────────────────────────
  const send = async () => {
    const text = input.trim();
    if (!text || !groupId || sending) return;
    setSending(true);
    setInput("");
    try {
      Haptics.selectionAsync().catch(() => null);
      await sendGroupMessage(groupId, text);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'envoyer.");
    } finally { setSending(false); }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <LinearGradient
          colors={[avatarColor, avatarColor + "CC"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 14,
            flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          <Pressable onPress={() => router.back()}
            style={({ pressed }) => [{ width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.22)", alignItems: "center", justifyContent: "center" },
              pressed && { opacity: 0.7 }]}>
            <Ionicons name="chevron-back" size={20} color="#FFF" />
          </Pressable>

          <Pressable onPress={() => { setMembersOpen(true); loadMembers(); }}
            style={{ width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="people" size={18} color="#FFF" />
          </Pressable>

          <Pressable style={{ flex: 1 }} onPress={() => { setMembersOpen(true); loadMembers(); }}>
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800" }}>{groupName}</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
              {memberCount} membre{memberCount > 1 ? "s" : ""} · {isPrivate ? "🔒 Privé" : "🌐 Public"}
            </Text>
          </Pressable>

          {isPrivate && (
            <Pressable onPress={() => { setInviteOpen(true); loadMembers(); }}
              style={{ width: 36, height: 36, borderRadius: 18,
                backgroundColor: "rgba(0,0,0,0.22)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="person-add-outline" size={18} color="#FFF" />
            </Pressable>
          )}

          <Pressable onPress={handleLeave}
            style={{ width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.22)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="exit-outline" size={18} color="#FFF" />
          </Pressable>
        </LinearGradient>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingVertical: 14, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32,
                backgroundColor: avatarColor + "22", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="people-outline" size={28} color={avatarColor} />
              </View>
              <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 16 }}>Début du groupe</Text>
              <Text style={{ color: c.textSecondary, fontSize: 14 }}>Sois le premier à écrire !</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MessageBubble
              id={item.id}
              text={item.text}
              timestamp={item.timestamp}
              isMe={item.senderId === user?.id}
              senderName={item.senderName}
              showSender={item.senderId !== user?.id}
              type={(item.mediaType || "text") as any}
              mediaUri={item.mediaUrl || undefined}
              accentColor={avatarColor}
            />
          )}
        />

        {/* Composer */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8,
          borderTopWidth: 1, borderTopColor: c.border, paddingHorizontal: 12, paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          backgroundColor: isDark ? "#0A0A0A" : "#F8F8F8" }}>
          <TextInput
            value={input} onChangeText={setInput}
            placeholder={`Message dans ${groupName}…`} placeholderTextColor={c.textSecondary}
            style={{ flex: 1, backgroundColor: c.cardAlt, borderWidth: 1, borderColor: c.border,
              borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, color: c.textPrimary,
              maxHeight: 110, fontSize: 15 }}
            multiline
          />
          <Pressable onPress={send} disabled={!input.trim() || sending}
            style={{ width: 42, height: 42, borderRadius: 21,
              backgroundColor: !input.trim() ? c.cardAlt : avatarColor,
              alignItems: "center", justifyContent: "center", opacity: sending ? 0.6 : 1 }}>
            {sending
              ? <ActivityIndicator size="small" color={avatarColor} />
              : <Ionicons name="send" size={17} color={!input.trim() ? c.textSecondary : "#FFF"} />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Modal membres */}
      <Modal visible={membersOpen} transparent animationType="slide" onRequestClose={() => setMembersOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setMembersOpen(false)} />
          <View style={{ backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            borderWidth: 1, borderColor: c.border, maxHeight: "70%", paddingBottom: insets.bottom + 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              padding: 20, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <Text style={{ color: c.textPrimary, fontSize: 18, fontWeight: "900" }}>
                Membres ({members.length})
              </Text>
              <Pressable onPress={() => setMembersOpen(false)}>
                <Ionicons name="close" size={22} color={c.textSecondary} />
              </Pressable>
            </View>
            {loadingMem ? (
              <ActivityIndicator color={avatarColor} style={{ margin: 24 }} />
            ) : (
              <FlatList
                data={members}
                keyExtractor={m => m.userId}
                contentContainerStyle={{ padding: 16, gap: 8 }}
                renderItem={({ item }) => (
                  <Pressable
                    onLongPress={() => {
                      if (!isAdmin || item.userId === user?.id) return;
                      Alert.alert(item.fullName, "", [
                        { text: "Promouvoir admin", onPress: () => handlePromote(item) },
                        { text: "Exclure", style: "destructive", onPress: () => handleKick(item) },
                        { text: "Annuler", style: "cancel" },
                      ]);
                    }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12,
                      backgroundColor: c.cardAlt, borderRadius: 14, padding: 12,
                      borderWidth: 1, borderColor: c.border }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20,
                      backgroundColor: avatarColor + "33", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: avatarColor, fontWeight: "900", fontSize: 16 }}>
                        {item.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 15 }}>
                        {item.fullName}{item.userId === user?.id ? " (moi)" : ""}
                      </Text>
                      {item.username ? <Text style={{ color: c.textSecondary, fontSize: 12 }}>@{item.username}</Text> : null}
                    </View>
                    {item.role === "admin" && (
                      <View style={{ backgroundColor: avatarColor + "22", borderRadius: 8,
                        paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: avatarColor + "44" }}>
                        <Text style={{ color: avatarColor, fontSize: 11, fontWeight: "800" }}>Admin</Text>
                      </View>
                    )}
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal invitation (groupes privés) */}
      <Modal visible={inviteOpen} transparent animationType="slide" onRequestClose={() => setInviteOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setInviteOpen(false)} />
          <View style={{ backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            borderWidth: 1, borderColor: c.border, maxHeight: "80%", paddingBottom: insets.bottom + 10 }}>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              padding: 20, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <View>
                <Text style={{ color: c.textPrimary, fontSize: 18, fontWeight: "900" }}>Inviter des membres</Text>
                <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>Groupe privé 🔒</Text>
              </View>
              <Pressable onPress={() => setInviteOpen(false)}>
                <Ionicons name="close" size={22} color={c.textSecondary} />
              </Pressable>
            </View>

            {/* Recherche */}
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.cardAlt,
                borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, height: 44, gap: 10 }}>
                <Ionicons name="search-outline" size={16} color={c.textSecondary} />
                <TextInput
                  value={inviteQuery} onChangeText={searchForInvite}
                  placeholder="Rechercher un utilisateur…" placeholderTextColor={c.textSecondary}
                  style={{ flex: 1, color: c.textPrimary, fontSize: 15 }}
                  autoFocus
                />
                {inviteLoading && <ActivityIndicator size="small" color={avatarColor} />}
              </View>
            </View>

            {/* Invitations en attente */}
            {pendingInvites.length > 0 && (
              <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
                <Text style={{ color: c.textSecondary, fontSize: 12, fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  En attente ({pendingInvites.length})
                </Text>
                {pendingInvites.map(inv => (
                  <View key={inv.id} style={{ flexDirection: "row", alignItems: "center", gap: 10,
                    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18,
                      backgroundColor: avatarColor + "22", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: avatarColor, fontWeight: "800" }}>{inv.userName.charAt(0)}</Text>
                    </View>
                    <Text style={{ flex: 1, color: c.textPrimary, fontWeight: "600" }}>{inv.userName}</Text>
                    <View style={{ backgroundColor: "#FF950022", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: "#FF9500", fontSize: 11, fontWeight: "700" }}>En attente</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Résultats */}
            <FlatList
              data={inviteResults}
              keyExtractor={(u: any) => u.id}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              ListEmptyComponent={inviteQuery.trim() && !inviteLoading ? (
                <Text style={{ color: c.textSecondary, textAlign: "center", paddingVertical: 20 }}>Aucun résultat</Text>
              ) : null}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12,
                  backgroundColor: c.cardAlt, borderRadius: 14, padding: 12,
                  borderWidth: 1, borderColor: c.border }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20,
                    backgroundColor: avatarColor + "33", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: avatarColor, fontWeight: "900", fontSize: 16 }}>
                      {(item.full_name || item.username || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.textPrimary, fontWeight: "700" }}>{item.full_name || item.username}</Text>
                    {item.username && <Text style={{ color: c.textSecondary, fontSize: 12 }}>@{item.username}</Text>}
                  </View>
                  <Pressable
                    onPress={() => doInvite(item.id, item.full_name || item.username || "Utilisateur")}
                    disabled={inviteSending === item.id}
                    style={{ backgroundColor: avatarColor, borderRadius: 10,
                      paddingHorizontal: 14, height: 34, alignItems: "center", justifyContent: "center",
                      opacity: inviteSending === item.id ? 0.6 : 1 }}>
                    {inviteSending === item.id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>Inviter</Text>
                    }
                  </Pressable>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
