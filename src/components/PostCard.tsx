import { memo, useRef, useState } from "react";
import { Animated, Image, Pressable, Share, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTheme } from "../core/theme/ThemeProvider";
import { Avatar3D, isAvatar3DConfig } from "./Avatar3D";
import { FeedPost } from "../../types/db";

type Props = {
  post: FeedPost;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onPressComments: (post: FeedPost) => void;
  onPressContent: (post: FeedPost) => void;
  onPressAttachment?: (post: FeedPost) => void;
  onPressMore: (post: FeedPost) => void;
  onPressFollow?: (post: FeedPost) => void;
  onPressShare?: (post: FeedPost) => void;
  onToggleRepost?: (id: string) => void;
  currentUserId?: string;
};

function relDate(s: string) {
  const d = Math.max(1, Math.floor((Date.now() - new Date(s).getTime()) / 1000));
  if (d < 60) return "à l'instant";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}j`;
}

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  Professeur: { label:"Prof",      color:"#F59E0B", bg:"rgba(245,158,11,0.12)" },
  École:      { label:"École",     color:"#10B981", bg:"rgba(16,185,129,0.12)" },
  Étudiant:   { label:"Étudiant",  color:"#818CF8", bg:"rgba(129,140,248,0.12)" },
};

function getRole(post: FeedPost) {
  const raw = (post.author?.role || post.author?.account_type || "etudiant").toLowerCase();
  if (raw.includes("prof")) return "Professeur";
  if (raw.includes("ecole") || raw.includes("school")) return "École";
  return "Étudiant";
}

const SPARKLE_POS = [
  {x:-24,y:-18,c:"#FFD700"},{x:18,y:-26,c:"#A78BFF"},{x:28,y:-6,c:"#FF6B6B"},
  {x:-28,y:-4,c:"#50E3C2"},{x:6,y:-30,c:"#FF85AB"},{x:24,y:-20,c:"#FFA500"},
];

function Spark({ anim, x, y, c: col }: any) {
  const op = anim.interpolate({ inputRange:[0,0.15,0.85,1], outputRange:[0,1,0.8,0] });
  const sc = anim.interpolate({ inputRange:[0,0.4,1],       outputRange:[0,2,0.5] });
  const tx = anim.interpolate({ inputRange:[0,1],           outputRange:[0,x] });
  const ty = anim.interpolate({ inputRange:[0,1],           outputRange:[0,y] });
  return (
    <Animated.Text style={{
      position:"absolute", opacity:op,
      transform:[{translateX:tx},{translateY:ty},{scale:sc}],
      color:col, fontSize:9, pointerEvents:"none",
    }}>✦</Animated.Text>
  );
}

function PostCardInner({ post, onToggleLike, onToggleSave, onPressComments,
  onPressContent, onPressAttachment, onPressMore, onPressFollow, onPressShare, onToggleRepost, currentUserId }: Props) {
  const { c, isDark } = useTheme();
  const router = useRouter();

  const name      = post.author?.display_name || post.author?.full_name || post.author?.username || "Utilisateur";
  const handle    = post.author?.username || `user-${(post.author_id||"").slice(0,5)}`;
  const role      = getRole(post);
  const roleStyle = ROLE_STYLES[role];
  const isOwnPost = currentUserId && post.author_id === currentUserId;
  const initials  = name.slice(0,2).toUpperCase();

  const scaleA  = useRef(new Animated.Value(1)).current;
  const sparkA  = useRef(new Animated.Value(0)).current;
  const pressA  = useRef(new Animated.Value(1)).current;

  const [liked,    setLiked]   = useState(post.likedByMe);
  const [likes,    setLikes]   = useState(post.likesCount);
  const [saved,    setSaved]   = useState(post.savedByMe);
  const [followed, setFollow]  = useState(false);
  const [reposts,  setReposts] = useState(post.repostsCount ?? 0);
  const [reposted, setReposted]= useState(post.repostedByMe ?? false);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>null);
    const next = !liked;
    setLiked(next); setLikes(v => v + (next ? 1 : -1));
    if (next) {
      sparkA.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scaleA, { toValue:1.55, useNativeDriver:true, speed:80 }),
          Animated.spring(scaleA, { toValue:1,    useNativeDriver:true, speed:50 }),
        ]),
        Animated.timing(sparkA, { toValue:1, duration:650, useNativeDriver:true }),
      ]).start(() => sparkA.setValue(0));
    }
    onToggleLike(post.id);
  };

  const handleSave = () => {
    Haptics.selectionAsync().catch(()=>null);
    setSaved(v => !v);
    onToggleSave(post.id);
  };

  const handleRepost = () => {
    const next = !reposted;
    setReposted(next); setReposts(v => v + (next ? 1 : -1));
    onToggleRepost?.(post.id);
  };

  const goProfile = () => {
    const uid = post.author?.id || post.author_id;
    if (uid) router.push(`/profile/${uid}` as any);
  };

  // Avatar gradient colors based on role
  const avatarColors: [string, string] = role === "Professeur"
    ? ["#F59E0B","#D97706"] : role === "École"
    ? ["#10B981","#059669"]
    : ["#818CF8","#6366F1"];

  return (
    <Animated.View style={{ transform:[{scale:pressA}], paddingHorizontal:12, paddingVertical:5 }}>
      <Pressable
        onPressIn={() => Animated.spring(pressA,{toValue:0.975,useNativeDriver:true,speed:100}).start()}
        onPressOut={() => Animated.spring(pressA,{toValue:1,useNativeDriver:true,speed:60}).start()}
        onPress={() => onPressContent(post)}
        style={{
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: isDark ? "rgba(130,110,255,0.16)" : "rgba(91,76,255,0.09)",
          backgroundColor: isDark ? "#0F0F28" : "#FFFFFF",
          shadowColor: "#6B5FFF",
          shadowOpacity: isDark ? 0.18 : 0.06,
          shadowRadius: 16,
          shadowOffset: { width:0, height:4 },
          elevation: 4,
        }}
      >
        {/* Subtle top shimmer line */}
        <LinearGradient
          colors={["rgba(130,110,255,0.22)","rgba(130,110,255,0)"]}
          start={{x:0,y:0}} end={{x:1,y:0}}
          style={{ height:1 }}
        />

        <View style={{ padding:15 }}>
          {/* Header row */}
          <View style={{ flexDirection:"row", gap:11, alignItems:"flex-start" }}>
            {/* Avatar */}
            <Pressable onPress={goProfile} style={{ position:"relative" }}>
              <View style={{
                width:44, height:44, borderRadius:15, overflow:"hidden",
                borderWidth:1.5, borderColor: roleStyle.bg.replace("0.12","0.4"),
              }}>
                {isAvatar3DConfig((post.author as any)?.avatar_config)
                  ? <Avatar3D config={(post.author as any).avatar_config} size={44} variant="face" />
                  : post.author?.avatar_url
                    ? <Image source={{uri:post.author.avatar_url}} style={{width:44,height:44}}/>
                    : <LinearGradient colors={avatarColors} style={{flex:1,alignItems:"center",justifyContent:"center"}}>
                        <Text style={{color:"#fff",fontWeight:"900",fontSize:15}}>{initials}</Text>
                      </LinearGradient>
                }
              </View>
              {!isOwnPost && (
                <Pressable
                  onPress={()=>{ Haptics.selectionAsync().catch(()=>null); setFollow(v=>!v); onPressFollow?.(post); }}
                  hitSlop={6}
                  style={{
                    position:"absolute", bottom:-3, right:-3,
                    width:17, height:17, borderRadius:6,
                    backgroundColor: followed ? "#2ED573" : "#7B6CFF",
                    alignItems:"center", justifyContent:"center",
                    borderWidth:2, borderColor: isDark ? "#0F0F28" : "#fff",
                  }}>
                  <Ionicons name={followed?"checkmark":"add"} size={9} color="#fff"/>
                </Pressable>
              )}
            </Pressable>

            {/* Name + meta */}
            <Pressable onPress={goProfile} style={{flex:1}}>
              <View style={{flexDirection:"row",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                <Text style={{
                  color:c.textPrimary, fontWeight:"800", fontSize:14.5,
                  letterSpacing:-0.3,
                }}>
                  {name}
                </Text>
                <View style={{
                  backgroundColor:roleStyle.bg, borderRadius:6,
                  paddingHorizontal:6, paddingVertical:2,
                  borderWidth:1, borderColor:roleStyle.color+"30",
                }}>
                  <Text style={{color:roleStyle.color,fontSize:10,fontWeight:"800",letterSpacing:0.2}}>
                    {roleStyle.label}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection:"row",alignItems:"center",gap:5,marginTop:3}}>
                <Text style={{color:c.textSecondary,fontSize:12.5}}>@{handle}</Text>
                {post.filiere && <>
                  <View style={{width:3,height:3,borderRadius:2,backgroundColor:c.textSecondary,opacity:0.4}}/>
                  <Text style={{color:c.textSecondary,fontSize:12}} numberOfLines={1}>{post.filiere}</Text>
                </>}
                <View style={{width:3,height:3,borderRadius:2,backgroundColor:c.textSecondary,opacity:0.4}}/>
                <Text style={{color:c.textSecondary,fontSize:12}}>{relDate(post.created_at)}</Text>
              </View>
            </Pressable>

            <Pressable onPress={()=>onPressMore(post)} hitSlop={8} style={{padding:2,marginTop:1}}>
              <Ionicons name="ellipsis-horizontal" size={16} color={c.textSecondary}/>
            </Pressable>
          </View>

          {/* Content */}
          <View style={{marginTop:13}}>
            {post.title ? (
              <Text style={{
                color:c.textPrimary, fontSize:15.5, fontWeight:"900",
                letterSpacing:-0.4, lineHeight:22, marginBottom:7,
              }}>
                {post.title}
              </Text>
            ) : null}
            <Text style={{color:c.textPrimary, fontSize:13.5, lineHeight:21, opacity:0.82}} numberOfLines={4}>
              {post.content}
            </Text>
          </View>

          {/* Attachment */}
          {post.type !== "text" && (
            <Pressable onPress={() => onPressAttachment ? onPressAttachment(post) : onPressContent(post)} style={{
              flexDirection:"row", alignItems:"center", gap:10,
              marginTop:12, borderRadius:14, padding:11,
              backgroundColor: isDark ? "#181836" : "#F4F2FF",
              borderWidth:1, borderColor: isDark ? "rgba(130,110,255,0.20)" : "rgba(91,76,255,0.12)",
            }}>
              <View style={{
                width:32, height:32, borderRadius:10,
                backgroundColor:"rgba(123,108,255,0.18)",
                alignItems:"center", justifyContent:"center",
              }}>
                <Ionicons
                  name={post.type==="pdf" ? "document-text" : "help-circle-outline"}
                  size={17} color="#7B6CFF"
                />
              </View>
              <Text style={{color:c.textPrimary,fontWeight:"700",fontSize:13,flex:1}}>
                {post.type==="pdf" ? "Voir le document" : "Répondre au QCM"}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={c.textSecondary}/>
            </Pressable>
          )}

          {/* Separator */}
          <View style={{
            height:1, marginTop:13, marginBottom:8,
            backgroundColor: isDark ? "rgba(130,110,255,0.10)" : "rgba(91,76,255,0.06)",
          }}/>

          {/* Action bar */}
          <View style={{flexDirection:"row", alignItems:"center"}}>
            {/* Like */}
            <View style={{flex:1, position:"relative", alignItems:"center"}}>
              {SPARKLE_POS.map((s,i) => (
                <Spark key={i} anim={sparkA} x={s.x} y={s.y} c={s.c}/>
              ))}
              <Pressable onPress={handleLike} style={{flexDirection:"row",alignItems:"center",gap:5,paddingVertical:5,paddingHorizontal:8}}>
                <Animated.View style={{transform:[{scale:scaleA}]}}>
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={18}
                    color={liked ? "#FF4757" : c.textSecondary}
                  />
                </Animated.View>
                <Text style={{
                  color: liked ? "#FF4757" : c.textSecondary,
                  fontSize:13, fontWeight:"700",
                }}>{likes}</Text>
              </Pressable>
            </View>

            {/* Comment */}
            <Pressable onPress={()=>onPressComments(post)}
              style={{flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:5,paddingVertical:5}}>
              <Ionicons name="chatbubble-outline" size={17} color={c.textSecondary}/>
              <Text style={{color:c.textSecondary,fontSize:13,fontWeight:"700"}}>{post.commentsCount||0}</Text>
            </Pressable>

            {/* Repost */}
            <Pressable onPress={handleRepost}
              style={{flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:5,paddingVertical:5}}>
              <Ionicons name="repeat-outline" size={19} color={reposted ? "#F59E0B" : c.textSecondary}/>
              <Text style={{color:reposted?"#F59E0B":c.textSecondary,fontSize:13,fontWeight:"700"}}>{reposts}</Text>
            </Pressable>

            {/* Save */}
            <Pressable onPress={handleSave}
              style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:5}}>
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={18}
                color={saved ? "#7B6CFF" : c.textSecondary}
              />
            </Pressable>

            {/* Share */}
            <Pressable
              onPress={async()=>{ if(onPressShare) return onPressShare(post); await Share.share({message:post.content}).catch(()=>null); }}
              style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:5}}>
              <Ionicons name="share-outline" size={18} color={c.textSecondary}/>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const PostCard = memo(PostCardInner);
