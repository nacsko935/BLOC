import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS, Alert, Animated, AppState, FlatList,
  KeyboardAvoidingView, Modal, Platform, Pressable,
  Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageBubble, MessageType, MessageStatus } from "../../src/features/messages/v1/components/MessageBubble";
import { useMessagesStore } from "../../state/useMessagesStore";
import { useAuthStore } from "../../state/useAuthStore";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { getSupabaseOrThrow } from "../../lib/supabase";
import { setPresence, getContactPresence, uploadAudioMessage } from "../../lib/services/messageService";

// ── expo-av dynamique ──────────────────────────────────────────────────────────
let AudioModule: any = null;
async function getAudio() {
  if (AudioModule) return AudioModule;
  try { const mod = await import("expo-av"); AudioModule = mod.Audio; return AudioModule; }
  catch { return null; }
}

// ── Types ──────────────────────────────────────────────────────────────────────
type RichMsg = {
  id: string; senderId: string; senderName: string;
  text: string; timestamp: string;
  type?: MessageType; mediaUri?: string; audioDuration?: string;
  status?: MessageStatus;
  reactions?: { emoji: string; count: number; byMe: boolean }[];
  uploading?: boolean;
};

const CHAT_THEMES = [
  { id: "default", name: "Défaut",  colors: ["#7B6CFF", "#5B4CFF"] as [string,string] },
  { id: "sunset",  name: "Coucher", colors: ["#FF6B6B", "#FF8E53"] as [string,string] },
  { id: "ocean",   name: "Océan",   colors: ["#4DA3FF", "#00D2FF"] as [string,string] },
  { id: "forest",  name: "Forêt",   colors: ["#34C759", "#3DBF84"] as [string,string] },
  { id: "rose",    name: "Rosé",    colors: ["#FF85C2", "#FF4FA3"] as [string,string] },
  { id: "gold",    name: "Or",      colors: ["#FFD700", "#FFA500"] as [string,string] },
  { id: "mono",    name: "Mono",    colors: ["#555555", "#333333"] as [string,string] },
  { id: "night",   name: "Nuit",    colors: ["#1A1A2E", "#16213E"] as [string,string] },
];

