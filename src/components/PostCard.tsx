import { memo, useRef, useState } from "react";
import { Alert, Animated, Image, Pressable, Share, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../core/theme/ThemeProvider";
import { FeedPost } from "../../types/db";

type Props = {
  post: FeedPost;
  onToggleLike:    (id: string) => void;
  onToggleSave:    (id: string) => void;
  onPressComments: (post: FeedPost) => void;
  onPressContent:  (post: FeedPost) => void;
  onPressMore:     (post: FeedPost) => void;
  onPressFollow?:  (post: FeedPost) => void;
  onPressShare?:   (post: FeedPost) => void;
};

function relDate(s: string) {
  const d = Math.max(1, Math.floor((Date.now() - new Date(s).getTime()) / 1000));
  if (d < 60)  return "à l'instant";
  if (d < 3600) return `${Math.floor(d/60)} min`;
  if (d < 86400) return `${Math.floor(d/3600)} h`;
  return `${Math.floor(d/86400)} j`;
}

const SPARKLE_OFFSETS = [
  {x:-20,y:-18},{x:14,y:-22},{x:22,y:-6},{x:-22,y:-4},{x:2,y:-26},{x:18,y:-20},{x:-10,y:-26},
];
const SPARKLE_COLORS = ["#FFD700","#FF6B6B","#7B6CFF","#FF85AB","#50E3C2","#FFA500","#00D2FF"];

function Sparkle({ anim, x, y, color }: any) {
  const opacity    = anim.interpolate({ inputRange:[0,0.25,1], outputRange:[0,1,0] });
  const scale      = anim.interpolate({ inputRange:[0,0.5,1],  outputRange:[0,1.6,0] });
  const ty         = anim.interpolate({ inputRange:[0,1],       outputRange:[0,y] });
  const tx         = anim.interpolate({ inputRange:[0,1],       outputRange:[0,x] });
  return (
    <Animated.View style={{ position:"absolute", opacity, transform:[{translateX:tx},{translateY:ty},{scale}], pointerEvents:"none" }}>
      <Text style={{ color, fontSize:11 }}>✦</Text>
    </Animated.View>
  );
}

function PostCardComponent({ post, onToggleLike, onToggleSave, onPressComments, onPressContent, onPressMore, onPressFollow, onPressShare }: Props) {
  const { c, isDark } = useTheme();
  const authorName = post.author?.full_name || post.author?.username || "Utilisateur";
  const handle     = post.author?.username || "bloc";
  const role       = post.author?.niveau   || "ÉTUDIANT";
  const isBot      = post.author?.id?.startsWith("b0000000");

  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const [liked, setLiked]       = useState(post.likedByMe);
  const [likeCount, setCount]   = useState(post.likesCount);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>null);
    const next = !liked;
    setLiked(next); setCount(c => c + (next ? 1 : -1));
    if (next) {
      sparkleAnim.setValue(0);
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue:1.45, duration:120, useNativeDriver:true }),
        Animated.timing(scaleAnim, { toValue:0.85, duration:80,  useNativeDriver:true }),
        Animated.timing(scaleAnim, { toValue:1.2,  duration:100, useNativeDriver:true }),
        Animated.timing(scaleAnim, { toValue:1,    duration:80,  useNativeDriver:true }),
      ]).start();
      Animated.timing(sparkleAnim, { toValue:1, duration:650, useNativeDriver:true }).start(() => sparkleAnim.setValue(0));
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue:0.85, duration:80,  useNativeDriver:true }),
        Animated.timing(scaleAnim, { toValue:1,    duration:100, useNativeDriver:true }),
      ]).start();
    }
    onToggleLike(post.id);
  };

  const handleShare = async () => {
    if (onPressShare) return onPressShare(post);
    await Share.share({
      title:   post.title || "Publication BLOC",
      message: `${post.title ? post.title+"\n\n" : ""}${post.content}\n\n📚 Partagé depuis BLOC\nhttps://blocapp.fr/post/${post.id}`,
      url:     `https://blocapp.fr/post/${post.id}`,
    }).catch(()=>null);
  };

  const roleBg   = role.toLowerCase().includes("prof") || role==="Staff" ? "#FF8C0018" : "#3D8FFF18";
  const roleColor= role.toLowerCase().includes("prof") || role==="Staff" ? "#FF8C00"   : "#4DA3FF";

  return (
    <View style={{ backgroundColor:c.card, borderBottomWidth:1, borderBottomColor:c.border, paddingHorizontal:16, paddingTop:14, paddingBottom:12 }}>
      {/* Row auteur */}
      <View style={{ flexDirection:"row", gap:10 }}>
        <View style={{ width:44, height:44, borderRadius:22, backgroundColor: isBot ? "#7B6CFF22" : c.cardAlt, alignItems:"center", justifyContent:"center", borderWidth: isBot ? 1.5 : 0, borderColor:"#7B6CFF", position:"relative" }}>
          {post.author?.avatar_url
            ? <Image source={{ uri:post.author.avatar_url }} style={{ width:44, height:44, borderRadius:22 }} />
            : <Text style={{ color: isBot ? "#7B6CFF" : c.textPrimary, fontWeight:"800", fontSize:16 }}>{authorName.charAt(0).toUpperCase()}</Text>
          }
          {isBot && (
            <View style={{ position:"absolute", right:-3, bottom:-3, width:16, height:16, borderRadius:8, backgroundColor:"#7B6CFF", alignItems:"center", justifyContent:"center", borderWidth:1.5, borderColor:c.card }}>
              <Text style={{ fontSize:7, color:"#FFF" }}>✦</Text>
            </View>
          )}
        </View>

        <View style={{ flex:1 }}>
          <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
            <View style={{ flexDirection:"row", alignItems:"center", gap:5, flexShrink:1 }}>
              <Text style={{ color:c.textPrimary, fontWeight:"800", fontSize:14 }} numberOfLines={1}>{authorName}</Text>
              <Text style={{ color:c.textSecondary, fontSize:12 }}>@{handle}</Text>
              <Text style={{ color:c.textSecondary, fontSize:12 }}>· {relDate(post.created_at)}</Text>
            </View>
            <Pressable onPress={() => onPressMore(post)} style={{ padding:4 }}>
              <Ionicons name="ellipsis-horizontal" size={16} color={c.textSecondary} />
            </Pressable>
          </View>
          <View style={{ flexDirection:"row", alignItems:"center", gap:8, marginTop:3 }}>
            <View style={{ borderRadius:6, paddingHorizontal:7, paddingVertical:2, backgroundColor:roleBg }}>
              <Text style={{ color:roleColor, fontSize:10, fontWeight:"800" }}>{role.toUpperCase()}</Text>
            </View>
            {post.filiere && <Text style={{ color:c.textSecondary, fontSize:11 }}>{post.filiere}</Text>}
          </View>
        </View>
      </View>

      {/* Contenu */}
      <View style={{ marginTop:12, paddingLeft:54 }}>
        {post.title && <Text style={{ color:c.textPrimary, fontSize:16, fontWeight:"800", marginBottom:5, lineHeight:22 }}>{post.title}</Text>}
        <Text style={{ color:c.textPrimary, fontSize:15, lineHeight:21 }} numberOfLines={4}>{post.content}</Text>

        {/* Embed doc/qcm */}
        {post.type !== "text" && (
          <Pressable onPress={() => onPressContent(post)} style={({ pressed }) => [{ marginTop:10, backgroundColor:c.cardAlt, borderRadius:14, borderWidth:1, borderColor:c.border, padding:12, flexDirection:"row", alignItems:"center", gap:12 }, pressed && { opacity:0.85 }]}>
            <View style={{ width:40, height:40, borderRadius:12, backgroundColor: post.type==="qcm" ? "#7B6CFF22" : "#4DA3FF22", alignItems:"center", justifyContent:"center" }}>
              <Ionicons name={post.type==="qcm" ? "help-circle-outline" : "document-outline"} size={20} color={post.type==="qcm" ? "#7B6CFF" : "#4DA3FF"} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ color:c.textPrimary, fontWeight:"700", fontSize:14 }} numberOfLines={1}>{post.title||"Sans titre"}</Text>
              <Text style={{ color:c.textSecondary, fontSize:12, marginTop:2 }}>{post.type==="qcm" ? "Quiz interactif" : "Document PDF"}</Text>
            </View>
            <View style={{ height:30, borderRadius:999, paddingHorizontal:14, backgroundColor:post.type==="qcm"?"#7B6CFF":"#4DA3FF", alignItems:"center", justifyContent:"center" }}>
              <Text style={{ color:"#FFF", fontWeight:"800", fontSize:12 }}>{post.type==="qcm"?"Démarrer":"Ouvrir"}</Text>
            </View>
          </Pressable>
        )}

        {/* Actions */}
        <View style={{ flexDirection:"row", alignItems:"center", marginTop:14, gap:24 }}>

          {/* Like + paillettes */}
          <Pressable onPress={handleLike} style={{ flexDirection:"row", alignItems:"center", gap:5, position:"relative" }}>
            {SPARKLE_OFFSETS.map((s,i) => (
              <Sparkle key={i} anim={sparkleAnim} x={s.x} y={s.y} color={SPARKLE_COLORS[i%SPARKLE_COLORS.length]} />
            ))}
            <Animated.View style={{ transform:[{scale:scaleAnim}] }}>
              <Ionicons name={liked?"heart":"heart-outline"} size={21} color={liked?"#FF3B6B":c.textSecondary} />
            </Animated.View>
            <Text style={{ color:liked?"#FF3B6B":c.textSecondary, fontSize:14, fontWeight:liked?"700":"400", minWidth:20 }}>{likeCount}</Text>
          </Pressable>

          {/* Commentaires */}
          <Pressable onPress={() => onPressComments(post)} style={{ flexDirection:"row", alignItems:"center", gap:5 }}>
            <Ionicons name="chatbubble-outline" size={20} color={c.textSecondary} />
            <Text style={{ color:c.textSecondary, fontSize:14 }}>{post.commentsCount}</Text>
          </Pressable>

          {/* Sauvegarder */}
          <Pressable onPress={() => onToggleSave(post.id)} style={{ flexDirection:"row", alignItems:"center", gap:5 }}>
            <Ionicons name={post.savedByMe?"bookmark":"bookmark-outline"} size={20} color={post.savedByMe?c.accentBlue:c.textSecondary} />
            <Text style={{ color:post.savedByMe?c.accentBlue:c.textSecondary, fontSize:14 }}>{post.savesCount}</Text>
          </Pressable>

          {/* Partager avec vrai lien */}
          <Pressable onPress={handleShare}>
            <Ionicons name="arrow-redo-outline" size={21} color={c.textSecondary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const PostCard = memo(PostCardComponent);
