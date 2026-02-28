import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, FlatList, Image,
  Modal, Pressable, ScrollView, Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../state/useAuthStore";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { useFeedStore } from "../../state/useFeedStore";
import { PostCard } from "../../src/components/PostCard";

type ProfileTab = "posts"|"contenus"|"groupes";
const TABS: { key: ProfileTab; label: string }[] = [
  { key:"posts",    label:"Posts"    },
  { key:"contenus", label:"Contenus" },
  { key:"groupes",  label:"Groupes"  },
];

export default function ProfileTabRoute() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  const { profile, user, updateProfile, updateAvatar, signOut } = useAuthStore();
  const { posts, refresh, toggleLike, toggleSave, openComments, addComment, commentsByPost, commentsLoading, createPost } = useFeedStore();

  const [tab,         setTab]         = useState<ProfileTab>("posts");
  const [editVisible, setEditVisible] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [fullName,    setFullName]    = useState(profile?.full_name||"");
  const [username,    setUsername]    = useState(profile?.username||"");
  const [bio,         setBio]         = useState(profile?.bio||"");
  const [postTitle,   setPostTitle]   = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage,   setPostImage]   = useState<string | null>(null);
  const [postFile,    setPostFile]    = useState<{ name: string; uri: string; type: "video" | "file" } | null>(null);
  const [posting,     setPosting]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string|null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => { setFullName(profile?.full_name||""); setUsername(profile?.username||""); setBio(profile?.bio||""); }, [profile]);
  useEffect(() => { refresh(profile?.filiere||undefined).catch(()=>null); }, [refresh, profile?.filiere]);

  const myPosts = useMemo(() => posts.filter(p => p.author?.id === user?.id || p.author_id === user?.id), [posts, user?.id]);
  const headerOpacity = scrollY.interpolate({ inputRange:[80,140], outputRange:[0,1], extrapolate:"clamp" });

  const handlePhoto = () => Alert.alert("Photo de profil","", [
    { text:"Galerie",        onPress: pickLib },
    { text:"Appareil photo", onPress: pickCam },
    { text:"Annuler", style:"cancel" },
  ]);

  const doUpload = async (uri: string) => {
    setLocalAvatar(uri); setUploading(true);
    try { await updateAvatar(uri); }
    catch (e:any) { Alert.alert("Erreur", e?.message); }
    finally { setUploading(false); }
  };
  const pickLib = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaType.images, allowsEditing:true, aspect:[1,1], quality:0.85 });
    if (!r.canceled && r.assets[0]) doUpload(r.assets[0].uri);
  };
  const pickCam = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return;
    const r = await ImagePicker.launchCameraAsync({ allowsEditing:true, aspect:[1,1], quality:0.85 });
    if (!r.canceled && r.assets[0]) doUpload(r.assets[0].uri);
  };

  const handlePublish = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      await createPost({ title:postTitle.trim()||undefined, content:postContent.trim(), filiere:profile?.filiere||"Général" } as any);
      await refresh(profile?.filiere||undefined);
      setPostVisible(false); setPostTitle(""); setPostContent(""); setPostImage(null); setPostFile(null);
      Alert.alert("Publié ✅", "Ta publication est visible dans le fil d'actu.");
    } catch (e:any) { Alert.alert("Erreur", e?.message||"Impossible de publier."); }
    finally { setPosting(false); }
  };

  const pickPostImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.images, allowsEditing: true, quality: 0.85 });
    if (!r.canceled && r.assets[0]) { setPostImage(r.assets[0].uri); setPostFile(null); }
  };

  const pickPostVideo = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.videos });
    if (!r.canceled && r.assets[0]) { setPostFile({ name: r.assets[0].fileName || "video.mp4", uri: r.assets[0].uri, type: "video" }); setPostImage(null); }
  };

  const pickPostFile = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (r.canceled) return;
      const asset = r.assets[0];
      setPostFile({ name: asset.name, uri: asset.uri, type: "file" }); setPostImage(null);
    } catch {}
  };

  const avatarUri  = localAvatar || profile?.avatar_url || null;
  const displayName= profile?.full_name || user?.email?.split("@")[0] || "Utilisateur";
  const handle     = profile?.username  || user?.email?.split("@")[0] || "bloc";

  return (
    <View style={{ flex:1, backgroundColor:c.background }}>

      {/* Compact sticky header */}
      <Animated.View style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, opacity:headerOpacity, backgroundColor:c.background, paddingTop:insets.top, paddingHorizontal:16, paddingBottom:10, borderBottomWidth:1, borderBottomColor:c.border, flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
        <Text style={{ color:c.textPrimary, fontSize:18, fontWeight:"800" }}>{displayName}</Text>
        <View style={{ flexDirection:"row", gap:8 }}>
          <Pressable onPress={() => setPostVisible(true)} style={{ width:34,height:34,borderRadius:17,backgroundColor:c.accentPurple,alignItems:"center",justifyContent:"center" }}>
            <Ionicons name="add" size={18} color="#FFF" />
          </Pressable>
          <Pressable onPress={() => router.push("/settings")} style={{ width:34,height:34,borderRadius:17,backgroundColor:c.cardAlt,alignItems:"center",justifyContent:"center" }}>
            <Ionicons name="settings-outline" size={16} color={c.textPrimary} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{nativeEvent:{contentOffset:{y:scrollY}}}], {useNativeDriver:false})}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom:120 }}
      >
        {/* Bannière */}
        <LinearGradient colors={isDark ? ["#111111","#000000"] : ["#F0F0F0","#FFFFFF"]} style={{ height:150 }}>
          <View style={{ position:"absolute", top:insets.top+10, right:12, flexDirection:"row", gap:8 }}>
            <Pressable onPress={() => setPostVisible(true)} style={{ height:32, borderRadius:999, paddingHorizontal:14, backgroundColor:"rgba(0,0,0,0.30)", flexDirection:"row", alignItems:"center", gap:6 }}>
              <Ionicons name="add-circle-outline" size={15} color="#FFF" />
              <Text style={{ color:"#FFF", fontWeight:"700", fontSize:13 }}>Publier</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/settings")} style={{ width:32,height:32,borderRadius:16,backgroundColor:"rgba(0,0,0,0.30)",alignItems:"center",justifyContent:"center" }}>
              <Ionicons name="settings-outline" size={15} color="#FFF" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Avatar + actions */}
        <View style={{ paddingHorizontal:16 }}>
          <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"flex-end", marginTop:-44 }}>
            <Pressable onPress={handlePhoto} style={{ position:"relative" }}>
              <View style={{ width:88,height:88,borderRadius:44,overflow:"hidden",borderWidth:4,borderColor:c.background,backgroundColor:c.cardAlt,alignItems:"center",justifyContent:"center" }}>
                {avatarUri
                  ? <Image source={{uri:avatarUri}} style={{width:84,height:84,borderRadius:42}} resizeMode="cover" />
                  : <Text style={{color:c.textPrimary,fontSize:28,fontWeight:"800"}}>{displayName.slice(0,2).toUpperCase()}</Text>
                }
                {uploading && (
                  <View style={{ position:"absolute",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0,0,0,0.5)",alignItems:"center",justifyContent:"center" }}>
                    <ActivityIndicator color="#FFF" size="small" />
                  </View>
                )}
              </View>
              <View style={{ position:"absolute",right:0,bottom:0,width:26,height:26,borderRadius:13,backgroundColor:c.accentPurple,alignItems:"center",justifyContent:"center",borderWidth:2,borderColor:c.background }}>
                <Ionicons name="camera" size={11} color="#FFF" />
              </View>
            </Pressable>
            <View style={{ flexDirection:"row", gap:8, marginBottom:4 }}>
              <Pressable onPress={() => setEditVisible(true)} style={{ height:36, paddingHorizontal:16, borderRadius:999, borderWidth:1.5, borderColor:c.border, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:c.textPrimary, fontWeight:"700", fontSize:13 }}>Modifier</Text>
              </Pressable>
            </View>
          </View>

          {/* Infos */}
          <View style={{ marginTop:12, gap:4 }}>
            <Text style={{ color:c.textPrimary, fontSize:22, fontWeight:"800" }}>{displayName}</Text>
            <Text style={{ color:c.textSecondary, fontSize:14 }}>@{handle}</Text>
            {profile?.bio && <Text style={{ color:c.textPrimary, marginTop:6, lineHeight:20 }}>{profile.bio}</Text>}
            <View style={{ flexDirection:"row", flexWrap:"wrap", gap:10, marginTop:8 }}>
              {profile?.filiere && <View style={{ flexDirection:"row", alignItems:"center", gap:4 }}><Ionicons name="school-outline" size={13} color={c.textSecondary} /><Text style={{ color:c.textSecondary, fontSize:13 }}>{profile.filiere}</Text></View>}
              {profile?.niveau  && <View style={{ flexDirection:"row", alignItems:"center", gap:4 }}><Ionicons name="ribbon-outline" size={13} color={c.textSecondary} /><Text style={{ color:c.textSecondary, fontSize:13 }}>{profile.niveau}</Text></View>}
              <View style={{ flexDirection:"row", alignItems:"center", gap:4 }}><Ionicons name="calendar-outline" size={13} color={c.textSecondary} /><Text style={{ color:c.textSecondary, fontSize:13 }}>Membre 2025</Text></View>
            </View>
            {/* Stats */}
            <View style={{ flexDirection:"row", gap:18, marginTop:12 }}>
              <Pressable style={{ flexDirection:"row", gap:4 }}><Text style={{ color:c.textPrimary, fontWeight:"800", fontSize:15 }}>{myPosts.length}</Text><Text style={{ color:c.textSecondary, fontSize:14 }}>Posts</Text></Pressable>
              <Pressable style={{ flexDirection:"row", gap:4 }}><Text style={{ color:c.textPrimary, fontWeight:"800", fontSize:15 }}>9</Text><Text style={{ color:c.textSecondary, fontSize:14 }}>Abonnements</Text></Pressable>
              <Pressable style={{ flexDirection:"row", gap:4 }}><Text style={{ color:c.textPrimary, fontWeight:"800", fontSize:15 }}>11</Text><Text style={{ color:c.textSecondary, fontSize:14 }}>Abonnés</Text></Pressable>
            </View>
          </View>
        </View>

        {/* Onglets style Twitter */}
        <View style={{ borderTopWidth:1, borderTopColor:c.border, marginTop:16, flexDirection:"row" }}>
          {TABS.map(t => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={{ flex:1, paddingVertical:14, alignItems:"center", borderBottomWidth:2, borderBottomColor:tab===t.key?c.accentPurple:"transparent" }}>
              <Text style={{ color:tab===t.key?c.accentPurple:c.textSecondary, fontWeight:"700", fontSize:14 }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Contenu onglet */}
        {tab === "posts" && (
          myPosts.length > 0 ? (
            myPosts.map(p => (
              <PostCard key={p.id} post={p}
                onToggleLike={async id => { try { await toggleLike(id); } catch {} }}
                onToggleSave={async id => { try { await toggleSave(id); } catch {} }}
                onPressComments={async post => { await openComments(post.id).catch(()=>null); }}
                onPressContent={post => router.push(`/content/${post.id}` as any)}
                onPressMore={() => {}}
              />
            ))
          ) : (
            <View style={{ alignItems:"center", paddingVertical:40, gap:12 }}>
              <Ionicons name="create-outline" size={40} color={c.textSecondary} />
              <Text style={{ color:c.textPrimary, fontWeight:"700", fontSize:16 }}>Aucun post</Text>
              <Text style={{ color:c.textSecondary, textAlign:"center" }}>Partage ta première publication.</Text>
              <Pressable onPress={() => setPostVisible(true)} style={{ height:40, borderRadius:999, backgroundColor:c.accentPurple, paddingHorizontal:20, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:"#FFF", fontWeight:"800" }}>Publier maintenant</Text>
              </Pressable>
            </View>
          )
        )}
        {tab !== "posts" && (
          <View style={{ alignItems:"center", paddingVertical:40, gap:8 }}>
            <Ionicons name={tab==="contenus"?"folder-outline":"people-outline"} size={38} color={c.textSecondary} />
            <Text style={{ color:c.textSecondary, fontSize:15 }}>{tab==="contenus"?"Aucun contenu sauvegardé":"Aucun groupe rejoint"}</Text>
          </View>
        )}

        {/* Déconnexion */}
        <Pressable onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
          style={({ pressed }) => [{ flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, marginHorizontal:16, marginTop:24, height:44, borderRadius:14, borderWidth:1, borderColor:"rgba(255,59,48,0.25)", backgroundColor:"rgba(255,59,48,0.06)" }, pressed && { opacity:0.7 }]}>
          <Ionicons name="log-out-outline" size={16} color="#FF3B30" />
          <Text style={{ color:"#FF3B30", fontWeight:"700" }}>Se déconnecter</Text>
        </Pressable>
      </Animated.ScrollView>

      {/* Modal publier depuis profil */}
      <Modal visible={postVisible} transparent animationType="slide" onRequestClose={() => setPostVisible(false)}>
        <View style={{ flex:1, justifyContent:"flex-end", backgroundColor:"rgba(0,0,0,0.65)" }}>
          <Pressable style={{ position:"absolute",top:0,left:0,right:0,bottom:0 }} onPress={() => setPostVisible(false)} />
          <View style={{ backgroundColor:c.card, borderTopLeftRadius:28, borderTopRightRadius:28, borderWidth:1, borderColor:c.border, padding:20, paddingBottom:insets.bottom+20 }}>
            {/* Header modal */}
            <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <Pressable onPress={() => setPostVisible(false)}>
                <Ionicons name="close" size={22} color={c.textSecondary} />
              </Pressable>
              <Text style={{ color:c.textPrimary, fontSize:18, fontWeight:"800" }}>Nouvelle publication</Text>
              <Pressable onPress={handlePublish} disabled={posting||!postContent.trim()}
                style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:999, backgroundColor:c.accentPurple, opacity: posting||!postContent.trim()?0.5:1 }}>
                {posting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={{ color:"#FFF", fontWeight:"800", fontSize:13 }}>Publier</Text>}
              </Pressable>
            </View>

            {/* Avatar + auteur */}
            <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:14 }}>
              <View style={{ width:40, height:40, borderRadius:20, backgroundColor:c.cardAlt, alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                {avatarUri
                  ? <Image source={{ uri:avatarUri }} style={{ width:40, height:40 }} />
                  : <Text style={{ color:c.textPrimary, fontWeight:"800" }}>{displayName.slice(0,2).toUpperCase()}</Text>
                }
              </View>
              <View>
                <Text style={{ color:c.textPrimary, fontWeight:"700" }}>{displayName}</Text>
                {profile?.bio ? <Text style={{ color:c.textSecondary, fontSize:12 }} numberOfLines={1}>{profile.bio}</Text> : null}
              </View>
            </View>

            {/* Titre */}
            <TextInput value={postTitle} onChangeText={setPostTitle} placeholder="Titre (optionnel)" placeholderTextColor={c.textSecondary}
              style={{ backgroundColor:c.cardAlt, borderRadius:12, borderWidth:1, borderColor:c.border, paddingHorizontal:14, paddingVertical:10, color:c.textPrimary, fontSize:15, marginBottom:10 }} />

            {/* Contenu */}
            <TextInput value={postContent} onChangeText={setPostContent} placeholder="Exprime-toi…" placeholderTextColor={c.textSecondary}
              style={{ backgroundColor:c.cardAlt, borderRadius:12, borderWidth:1, borderColor:c.border, paddingHorizontal:14, paddingVertical:12, color:c.textPrimary, fontSize:15, minHeight:90, textAlignVertical:"top", marginBottom:12 }} multiline />

            {/* Aperçu image */}
            {postImage && (
              <View style={{ position:"relative", marginBottom:12 }}>
                <Image source={{ uri:postImage }} style={{ width:"100%", height:160, borderRadius:12 }} resizeMode="cover" />
                <Pressable onPress={() => setPostImage(null)}
                  style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:14, backgroundColor:"rgba(0,0,0,0.6)", alignItems:"center", justifyContent:"center" }}>
                  <Ionicons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            )}

            {/* Aperçu fichier/vidéo */}
            {postFile && (
              <View style={{ flexDirection:"row", alignItems:"center", gap:10, backgroundColor:c.cardAlt, borderRadius:12, borderWidth:1, borderColor:c.border, padding:12, marginBottom:12 }}>
                <View style={{ width:40, height:40, borderRadius:10, backgroundColor: postFile.type==="video" ? "#FF3B30"+"22" : "#007AFF"+"22", alignItems:"center", justifyContent:"center" }}>
                  <Ionicons name={postFile.type==="video" ? "videocam" : "document"} size={20} color={postFile.type==="video" ? "#FF3B30" : "#007AFF"} />
                </View>
                <Text style={{ color:c.textPrimary, fontWeight:"600", flex:1, fontSize:13 }} numberOfLines={1}>{postFile.name}</Text>
                <Pressable onPress={() => setPostFile(null)}>
                  <Ionicons name="close-circle" size={20} color={c.textSecondary} />
                </Pressable>
              </View>
            )}

            {/* Actions bas */}
            <View style={{ flexDirection:"row", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <Pressable onPress={pickPostImage}
                style={{ flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:12, paddingVertical:8, borderRadius:10, backgroundColor:c.cardAlt, borderWidth:1, borderColor:c.border }}>
                <Ionicons name="image-outline" size={16} color={c.accentPurple} />
                <Text style={{ color:c.accentPurple, fontWeight:"700", fontSize:12 }}>Photo</Text>
              </Pressable>
              <Pressable onPress={pickPostVideo}
                style={{ flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:12, paddingVertical:8, borderRadius:10, backgroundColor:c.cardAlt, borderWidth:1, borderColor:c.border }}>
                <Ionicons name="videocam-outline" size={16} color="#FF3B30" />
                <Text style={{ color:"#FF3B30", fontWeight:"700", fontSize:12 }}>Vidéo</Text>
              </Pressable>
              <Pressable onPress={pickPostFile}
                style={{ flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:12, paddingVertical:8, borderRadius:10, backgroundColor:c.cardAlt, borderWidth:1, borderColor:c.border }}>
                <Ionicons name="attach-outline" size={16} color="#007AFF" />
                <Text style={{ color:"#007AFF", fontWeight:"700", fontSize:12 }}>Fichier</Text>
              </Pressable>
              <Text style={{ color:c.textSecondary, fontSize:12, flex:1, textAlign:"right" }}>
                {postContent.length > 0 ? `${postContent.length} car.` : ""}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal modifier profil */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
          <Pressable style={{ position:"absolute",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0,0,0,0.65)" }} onPress={() => setEditVisible(false)} />
          <View style={{ width:"92%", backgroundColor:c.card, borderWidth:1, borderColor:c.border, borderRadius:20, padding:20, gap:12 }}>
            <Text style={{ color:c.textPrimary, fontSize:18, fontWeight:"800" }}>Modifier le profil</Text>
            {[
              { label:"Nom complet",        value:fullName,  setter:setFullName,  ph:"Ton nom"             },
              { label:"Nom d'utilisateur",  value:username,  setter:setUsername,  ph:"@username"           },
              { label:"Bio",                value:bio,       setter:setBio,       ph:"Décris-toi…", multi:true },
            ].map(({ label, value, setter, ph, multi }) => (
              <View key={label} style={{ gap:5 }}>
                <Text style={{ color:c.textSecondary, fontSize:11, fontWeight:"700", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</Text>
                <TextInput value={value} onChangeText={setter} placeholder={ph} placeholderTextColor={c.textSecondary}
                  style={{ borderRadius:12, borderWidth:1, borderColor:c.border, backgroundColor:c.cardAlt, color:c.textPrimary, paddingHorizontal:14, paddingVertical:10, fontSize:15, ...(multi?{minHeight:78,textAlignVertical:"top"}:{}) }}
                  multiline={!!multi} />
              </View>
            ))}
            <View style={{ flexDirection:"row", gap:10, marginTop:4 }}>
              <Pressable onPress={() => setEditVisible(false)} style={{ flex:1, height:44, borderRadius:14, borderWidth:1, borderColor:c.border, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:c.textPrimary, fontWeight:"700" }}>Annuler</Text>
              </Pressable>
              <Pressable onPress={async () => { await updateProfile({full_name:fullName,username,bio}); setEditVisible(false); }} style={{ flex:1, height:44, borderRadius:14, backgroundColor:c.accentPurple, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:"#FFF", fontWeight:"800" }}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