function fmt(s: number) { return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`; }
function getStr(v: string|string[]|undefined) { return Array.isArray(v) ? (v[0]??"") : (v??""); }
function mkTime() { return new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}); }

function formatPresence(isOnline: boolean, lastSeen?: string|null): string {
  if (isOnline) return "En ligne";
  if (!lastSeen) return "Hors ligne";
  const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000);
  if (diff < 60)    return "Vu à l'instant";
  if (diff < 3600)  return `Vu il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Vu il y a ${Math.floor(diff/3600)} h`;
  const d = new Date(lastSeen);
  return `Vu le ${d.toLocaleDateString("fr-FR",{day:"2-digit",month:"short"})}`;
}

export default function ChatScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  const id = getStr(useLocalSearchParams<{id?:string|string[]}>().id);

  const [input,        setInput]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [localMsgs,    setLocalMsgs]    = useState<RichMsg[]>([]);
  const [playingId,    setPlayingId]    = useState<string|null>(null);
  const [playProgress, setPlayProgress] = useState<Record<string, number>>({});
  const [isRecording,  setIsRecording]  = useState(false);
  const [recSecs,      setRecSecs]      = useState(0);
  const [themeOpen,    setThemeOpen]    = useState(false);
  const [chatTheme,    setChatTheme]    = useState(CHAT_THEMES[0]);
  const [presence,     setPresenceState]= useState<{isOnline:boolean; lastSeen?:string|null}>({isOnline:false});
  const [localReactions, setLocalReactions] = useState<Record<string, {emoji:string;count:number;byMe:boolean}[]>>({});

  const recRef    = useRef<any>(null);
  const sndRef    = useRef<any>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const presTimer = useRef<ReturnType<typeof setInterval>|null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const listRef   = useRef<FlatList<any>>(null);

  const { user } = useAuthStore();
  const { inbox, messagesByConversation, openConversation, sendMessage, sendMediaMessage, subscribeConversation, markRead } = useMessagesStore();

  const stored   = messagesByConversation[id] || [];
  const convInfo = inbox.find(c => c.conversationId === id);
  const contact  = convInfo?.name || "Conversation";
  const otherUserId = convInfo?.otherUserId;
  const accent   = chatTheme.colors[0];

  // ── Thème persisté par conversation ───────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    AsyncStorage.getItem(`chat_theme_${id}`).then(saved => {
      if (saved) { const f = CHAT_THEMES.find(t => t.id === saved); if (f) setChatTheme(f); }
    }).catch(() => null);
  }, [id]);

  const saveTheme = (theme: typeof CHAT_THEMES[0]) => {
    setChatTheme(theme);
    setThemeOpen(false);
    AsyncStorage.setItem(`chat_theme_${id}`, theme.id).catch(() => null);
  };

  // ── Charger conversation + marquer lu ────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    openConversation(id).catch(() => null);
    markRead(id).catch(() => null);
    const unsub = subscribeConversation(id);
    return unsub;
  }, [id, openConversation, subscribeConversation, markRead]);

  // ── Scroll auto ───────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({animated:true}), 100);
    return () => clearTimeout(t);
  }, [stored.length, localMsgs.length]);

  // ── Présence contact — temps réel ─────────────────────────────────────────
  useEffect(() => {
    if (!otherUserId) return;

    // Charger la présence initiale
    getContactPresence(otherUserId).then(p => setPresenceState(p));

    // Actualiser toutes les 30 secondes
    presTimer.current = setInterval(() => {
      getContactPresence(otherUserId).then(p => setPresenceState(p));
    }, 30000);

    // S'abonner aux changements realtime
    const sb = getSupabaseOrThrow();
    if (sb) {
      const channel = sb.channel(`presence_${otherUserId}`)
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "profiles",
          filter: `id=eq.${otherUserId}`,
        }, (payload) => {
          const d = payload.new as any;
          setPresenceState({ isOnline: !!d.is_online, lastSeen: d.last_seen_at });
        })
        .subscribe();
      return () => {
        if (presTimer.current) clearInterval(presTimer.current);
        sb.removeChannel(channel);
      };
    }
    return () => { if (presTimer.current) clearInterval(presTimer.current); };
  }, [otherUserId]);

  // ── Ma présence ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    setPresence(true);
    const handleAppState = (state: string) => { setPresence(state === "active"); };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => { sub.remove(); setPresence(false); };
  }, [user?.id]);

  // ── Animation enregistrement ──────────────────────────────────────────────
  useEffect(() => {
    if (!isRecording) { pulseAnim.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue:1.3, duration:500, useNativeDriver:true }),
      Animated.timing(pulseAnim, { toValue:1,   duration:500, useNativeDriver:true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [isRecording, pulseAnim]);

  const addLocal = (m: RichMsg) => setLocalMsgs(p => [...p, m]);
  const updateLocal = (id: string, patch: Partial<RichMsg>) =>
    setLocalMsgs(p => p.map(m => m.id === id ? { ...m, ...patch } : m));

  // ── Envoyer texte ──────────────────────────────────────────────────────────
  const sendText = async () => {
    const txt = input.trim();
    if (!txt || !id || sending) return;
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    addLocal({ id: tempId, senderId: user?.id||"me", senderName:"Moi", text: txt, timestamp: mkTime(), status: "sending" });
    setInput("");
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>null);
      await sendMessage(id, txt);
      updateLocal(tempId, { status: "sent" });
    } catch (e: any) {
      setLocalMsgs(p => p.filter(m => m.id !== tempId));
      Alert.alert("Erreur", e?.message || "Impossible d'envoyer le message.");
    } finally { setSending(false); }
  };

  // ── Enregistrement audio ───────────────────────────────────────────────────
  const startRec = async () => {
    const Audio = await getAudio();
    if (!Audio) {
      Alert.alert("Audio indisponible", "L'enregistrement nécessite un build de développement.");
      return;
    }
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert("Permission refusée", "Active le micro dans les réglages."); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recRef.current = recording;
      setIsRecording(true); setRecSecs(0);
      timerRef.current = setInterval(() => setRecSecs(s => s+1), 1000);
    } catch (e: any) { Alert.alert("Erreur", e?.message); }
  };

  const stopRec = async () => {
    if (!recRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = recSecs;
    try {
      await recRef.current.stopAndUnloadAsync();
      const localUri = recRef.current.getURI();
      recRef.current = null; setIsRecording(false); setRecSecs(0);
      if (!localUri) return;

      const tempId = `aud-${Date.now()}`;
      // Ajouter localement en état "uploading"
      addLocal({
        id: tempId, senderId: user?.id||"me", senderName:"Moi",
        text: "", type: "audio", mediaUri: localUri,
        audioDuration: fmt(duration), timestamp: mkTime(),
        status: "sending", uploading: true,
      });

      // Upload vers Supabase Storage
      try {
        const publicUrl = await uploadAudioMessage(localUri, user?.id || "anon");
        await sendMediaMessage(id, publicUrl, "audio");
        updateLocal(tempId, { status: "sent", uploading: false, mediaUri: publicUrl });
      } catch (e: any) {
        // En cas d'échec upload, garder local uniquement
        updateLocal(tempId, { status: "sent", uploading: false });
        console.warn("Audio upload failed, keeping local:", e?.message);
      }
    } catch { setIsRecording(false); }
  };

  const cancelRec = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try { await recRef.current?.stopAndUnloadAsync(); } catch {}
    recRef.current = null; setIsRecording(false); setRecSecs(0);
  };

  // ── Lecture audio ──────────────────────────────────────────────────────────
  const playAudio = async (msgId: string, uri?: string, speed = 1) => {
    if (!uri) return;
    const Audio = await getAudio();
    if (!Audio) { Alert.alert("Lecture indisponible", "Nécessite un build de développement."); return; }
    try {
      // Arrêter la lecture en cours si même message
      if (playingId === msgId) {
        if (sndRef.current) {
          await sndRef.current.stopAsync().catch(()=>null);
          await sndRef.current.unloadAsync().catch(()=>null);
          sndRef.current = null;
        }
        setPlayingId(null);
        return;
      }
      // Arrêter tout audio en cours
      if (sndRef.current) {
        await sndRef.current.stopAsync().catch(()=>null);
        await sndRef.current.unloadAsync().catch(()=>null);
        sndRef.current = null;
      }
      setPlayingId(msgId);
      setPlayProgress(p => ({ ...p, [msgId]: 0 }));

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, rate: speed, shouldCorrectPitch: true }
      );
      sndRef.current = sound;

      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (!s.isLoaded) return;
        if (s.durationMillis && s.positionMillis) {
          setPlayProgress(p => ({ ...p, [msgId]: s.positionMillis / s.durationMillis }));
        }
        if (s.didJustFinish) {
          setPlayingId(null);
          setPlayProgress(p => ({ ...p, [msgId]: 0 }));
          sound.unloadAsync().catch(()=>null);
          sndRef.current = null;
        }
      });
    } catch (e: any) {
      setPlayingId(null);
      Alert.alert("Erreur de lecture", e?.message || "Impossible de lire ce message vocal.");
    }
  };

  // ── Réactions ──────────────────────────────────────────────────────────────
  const handleReact = useCallback(async (msgId: string, emoji: string) => {
    if (!user?.id) return;
    setLocalReactions(prev => {
      const current = [...(prev[msgId] || [])];
      const existing = current.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.byMe) {
          const updated = current.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, byMe: false } : r).filter(r => r.count > 0);
          return { ...prev, [msgId]: updated };
        }
        return { ...prev, [msgId]: current.map(r => r.emoji === emoji ? { ...r, count: r.count+1, byMe: true } : r) };
      }
      return { ...prev, [msgId]: [...current, { emoji, count: 1, byMe: true }] };
    });
    try {
      const sb = getSupabaseOrThrow();
      const { data } = await sb.from("message_reactions").select("id").eq("message_id", msgId).eq("user_id", user.id).eq("emoji", emoji).maybeSingle();
      if (data) await sb.from("message_reactions").delete().eq("id", data.id);
      else await sb.from("message_reactions").insert({ message_id: msgId, user_id: user.id, emoji });
    } catch {}
  }, [user?.id]);

  // ── Médias ─────────────────────────────────────────────────────────────────
  const openPicker = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options:["Annuler","Photo/Vidéo","Appareil photo","Fichier"], cancelButtonIndex:0 },
        async (i) => { if(i===1) pickLib(); if(i===2) pickCam(); if(i===3) pickDoc(); }
      );
    } else {
      Alert.alert("Envoyer", "", [
        { text:"Galerie",        onPress:pickLib },
        { text:"Appareil photo", onPress:pickCam },
        { text:"Fichier",        onPress:pickDoc },
        { text:"Annuler", style:"cancel" },
      ]);
    }
  };

  const pickLib = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images","videos"], quality: 0.85 });
      if (!r.canceled && r.assets[0]) {
        const a = r.assets[0];
        const type = a.type === "video" ? "video" : "image";
        const tempId = `img-${Date.now()}`;
        addLocal({ id: tempId, senderId: user?.id||"me", senderName:"Moi", text:"", type, mediaUri: a.uri, timestamp: mkTime(), status:"sending", uploading:true });
        try {
          const sb = getSupabaseOrThrow();
          const blob: Blob = await new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open("GET", a.uri); x.responseType = "blob"; x.onload = () => res(x.response); x.onerror = () => rej(new Error("Lecture fichier impossible")); x.send(); });
          const path = `${user?.id||"anon"}/${Date.now()}.${type==="video"?"mp4":"jpg"}`;
          const { data: upData, error: upErr } = await sb.storage.from("messages-media").upload(path, blob, { contentType: type==="video"?"video/mp4":"image/jpeg" });
          if (upErr) throw upErr;
          const { data: urlData } = sb.storage.from("messages-media").getPublicUrl(upData.path);
          await sendMediaMessage(id, urlData.publicUrl, type as any);
          updateLocal(tempId, { status:"sent", uploading:false, mediaUri: urlData.publicUrl });
        } catch {
          updateLocal(tempId, { status:"sent", uploading:false });
        }
      }
    } catch {}
  };

  const pickCam = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) return;
      const r = await ImagePicker.launchCameraAsync({ quality:0.85 });
      if (!r.canceled && r.assets[0]) {
        const tempId = `cam-${Date.now()}`;
        addLocal({ id: tempId, senderId: user?.id||"me", senderName:"Moi", text:"", type:"image", mediaUri:r.assets[0].uri, timestamp:mkTime(), status:"sending", uploading:true });
        try {
          const sb = getSupabaseOrThrow();
          const blob: Blob = await new Promise((res, rej) => { const uri = r.assets[0].uri; const x = new XMLHttpRequest(); x.open("GET", uri); x.responseType = "blob"; x.onload = () => res(x.response); x.onerror = () => rej(new Error("Lecture fichier impossible")); x.send(); });
          const path = `${user?.id||"anon"}/${Date.now()}.jpg`;
          const { data: upData, error: upErr } = await sb.storage.from("messages-media").upload(path, blob, { contentType:"image/jpeg" });
          if (upErr) throw upErr;
          const { data: urlData } = sb.storage.from("messages-media").getPublicUrl(upData.path);
          await sendMediaMessage(id, urlData.publicUrl, "image");
          updateLocal(tempId, { status:"sent", uploading:false, mediaUri: urlData.publicUrl });
        } catch {
          updateLocal(tempId, { status:"sent", uploading:false });
        }
      }
    } catch {}
  };

  const pickDoc = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type:"*/*", copyToCacheDirectory:true });
      if (!r.canceled && r.assets?.[0]) {
        addLocal({ id:`doc-${Date.now()}`, senderId:user?.id||"me", senderName:"Moi", text:`📎 ${r.assets[0].name}`, type:"file", timestamp:mkTime(), status:"sent" });
      }
    } catch {}
  };

  // ── Données fusionnées ────────────────────────────────────────────────────
  const all: RichMsg[] = [
    ...stored.map(m => ({
      id: m.id, senderId: m.senderId, senderName: m.senderName,
      text: m.text, timestamp: m.timestamp,
      type: (m.mediaType || "text") as MessageType,
      mediaUri: m.mediaUrl || undefined,
      status: (m.status || "read") as MessageStatus,
      reactions: localReactions[m.id] || [],
    })),
    ...localMsgs.map(m => ({ ...m, reactions: localReactions[m.id] || [] })),
  ];

  const composerBg = isDark ? "#0A0A0A" : "#F8F8F8";
  const presenceText = formatPresence(presence.isOnline, presence.lastSeen);

  return (
    <View style={{ flex:1, backgroundColor: isDark?"#000":"#FFF" }}>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"} keyboardVerticalOffset={0}>

        {/* ── Header ── */}
        <LinearGradient colors={chatTheme.colors} start={{x:0,y:0}} end={{x:1,y:0}}
          style={{ paddingTop:insets.top+10, paddingHorizontal:16, paddingBottom:14,
            flexDirection:"row", alignItems:"center", gap:10 }}>
          <Pressable onPress={() => router.back()}
            style={({pressed}) => [{ width:36, height:36, borderRadius:18, backgroundColor:"rgba(0,0,0,0.22)", alignItems:"center", justifyContent:"center" }, pressed&&{opacity:0.7}]}>
            <Ionicons name="chevron-back" size={20} color="#FFF" />
          </Pressable>
          <Pressable onPress={() => otherUserId && router.push(`/profile/${otherUserId}` as any)}
            style={{ width:40, height:40, borderRadius:20, backgroundColor:"rgba(255,255,255,0.25)", alignItems:"center", justifyContent:"center" }}>
            <Text style={{ color:"#FFF", fontWeight:"900", fontSize:16 }}>{contact.charAt(0).toUpperCase()}</Text>
          </Pressable>
          <Pressable style={{ flex:1 }} onPress={() => otherUserId && router.push(`/profile/${otherUserId}` as any)}>
            <Text style={{ color:"#FFF", fontSize:16, fontWeight:"800" }}>{contact}</Text>
            <View style={{ flexDirection:"row", alignItems:"center", gap:5 }}>
              {presence.isOnline && <View style={{ width:7, height:7, borderRadius:4, backgroundColor:"#34C759" }} />}
              <Text style={{ color:"rgba(255,255,255,0.75)", fontSize:11 }}>{presenceText}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => setThemeOpen(true)}
            style={{ width:36, height:36, borderRadius:18, backgroundColor:"rgba(0,0,0,0.22)", alignItems:"center", justifyContent:"center" }}>
            <Ionicons name="color-palette-outline" size={18} color="#FFF" />
          </Pressable>
        </LinearGradient>

        {/* ── Messages ── */}
        <FlatList
          ref={listRef}
          data={all}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingVertical:14, paddingBottom:24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems:"center", paddingTop:60, gap:12 }}>
              <View style={{ width:64, height:64, borderRadius:32, backgroundColor:accent+"22", alignItems:"center", justifyContent:"center" }}>
                <Ionicons name="chatbubbles-outline" size={28} color={accent} />
              </View>
              <Text style={{ color:c.textPrimary, fontWeight:"700", fontSize:16 }}>Début de la conversation</Text>
              <Text style={{ color:c.textSecondary, fontSize:14 }}>Envoie un message pour commencer !</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MessageBubble
              id={item.id}
              text={item.text}
              timestamp={item.timestamp}
              isMe={item.senderId === user?.id || item.senderId === "me"}
              type={item.type}
              mediaUri={item.mediaUri}
              audioDuration={item.audioDuration}
              isPlaying={playingId === item.id}
              playProgress={playProgress[item.id] || 0}
              status={item.status}
              reactions={item.reactions}
              uploading={item.uploading}
              accentColor={accent}
              onPlayAudio={(speed) => playAudio(item.id, item.mediaUri, speed)}
              onReact={(emoji) => handleReact(item.id, emoji)}
              onAvatarPress={() => otherUserId && router.push(`/profile/${otherUserId}` as any)}
            />
          )}
        />

        {/* ── Enregistrement ── */}
        {isRecording && (
          <View style={{ backgroundColor:composerBg, borderTopWidth:1, borderTopColor:c.border,
            paddingHorizontal:16, paddingVertical:14, flexDirection:"row", alignItems:"center", gap:12 }}>
            <Pressable onPress={cancelRec} style={{ width:40, height:40, borderRadius:20, backgroundColor:"rgba(255,59,48,0.12)", alignItems:"center", justifyContent:"center" }}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </Pressable>
            <View style={{ flex:1, flexDirection:"row", alignItems:"center", gap:10 }}>
              <Animated.View style={{ width:10, height:10, borderRadius:5, backgroundColor:"#FF3B30", transform:[{scale:pulseAnim}] }} />
              <Text style={{ color:c.textPrimary, fontWeight:"700" }}>Enregistrement…</Text>
              <Text style={{ color:c.textSecondary, fontVariant:["tabular-nums"] }}>{fmt(recSecs)}</Text>
            </View>
            <Pressable onPress={stopRec} style={{ width:46, height:46, borderRadius:23, backgroundColor:accent, alignItems:"center", justifyContent:"center" }}>
              <Ionicons name="send" size={18} color="#FFF" />
            </Pressable>
          </View>
        )}

        {/* ── Composer ── */}
        {!isRecording && (
          <View style={{ flexDirection:"row", alignItems:"flex-end", gap:8,
            borderTopWidth:1, borderTopColor:c.border, paddingHorizontal:12, paddingTop:10,
            paddingBottom: insets.bottom>0 ? insets.bottom : 12, backgroundColor:composerBg }}>
            <Pressable onPress={openPicker} style={{ width:40, height:40, borderRadius:20,
              backgroundColor:c.cardAlt, alignItems:"center", justifyContent:"center",
              borderWidth:1, borderColor:c.border }}>
              <Ionicons name="attach" size={20} color={accent} />
            </Pressable>
            <TextInput
              value={input} onChangeText={setInput}
              placeholder="Message…" placeholderTextColor={c.textSecondary}
              style={{ flex:1, backgroundColor:c.cardAlt, borderWidth:1, borderColor:c.border,
                borderRadius:22, paddingHorizontal:14, paddingVertical:10, color:c.textPrimary,
                maxHeight:110, fontSize:15 }}
              multiline
            />
            {input.trim() ? (
              <Pressable onPress={sendText} disabled={sending}
                style={{ width:42, height:42, borderRadius:21, backgroundColor:accent,
                  alignItems:"center", justifyContent:"center", opacity:sending?0.5:1 }}>
                <Ionicons name="send" size={17} color="#FFF" />
              </Pressable>
            ) : (
              <Pressable onLongPress={startRec} onPressOut={() => { if(isRecording) stopRec(); }} delayLongPress={300}
                style={{ width:42, height:42, borderRadius:21, backgroundColor:c.cardAlt,
                  alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:c.border }}>
                <Ionicons name="mic-outline" size={20} color={accent} />
              </Pressable>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* ── Modal thème ── */}
      <Modal visible={themeOpen} transparent animationType="slide" onRequestClose={() => setThemeOpen(false)}>
        <View style={{ flex:1, justifyContent:"flex-end", backgroundColor:"rgba(0,0,0,0.55)" }}>
          <Pressable style={{ position:"absolute", top:0, left:0, right:0, bottom:0 }} onPress={() => setThemeOpen(false)} />
          <View style={{ backgroundColor:c.card, borderTopLeftRadius:28, borderTopRightRadius:28,
            padding:24, paddingBottom:insets.bottom+20, borderWidth:1, borderColor:c.border }}>
            <Text style={{ color:c.textPrimary, fontSize:18, fontWeight:"800", marginBottom:20, textAlign:"center" }}>
              🎨 Thème de la discussion
            </Text>
            <View style={{ flexDirection:"row", flexWrap:"wrap", gap:12, justifyContent:"space-between" }}>
              {CHAT_THEMES.map(t => (
                <Pressable key={t.id} onPress={() => saveTheme(t)}
                  style={({pressed}) => [{ width:"22%", borderRadius:16, overflow:"hidden",
                    borderWidth:2.5, borderColor: chatTheme.id===t.id?"#FFF":"transparent" }, pressed&&{opacity:0.8}]}>
                  <LinearGradient colors={t.colors} style={{ height:54, alignItems:"center", justifyContent:"center", borderRadius:13 }}>
                    {chatTheme.id===t.id && <Ionicons name="checkmark" size={20} color="#FFF" />}
                  </LinearGradient>
                  <Text style={{ color:c.textSecondary, fontSize:11, textAlign:"center", marginTop:5 }}>{t.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
