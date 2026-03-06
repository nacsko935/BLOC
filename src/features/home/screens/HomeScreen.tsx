import { Href, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Image, Modal,
  Pressable, RefreshControl, Share, Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { PostCard } from "../../../../src/components/PostCard";
import { TrendCard } from "../../../../src/components/TrendCard";
import { FeedPost } from "../../../../types/db";
import { trendsMock, TrendItem } from "../homeMock";
import { useFeedStore } from "../../../../state/useFeedStore";
import { useAuthStore } from "../../../../state/useAuthStore";
import { useNotificationsStore } from "../../../../state/useNotificationsStore";
import { blockUser, hidePost, reportTarget } from "../../../../lib/services/moderationService";
import { searchUsers, searchPosts } from "../../../../lib/services/searchService";
import { seedInitialContentIfEmptyDev } from "../../../../lib/dev/seed";

// Posts de démonstration affichés quand Supabase est vide/non configuré
const DEMO_FEED_POSTS: FeedPost[] = [
  { id:"demo-1", author_id:"bot-1", filiere:"Informatique", title:"QCM Sécurité Réseaux – Corrigé", content:"15 questions sur les firewalls, VPN et protocoles SSL/TLS. Niveau partiel. Idéal pour valider ses connaissances avant l'exam.", type:"qcm", attachment_url:null, created_at:new Date().toISOString(),
    author:{ id:"bot-1", username:"prof.martin", full_name:"Prof. Martin", avatar_url:null, filiere:"Informatique", niveau:"L3", bio:null },
    likesCount:42, commentsCount:7, savesCount:5, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:3 },
  { id:"demo-2", author_id:"bot-2", filiere:"Développement", title:"Fiche React Native – Hooks essentiels", content:"useState, useEffect, useCallback et useRef condensés en 1 page. Patterns de navigation inclus. Save ce post pour tes révisions !", type:"pdf", attachment_url:null, created_at:new Date(Date.now()-1800000).toISOString(),
    author:{ id:"bot-2", username:"nadia.dev", full_name:"Nadia Selmi", avatar_url:null, filiere:"Développement", niveau:"L3", bio:null },
    likesCount:28, commentsCount:4, savesCount:11, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:6 },
  { id:"demo-3", author_id:"bot-3", filiere:"Général", title:"✅ Checklist candidature alternance", content:"Template de suivi de candidature + relances RH en 3 étapes. Utilisé par +200 étudiants l'an dernier. 100% gratuit à télécharger.", type:"text", attachment_url:null, created_at:new Date(Date.now()-3600000).toISOString(),
    author:{ id:"bot-3", username:"bloc.team", full_name:"Équipe BLOC", avatar_url:null, filiere:"Général", niveau:"L2", bio:null },
    likesCount:89, commentsCount:12, savesCount:34, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:21 },
  { id:"demo-4", author_id:"bot-4", filiere:"IA / Data", title:"QCM IA Générative – 20 questions", content:"Questions sur les prompts, hallucinations et évaluation de modèles. Idéal pour se préparer à l'exam de machine learning.", type:"qcm", attachment_url:null, created_at:new Date(Date.now()-5400000).toISOString(),
    author:{ id:"bot-4", username:"leila.ai", full_name:"Leila AI", avatar_url:null, filiere:"IA / Data", niveau:"M1", bio:null },
    likesCount:56, commentsCount:9, savesCount:22, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:8 },
  { id:"demo-5", author_id:"bot-5", filiere:"Informatique", title:"Résumé SGBD – Jointures & Transactions", content:"Plan compact pour couvrir jointures, index et transactions avant le partiel. 8 pages synthétisées depuis le cours magistral.", type:"pdf", attachment_url:null, created_at:new Date(Date.now()-7200000).toISOString(),
    author:{ id:"bot-5", username:"samir.ds", full_name:"Samir DS", avatar_url:null, filiere:"Informatique", niveau:"L3", bio:null },
    likesCount:31, commentsCount:3, savesCount:8, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:2 },
  { id:"demo-6", author_id:"bot-6", filiere:"Développement", title:"💡 Git rebase vs merge — quand utiliser quoi ?", content:"Rebase pour un historique propre en solo, merge pour les branches partagées. Avec exemples visuels et cas concrets tirés de projets réels.", type:"text", attachment_url:null, created_at:new Date(Date.now()-10800000).toISOString(),
    author:{ id:"bot-6", username:"karim.code", full_name:"Karim Code", avatar_url:null, filiere:"Développement", niveau:"M1", bio:null },
    likesCount:63, commentsCount:14, savesCount:19, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:11 },
  { id:"demo-7", author_id:"bot-7", filiere:"Cybersécurité", title:"🔐 Top 10 failles OWASP – Résumé 2025", content:"Injection SQL, XSS, CSRF, IDOR… Les 10 vulnérabilités web les plus critiques expliquées avec exemples de code vulnérable et patchs recommandés.", type:"pdf", attachment_url:null, created_at:new Date(Date.now()-14400000).toISOString(),
    author:{ id:"bot-7", username:"sec.watcher", full_name:"Sec Watcher", avatar_url:null, filiere:"Cybersécurité", niveau:"M2", bio:null },
    likesCount:101, commentsCount:18, savesCount:47, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:33 },
  { id:"demo-8", author_id:"bot-8", filiere:"Général", title:"🧠 Mémoriser 2× plus vite — méthode prouvée", content:"Répétition espacée (Anki) + méthode Feynman + interleaving. Résultats prouvés sur 3 semaines de test avec 50 étudiants. Adopte-la maintenant.", type:"text", attachment_url:null, created_at:new Date(Date.now()-18000000).toISOString(),
    author:{ id:"bot-8", username:"studylab", full_name:"Study Lab", avatar_url:null, filiere:"Général", niveau:"L2", bio:null },
    likesCount:154, commentsCount:22, savesCount:88, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:45 },
  { id:"demo-9", author_id:"bot-9", filiere:"Mathématiques", title:"📐 Résumé Analyse L2 – Séries entières", content:"Rayon de convergence, développements limités usuels et applications. 3 pages condensées depuis les 12 TD du semestre.", type:"pdf", attachment_url:null, created_at:new Date(Date.now()-21600000).toISOString(),
    author:{ id:"bot-9", username:"maths.pro", full_name:"Maths Pro", avatar_url:null, filiere:"Mathématiques", niveau:"L2", bio:null },
    likesCount:44, commentsCount:6, savesCount:29, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:7 },
  { id:"demo-10", author_id:"bot-10", filiere:"Général", title:"🚀 BLOC IA est là — génère tes QCM auto", content:"Upload ton cours PDF ou prends une photo de tes notes, et l'IA génère automatiquement des QCM pour te tester. Clique sur Créer > QCM IA pour essayer maintenant !", type:"text", attachment_url:null, created_at:new Date(Date.now()-25200000).toISOString(),
    author:{ id:"bot-10", username:"bloc.team", full_name:"Équipe BLOC", avatar_url:null, filiere:"Général", niveau:"Team", bio:null },
    likesCount:203, commentsCount:31, savesCount:112, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:67 },
  { id:"demo-11", author_id:"bot-11", filiere:"Économie", title:"📊 Cours Microéconomie – Equilibre de Nash", content:"Théorie des jeux appliquée : équilibre de Nash, dilemme du prisonnier, stratégies dominantes. Exemples corrigés inclus.", type:"pdf", attachment_url:null, created_at:new Date(Date.now()-32400000).toISOString(),
    author:{ id:"bot-11", username:"eco.prof", full_name:"Prof. Éco", avatar_url:null, filiere:"Économie", niveau:"M1", bio:null },
    likesCount:37, commentsCount:5, savesCount:18, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:4 },
  { id:"demo-12", author_id:"bot-12", filiere:"Développement", title:"⚡ TypeScript en 10 minutes — l'essentiel", content:"Types, interfaces, génériques et décorateurs. Le minimum vital pour un projet React/Node sérieux. Exemples compilables fournis.", type:"text", attachment_url:null, created_at:new Date(Date.now()-36000000).toISOString(),
    author:{ id:"bot-12", username:"ts.master", full_name:"TS Master", avatar_url:null, filiere:"Développement", niveau:"M2", bio:null },
    likesCount:82, commentsCount:17, savesCount:41, likedByMe:false, savedByMe:false, repostedByMe:false, repostsCount:19 },
];


/* ── Skeleton card ─────────────────────────────────────────────── */
function SkeletonPost({ c }: { c: any }) {
  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 2 }}>
      <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 16 }}>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.cardAlt }} />
          <View style={{ gap: 8, flex: 1 }}>
            <View style={{ height: 14, width: "50%", borderRadius: 7, backgroundColor: c.cardAlt }} />
            <View style={{ height: 12, width: "30%", borderRadius: 6, backgroundColor: c.cardAlt }} />
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ height: 13, width: "95%", borderRadius: 6, backgroundColor: c.cardAlt }} />
          <View style={{ height: 13, width: "80%", borderRadius: 6, backgroundColor: c.cardAlt }} />
          <View style={{ height: 13, width: "60%", borderRadius: 6, backgroundColor: c.cardAlt }} />
        </View>
      </View>
    </View>
  );
}

/* ── Modal recherche ─────────────────────────────────────────────── */
function SearchModal({ visible, onClose, c }: { visible: boolean; onClose: () => void; c: any }) {
  const [query,   setQuery]   = useState("");
  const [users,   setUsers]   = useState<any[]>([]);
  const [posts,   setPosts]   = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState<"users"|"posts">("users");

  useEffect(() => {
    if (visible) { setQuery(""); setUsers([]); setPosts([]); }
  }, [visible]);

  useEffect(() => {
    if (!query.trim()) { setUsers([]); setPosts([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [u, p] = await Promise.all([searchUsers(query), searchPosts(query)]);
        setUsers(u); setPosts(p);
      } catch {} finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border }}>
          <Pressable onPress={onClose} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-back" size={20} color={c.textPrimary} />
          </Pressable>
          <TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Chercher utilisateurs ou publications…" placeholderTextColor={c.textSecondary}
            style={{ flex: 1, backgroundColor: c.cardAlt, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, height: 42, color: c.textPrimary, fontSize: 15 }} autoCapitalize="none" />
          {loading && <ActivityIndicator color={c.accentPurple} size="small" />}
        </View>
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: c.border }}>
          {(["users", "posts"] as const).map(t => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 13, alignItems: "center", borderBottomWidth: 2, borderBottomColor: tab === t ? c.accentPurple : "transparent" }}>
              <Text style={{ color: tab === t ? c.accentPurple : c.textSecondary, fontWeight: "700", fontSize: 14 }}>
                {t === "users" ? `Utilisateurs (${users.length})` : `Publications (${posts.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
        <FlatList
          data={tab === "users" ? users : posts}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40, gap: 8 }}>
              <Ionicons name="search-outline" size={38} color={c.textSecondary} />
              <Text style={{ color: c.textSecondary, fontSize: 15 }}>
                {query.trim() ? `Aucun résultat pour "${query}"` : "Commence à taper…"}
              </Text>
            </View>
          }
          renderItem={({ item }) => tab === "users" ? (
            <Pressable style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 14 }, pressed && { opacity: 0.8 }]}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentPurple + "25", alignItems: "center", justifyContent: "center" }}>
                {item.avatar_url
                  ? <Image source={{ uri: item.avatar_url }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                  : <Text style={{ color: c.accentPurple, fontWeight: "800", fontSize: 16 }}>{(item.full_name || item.username || "?").charAt(0).toUpperCase()}</Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 15 }}>{item.full_name || item.username}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 12 }}>@{item.username}{item.filiere ? ` · ${item.filiere}` : ""}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
            </Pressable>
          ) : (
            <Pressable style={({ pressed }) => [{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 14 }, pressed && { opacity: 0.8 }]}>
              <Text style={{ color: c.textPrimary, fontWeight: "700" }} numberOfLines={1}>{item.title || "Sans titre"}</Text>
              <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4 }} numberOfLines={2}>{item.content}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

/* ── HomeScreen principal ────────────────────────────────────────── */
function HomeScreenComponent() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c }   = useTheme();
  const { profile } = useAuthStore();
  const { posts, loading, refreshing, loadingMore, commentsByPost, commentsLoading, refresh, loadMore, toggleLike, toggleSave, toggleRepost, openComments, addComment } = useFeedStore();

  const { unreadCount: notifCount, load: loadNotifs } = useNotificationsStore();
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [commentText, setCommentText]   = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [visibleDemoPosts, setVisibleDemoPosts] = useState<FeedPost[]>(DEMO_FEED_POSTS.slice(0, 5));
  const filiere = profile?.filiere || undefined;

  useEffect(() => { refresh(filiere).catch(() => null); }, [refresh, filiere]);
  useEffect(() => { loadNotifs(); }, [loadNotifs]);
  // Rotation automatique des posts bots toutes les 30 secondes
  useEffect(() => {
    if (posts.length > 0) return; // Ne tourner que si pas de vraies données
    const interval = setInterval(() => {
      setVisibleDemoPosts(prev => {
        const all = DEMO_FEED_POSTS;
        const firstId = prev[0]?.id;
        const currentIdx = all.findIndex(p => p.id === firstId);
        const next = (currentIdx + 1) % all.length;
        return [...all.slice(next, next + 5), ...all.slice(0, Math.max(0, 5 - (all.length - next)))];
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [posts.length]);
  useEffect(() => {
    seedInitialContentIfEmptyDev()
      .then(r => { if (r) refresh(filiere).catch(() => null); })
      .catch(() => null);
  }, [refresh, filiere]);

  const onPressTrend    = useCallback((t: TrendItem) => router.push(`/trends/${t.id}` as Href), [router]);
  const onPressContent  = useCallback((p: FeedPost) => router.push(`/content/${p.id}` as Href), [router]);
  const onPressComments = useCallback(async (p: FeedPost) => {
    setSelectedPost(p);
    await openComments(p.id).catch(() => null);
  }, [openComments]);

  const submitComment = useCallback(async () => {
    if (!selectedPost || !commentText.trim()) return;
    await addComment(selectedPost.id, commentText.trim()).catch(() => null);
    setCommentText("");
  }, [addComment, commentText, selectedPost]);

  const handleShare = async (p: FeedPost) => {
    await Share.share({
      title:   p.title || "BLOC",
      message: `${p.title ? p.title + "\n\n" : ""}${p.content}\n\nhttps://blocapp.fr/post/${p.id}`,
      url:     `https://blocapp.fr/post/${p.id}`,
    }).catch(() => null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>

      {/* ── Header ── */}
      <View style={{
        paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 10,
        backgroundColor: c.background, borderBottomWidth: 1, borderBottomColor: c.border,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Avatar + Titre */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => router.push("/(tabs)/profile")}
            style={{ width: 34, height: 34, borderRadius: 17, overflow: "hidden", backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
            {profile?.avatar_url
              ? <Image source={{ uri: profile.avatar_url }} style={{ width: 34, height: 34 }} />
              : <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 14 }}>{(profile?.full_name || "B").charAt(0)}</Text>
            }
          </Pressable>
          <Text style={{ color: c.textPrimary, fontSize: 22, fontWeight: "800", letterSpacing: -0.4 }}>Accueil</Text>
        </View>

        {/* Icônes droite : Cloche + Messagerie */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* 🔔 Notifications */}
          <Pressable
            onPress={() => router.push("/notifications" as any)}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.border, position: "relative" }}
          >
            <Ionicons name="notifications-outline" size={18} color={c.textPrimary} />
            {notifCount > 0 && (
              <View style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: c.danger, borderWidth: 1.5, borderColor: c.background }} />
            )}
          </Pressable>
          {/* 💬 Messagerie */}
          <Pressable
            onPress={() => router.push("/messages" as any)}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.border }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={c.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* ── Feed ── */}
      <FlatList
        data={posts.length > 0 ? posts : (loading ? [] : visibleDemoPosts)}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(filiere)} tintColor={c.accentPurple} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => loadMore(filiere)}
        ListHeaderComponent={
          <View>
            {/* Tendances */}
            <View style={{ paddingHorizontal: 16, paddingTop: 14, marginBottom: 10 }}>
              <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "800" }}>Tendances</Text>
            </View>
            <FlatList
              data={trendsMock} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <TrendCard item={item} onPress={onPressTrend} />}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14 }}
            />
            {/* Fil d'actu + recherche */}
            <View style={{ borderTopWidth: 1, borderTopColor: c.border, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "800" }}>Fil d'actu</Text>
                <Text style={{ color: c.textSecondary, fontSize: 13 }}>{filiere || "Pour toi"}</Text>
              </View>
              {/* Barre recherche juste sous "Fil d'actu" */}
              <Pressable
                onPress={() => setSearchOpen(true)}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.cardAlt, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, height: 42, gap: 10, marginBottom: 14 }}
              >
                <Ionicons name="search-outline" size={16} color={c.textSecondary} />
                <Text style={{ color: c.textSecondary, fontSize: 14, flex: 1 }}>Rechercher utilisateurs, publications…</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View>
              {[1, 2, 3].map(i => <SkeletonPost key={i} c={c} />)}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
              <Ionicons name="newspaper-outline" size={44} color={c.textSecondary} />
              <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 16 }}>Fil d'actu vide</Text>
              <Text style={{ color: c.textSecondary, textAlign: "center", fontSize: 14 }}>
                Connecte-toi pour voir les posts de ta filière.
              </Text>
              <Pressable
                onPress={() => router.push("/create/index")}
                style={{ height: 42, borderRadius: 999, backgroundColor: c.accentPurple, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: "#FFF", fontWeight: "800" }}>Créer une publication</Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={c.accentPurple} style={{ marginVertical: 14 }} /> : null}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={async id => { try { await toggleLike(id); } catch {} }}
            onToggleSave={async id => { try { await toggleSave(id); } catch {} }}
            onToggleRepost={async id => { try { await toggleRepost(id); } catch {} }}
            onPressComments={onPressComments}
            onPressContent={onPressContent}
            onPressShare={handleShare}
            onPressMore={p => Alert.alert("Actions", "", [
              { text: "Signaler",  onPress: async () => { try { await reportTarget({ targetType: "post", targetId: p.id, reason: "signalement" }); Alert.alert("Merci", "Signalement envoyé."); } catch {} } },
              { text: "Masquer",   onPress: async () => { try { await hidePost(p.id); await refresh(filiere); } catch {} } },
              { text: "Bloquer",   style: "destructive", onPress: async () => { if (!p.author?.id) return; try { await blockUser(p.author.id); await refresh(filiere); } catch {} } },
              { text: "Annuler",   style: "cancel" },
            ])}
          />
        )}
      />

      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} c={c} />

      {/* ── Modal commentaires ── */}
      <Modal visible={!!selectedPost} transparent animationType="slide" onRequestClose={() => setSelectedPost(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setSelectedPost(null)} />
          <View style={{ backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: c.border, padding: 20, maxHeight: "65%", minHeight: 300 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "800" }}>Commentaires</Text>
              <Pressable onPress={() => setSelectedPost(null)}>
                <Ionicons name="close" size={22} color={c.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={selectedPost ? commentsByPost[selectedPost.id] ?? [] : []}
              keyExtractor={i => i.id}
              style={{ maxHeight: 200 }}
              ListEmptyComponent={
                <Text style={{ color: c.textSecondary, textAlign: "center", paddingVertical: 20 }}>
                  {commentsLoading ? "Chargement…" : "Aucun commentaire — sois le premier !"}
                </Text>
              }
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: c.textPrimary, fontSize: 11, fontWeight: "800" }}>{(item.author?.username || "?").charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 13 }}>@{item.author?.username || "utilisateur"}</Text>
                  </View>
                  <Text style={{ color: c.textPrimary, marginTop: 5, marginLeft: 36, lineHeight: 19 }}>{item.content}</Text>
                </View>
              )}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 }}>
              <TextInput
                value={commentText} onChangeText={setCommentText}
                placeholder="Ajouter un commentaire…" placeholderTextColor={c.textSecondary}
                style={{ flex: 1, backgroundColor: c.cardAlt, borderWidth: 1, borderColor: c.border, color: c.textPrimary, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 }}
                multiline
              />
              <Pressable
                onPress={submitComment}
                style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.accentPurple, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="send" size={17} color="#FFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const HomeScreen = memo(HomeScreenComponent);
