import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, Image, Modal,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../state/useAuthStore";
import { useFeedStore } from "../../state/useFeedStore";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { PostCard } from "../../src/components/PostCard";
import { Avatar3D, isAvatar3DConfig } from "../../src/components/Avatar3D";
import { FeedPost } from "../../types/db";
import { getProgressState, computeLevel, addXP } from "../../src/features/progress/services/progressService";
import { canChangeAvatar, uploadAvatarWithLock, getUserStats } from "../../lib/services/profileService";
import { getProjects, createProject, addObjective, toggleObjective, deleteProject, getProjectProgress, Project } from "../../lib/services/projectsService";

type Tab = "posts" | "reposts" | "saved" | "projects" | "badges";

const TABS: { key: Tab; icon: string }[] = [
  { key:"posts",    icon:"grid-outline" },
  { key:"reposts",  icon:"repeat-outline" },
  { key:"saved",    icon:"bookmark-outline" },
  { key:"projects", icon:"folder-outline" },
  { key:"badges",   icon:"trophy-outline" },
];


function mapRole(accountType?: string|null, role?: string|null, niveau?: string|null) {
  // Priorité : account_type > role > niveau (rétrocompatibilité)
  const src = (accountType || role || niveau || "").toLowerCase();
  if (src === "professor" || src.includes("prof")) return "Professeur";
  if (src === "school" || src.includes("ecole") || src.includes("school")) return "École";
  return "Étudiant";
}

export default function ProfileTabRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { profile, user, updateProfile, updateAvatar } = useAuthStore();
  const { posts, refresh, createPost, toggleLike, toggleSave, openComments } = useFeedStore();

  const [tab,        setTab]        = useState<Tab>("posts");
  const [editVis,    setEditVis]    = useState(false);
  const [postVis,    setPostVis]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [posting,    setPosting]    = useState(false);
  const [localAvt,   setLocalAvt]   = useState<string|null>(null);
  const [fullName,   setFullName]   = useState(profile?.full_name||"");
  const [username,   setUsername]   = useState(profile?.username||"");
  const [bio,        setBio]        = useState(profile?.bio||"");
  const [filiere,    setFiliere]    = useState(profile?.filiere||"");
  const [postTitle,  setPostTitle]  = useState("");
  const [postBody,   setPostBody]   = useState("");
  const [xp,         setXp]         = useState(0);
  const [level,      setLevel]      = useState(1);
  const [levelIcon,  setLevelIcon]  = useState("🌱");
  const [levelTitle, setLevelTitle] = useState("Débutant");
  const [nextXp,     setNextXp]     = useState(100);
  const [prevXp,     setPrevXp]     = useState(0);
  const [badges,     setBadges]     = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [repoPosts,  setRepoPosts]  = useState<FeedPost[]>([]);
  const [projects,   setProjects]   = useState<Project[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [projModal,  setProjModal]  = useState(false);
  const [projTitle,  setProjTitle]  = useState("");
  const [projDesc,   setProjDesc]   = useState("");
  const [objModal,   setObjModal]   = useState<string|null>(null);
  const [objText,    setObjText]    = useState("");

  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFullName(profile?.full_name||""); setUsername(profile?.username||"");
    setBio(profile?.bio||""); setFiliere(profile?.filiere||"");
  }, [profile]);

  useEffect(() => {
    refresh(profile?.filiere||undefined).catch(()=>null);
    getProjects().then(setProjects).catch(() => null);
    // Load follower/following/likes stats
    if (user?.id) {
      getUserStats(user.id).then((stats) => {
        setFollowersCount(stats.followersCount);
        setFollowingCount(stats.followingCount);
        setLikesCount(stats.totalLikesReceived);
      }).catch(() => null);
    }
    getProgressState().then(s => {
      const info = computeLevel(s.xp);
      setXp(s.xp); setLevel(info.level); setLevelIcon(info.icon);
      setLevelTitle(info.title); setNextXp(info.nextXp); setPrevXp(info.prevXp);
      setBadges(s.badges);
      const pct = info.nextXp > info.prevXp ? (s.xp - info.prevXp)/(info.nextXp - info.prevXp) : 1;
      Animated.timing(barAnim, { toValue: pct, duration: 800, useNativeDriver:false }).start();
    });
  }, [profile?.filiere]);

  const displayName = profile?.display_name||profile?.full_name||profile?.username||user?.email?.split("@")[0]||"Utilisateur";
  const handle      = profile?.username||user?.email?.split("@")[0]||"utilisateur";
<<<<<<< Updated upstream
  const role        = mapRole(profile?.role||profile?.account_type||profile?.niveau);
=======
  const role        = mapRole(profile?.account_type, profile?.role, profile?.niveau);
>>>>>>> Stashed changes
  const avatarUri     = localAvt || profile?.avatar_url || null;
  const avatar3DCfg   = isAvatar3DConfig((profile as any)?.avatar_config) ? (profile as any).avatar_config : null;
  const pctNum      = nextXp>prevXp ? Math.min(100,Math.round(((xp-prevXp)/(nextXp-prevXp))*100)) : 100;

  const myPosts = useMemo(()=>{
    const uid = user?.id; if (!uid) return [] as FeedPost[];
    return posts.filter(p=>p.user_id===uid||p.author_id===uid||(p.author as any)?.id===uid)
      .map(p=>p.author?p:{...p,author:profile||null});
  },[posts,profile,user?.id]);

  // Saved: filter feed posts marked savedByMe
  const savedFromFeed = useMemo(()=>posts.filter(p=>p.savedByMe),[posts]);
  const repostedFromFeed = useMemo(()=>posts.filter(p=>p.repostedByMe),[posts]);

  const uploadAvatar = useCallback(async (uri:string)=>{
    // Check 60-day lock
    const { allowed, daysLeft } = canChangeAvatar(profile?.avatar_changed_at);
    if (profile?.avatar_url && !allowed) {
      Alert.alert(
        "⏳ Changement bloqué",
        `Tu pourras changer ta photo de profil dans ${daysLeft} jour${daysLeft>1?"s":""}.\n\nCette limite existe pour protéger l'identité des utilisateurs.`,
        [{ text: "Compris", style: "cancel" }]
      );
      return;
    }
    setLocalAvt(uri); setUploading(true);
    try{
      await uploadAvatarWithLock(uri, profile);
    } catch(e:any){
      Alert.alert("Erreur", e?.message||"Upload impossible.");
      setLocalAvt(null);
    }
    finally{ setUploading(false); }
  }, [profile?.avatar_url, profile?.avatar_changed_at]);

  const pickLib = useCallback(async()=>{
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync(); if(!granted)return;
    const r = await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,allowsEditing:true,aspect:[1,1],quality:0.85});
    if(!r.canceled&&r.assets[0]) uploadAvatar(r.assets[0].uri);
  }, [uploadAvatar]);

  const pickCam = useCallback(async()=>{
    const { granted } = await ImagePicker.requestCameraPermissionsAsync(); if(!granted)return;
    const r = await ImagePicker.launchCameraAsync({allowsEditing:true,aspect:[1,1],quality:0.85});
    if(!r.canceled&&r.assets[0]) uploadAvatar(r.assets[0].uri);
  }, [uploadAvatar]);

  const saveProfile = useCallback(async()=>{
    try{
      await updateProfile({full_name:fullName.trim()||null,username:username.trim()||null,bio:bio.trim()||null,filiere:filiere.trim()||null});
      setEditVis(false);
    } catch(e:any){ Alert.alert("Erreur",e?.message||"Impossible d'enregistrer."); }
  }, [fullName, username, bio, filiere, updateProfile]);

  const publishPost = useCallback(async()=>{
    if(!postBody.trim()) return; setPosting(true);
    try{
      await createPost({title:postTitle.trim()||undefined,content:postBody.trim(),filiere:profile?.filiere||"General"});
      await refresh(profile?.filiere||undefined);
      const s = await addXP(20,"post");
      const info = computeLevel(s.xp);
      setXp(s.xp); setLevel(info.level); setLevelIcon(info.icon); setLevelTitle(info.title); setNextXp(info.nextXp); setPrevXp(info.prevXp); setBadges(s.badges);
      setPostTitle(""); setPostBody(""); setPostVis(false);
    } catch(e:any){ Alert.alert("Erreur",e?.message||"Impossible de publier."); }
    finally{ setPosting(false); }
  }, [postBody, postTitle, createPost, refresh, profile?.filiere]);

  const barWidth = barAnim.interpolate({inputRange:[0,1],outputRange:["0%","100%"]});

  const renderPosts = (items:FeedPost[], empty:string, emptyIcon:string) => {
    if(!items.length) return (
      <View style={s.emptyBox}>
        <Ionicons name={emptyIcon as any} size={40} color={c.textSecondary}/>
        <Text style={s.emptyText}>{empty}</Text>
      </View>
    );
    return items.map(post=>(
      <PostCard key={post.id} post={post}
        onToggleLike={async id=>{ try{await toggleLike(id);}catch{} }}
        onToggleSave={async id=>{ try{await toggleSave(id);}catch{} }}
        onPressComments={async p=>{ await openComments(p.id).catch(()=>null); }}
        onPressContent={p=>router.push(`/content/${p.id}` as any)}
        onPressMore={p=>Alert.alert("Publication","",[
          {text:"Voir",onPress:()=>router.push(`/content/${p.id}` as any)},
          {text:"Fermer",style:"cancel"},
        ])}
      />
    ));
  };

  return (
    <View style={{flex:1,backgroundColor:c.background}}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:120}}>

        {/* Cover */}
        <LinearGradient colors={["#15151D","#08080C"]} style={[s.cover,{paddingTop:insets.top+14}]}>
          <View style={{flexDirection:"row",justifyContent:"flex-end",gap:8}}>
            <Pressable style={s.coverBtn} onPress={()=>setPostVis(true)}>
              <Ionicons name="add-circle-outline" size={17} color="#FFF"/>
            </Pressable>
            <Pressable style={s.coverBtn} onPress={()=>router.push("/settings")}>
              <Ionicons name="settings-outline" size={17} color="#FFF"/>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={{paddingHorizontal:16}}>
          {/* Avatar + Actions row */}
          <View style={s.avatarRow}>
            <Pressable onPress={()=>Alert.alert("Photo de profil","Choisis une source",[
              {text:"Galerie",onPress:pickLib},
              {text:"Caméra",onPress:pickCam},
              {text:"Annuler",style:"cancel"},
            ])}>
              {/* Level arc around avatar */}
              <View style={s.avatarOuter}>
                <LinearGradient colors={["#8B7DFF","#5040E0"]} style={s.avatarArc}/>
                <View style={[s.avatarInner,{borderColor:c.background}]}>
                  {avatar3DCfg
                    ? <Avatar3D config={avatar3DCfg} size={86} variant="face" />
                    : avatarUri
                      ? <Image source={{uri:avatarUri}} style={s.avatarImg} resizeMode="cover"/>
                      : <Text style={s.avatarInitials}>{displayName.slice(0,2).toUpperCase()}</Text>
                  }
                  {uploading&&<View style={s.avatarOverlay}><ActivityIndicator size="small" color="#FFF"/></View>}
                </View>
                {/* Level badge at bottom of arc */}
                <View style={s.levelPill}>
                  <Text style={s.levelPillTxt}>{levelIcon} {level}</Text>
                </View>
              </View>
            </Pressable>

            <View style={{alignItems:"flex-end",gap:8,paddingBottom:8}}>
              {/* Progress button */}
              <Pressable onPress={()=>router.push("/progress" as any)} style={s.progBtn}>
                <Text style={{fontSize:18}}>{levelIcon}</Text>
                <View>
                  <Text style={s.progBtnTitle}>{levelTitle}</Text>
                  <Text style={s.progBtnXp}>{xp} XP</Text>
                </View>
                <Ionicons name="chevron-forward" size={13} color="#7B6CFF"/>
              </Pressable>
              <Pressable onPress={()=>setEditVis(true)} style={[s.outlineBtn,{borderColor:c.border}]}>
                <Text style={{color:c.textPrimary,fontWeight:"700",fontSize:13}}>Modifier</Text>
              </Pressable>
              <Pressable onPress={()=>router.push("/(modals)/avatar-builder" as any)} style={s.avatarBuilderBtn}>
                <Ionicons name="sparkles-outline" size={14} color="#EAE6FF" />
                <Text style={s.avatarBuilderTxt}>Créer mon avatar</Text>
              </Pressable>
            </View>
          </View>

          {/* Identity */}
          <View style={{marginTop:14,gap:3}}>
            <Text style={s.displayName}>{displayName}</Text>
            <Text style={s.handle}>@{handle}</Text>
            <Text style={s.roleText}>{role}</Text>
            <Text style={s.bioText} numberOfLines={3}>
              {profile?.bio||"Ajoute une bio pour te présenter."}
            </Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:10,marginTop:4}}>
              {profile?.filiere&&<View style={s.metaItem}><Ionicons name="school-outline" size={13} color={c.textSecondary}/><Text style={[s.metaTxt,{color:c.textSecondary}]}>{profile.filiere}</Text></View>}
              {(profile?.school_name||profile?.ecole)&&<View style={s.metaItem}><Ionicons name="business-outline" size={13} color={c.textSecondary}/><Text style={[s.metaTxt,{color:c.textSecondary}]}>{profile?.school_name||profile?.ecole}</Text></View>}
            </View>
          </View>

          {/* Stats row — full width, 4 columns */}
          <View style={{flexDirection:"row",marginTop:16,borderRadius:16,
            borderWidth:1,borderColor:c.border,backgroundColor:c.card,overflow:"hidden"}}>
            {[
              {v: followersCount, l:"Abonnés", type:"followers"},
              {v: followingCount, l:"Suivis",  type:"following"},
              {v: myPosts.length, l:"Posts",   type:null},
              {v: likesCount,     l:"J'aimes", type:null},
            ].map((item, i, arr) => (
              item.type && user?.id ? (
                <Pressable key={i} onPress={() => router.push({ pathname:"/profile/followers", params:{userId:user.id, type:item.type!} })}
                  style={{flex:1,alignItems:"center",paddingVertical:12,
                    borderRightWidth:i<arr.length-1?1:0,borderColor:c.border}}>
                  <Text style={{color:c.textPrimary,fontSize:18,fontWeight:"900"}}>{item.v}</Text>
                  <Text style={{color:c.textSecondary,fontSize:10,marginTop:2,fontWeight:"600"}}>{item.l}</Text>
                </Pressable>
              ) : (
                <View key={i} style={{flex:1,alignItems:"center",paddingVertical:12,
                  borderRightWidth:i<arr.length-1?1:0,borderColor:c.border}}>
                  <Text style={{color:c.textPrimary,fontSize:18,fontWeight:"900"}}>{item.v}</Text>
                  <Text style={{color:c.textSecondary,fontSize:10,marginTop:2,fontWeight:"600"}}>{item.l}</Text>
                </View>
              )
            ))}
          </View>

          {/* XP Progress bar */}
          <Pressable onPress={()=>router.push("/progress" as any)} style={[s.xpCard,{backgroundColor:c.card,borderColor:c.border}]}>
            <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:8}}>
              <Text style={{color:"#fff",fontWeight:"800",fontSize:13}}>Progression · Niveau {level}</Text>
              <Text style={{color:"#7B6CFF",fontSize:12,fontWeight:"700"}}>{pctNum}%</Text>
            </View>
            <View style={[s.xpBarTrack,{backgroundColor:c.cardAlt}]}>
              <Animated.View style={{height:"100%",width:barWidth as any,borderRadius:999,overflow:"hidden"}}>
                <LinearGradient colors={["#8B7DFF","#5040E0"]} start={{x:0,y:0}} end={{x:1,y:0}} style={{flex:1}}/>
              </Animated.View>
            </View>
            <Text style={{color:c.textSecondary,fontSize:11,marginTop:4}}>
              {xp} XP · encore {Math.max(0,nextXp-xp)} XP pour le niveau {level+1}
            </Text>
          </Pressable>
        </View>

        {/* Icon tabs - full width spread */}
        <View style={{flexDirection:"row",borderTopWidth:1,borderBottomWidth:1,borderColor:c.border,marginTop:8}}>
          {TABS.map(t=>{
            const active=tab===t.key;
            return(
              <Pressable key={t.key} onPress={()=>setTab(t.key)}
                style={{flex:1,alignItems:"center",paddingVertical:13,
                  borderBottomWidth:2.5,
                  borderBottomColor:active?"#7B6CFF":"transparent"}}>
                <Ionicons name={t.icon as any} size={22} color={active?"#7B6CFF":c.textSecondary}/>
              </Pressable>
            );
          })}
        </View>

        {/* Tab content */}
        <View style={{paddingTop:4}}>
          {tab==="posts"   && renderPosts(myPosts,           "Aucun post pour le moment","newspaper-outline")}
          {tab==="reposts" && renderPosts(repostedFromFeed,  "Aucune republication","repeat-outline")}
          {tab==="saved"   && renderPosts(savedFromFeed,     "Aucun contenu enregistré","bookmark-outline")}



          {tab==="projects"&&(
            <View style={s.cardList}>
              {/* Create project button */}
              <Pressable onPress={()=>setProjModal(true)}
                style={{flexDirection:"row",alignItems:"center",gap:10,
                  borderRadius:18,borderWidth:1.5,borderColor:"#7B6CFF",
                  borderStyle:"dashed",padding:14,backgroundColor:"rgba(123,108,255,0.06)"}}>
                <View style={{width:44,height:44,borderRadius:14,backgroundColor:"rgba(123,108,255,0.15)",alignItems:"center",justifyContent:"center"}}>
                  <Ionicons name="add" size={24} color="#7B6CFF"/>
                </View>
                <Text style={{color:"#7B6CFF",fontWeight:"800",fontSize:15}}>Créer un projet</Text>
              </Pressable>

              {projects.length===0&&(
                <View style={s.emptyBox}>
                  <Ionicons name="folder-open-outline" size={38} color={c.textSecondary}/>
                  <Text style={s.emptyText}>Aucun projet</Text>
                  <Text style={{color:c.textSecondary,fontSize:13,textAlign:"center"}}>Crée ton premier projet et définis tes objectifs</Text>
                </View>
              )}

              {projects.map(proj=>{
                const pct=getProjectProgress(proj);
                return(
                  <View key={proj.id} style={[s.simpleCard,{backgroundColor:c.card,borderColor:c.border}]}>
                    <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
                      <View style={[s.moduleIcon,{backgroundColor:proj.color+"20"}]}>
                        <Text style={{fontSize:22}}>{proj.icon}</Text>
                      </View>
                      <View style={{flex:1}}>
                        <Text style={s.cardTitle}>{proj.title}</Text>
                        <Text style={[s.cardSub,{color:c.textSecondary}]}>
                          {proj.objectives.filter(o=>o.done).length}/{proj.objectives.length} objectifs
                        </Text>
                      </View>
                      <Text style={{color:proj.color,fontWeight:"900",fontSize:15}}>{pct}%</Text>
                    </View>
                    <View style={[s.barTrack,{backgroundColor:c.cardAlt,marginTop:10,marginBottom:10}]}>
                      <View style={[s.barFill,{width:`${pct}%` as any,backgroundColor:proj.color}]}/>
                    </View>
                    {/* Objectives */}
                    {proj.objectives.map(obj=>(
                      <Pressable key={obj.id} onPress={async()=>{
                          const updated=await toggleObjective(proj.id,obj.id);
                          if(updated) setProjects(prev=>prev.map(p=>p.id===proj.id?updated:p));
                        }}
                        style={{flexDirection:"row",alignItems:"center",gap:10,paddingVertical:6}}>
                        <View style={{width:22,height:22,borderRadius:6,
                          backgroundColor:obj.done?proj.color+"30":"transparent",
                          borderWidth:2,borderColor:obj.done?proj.color:c.border,
                          alignItems:"center",justifyContent:"center"}}>
                          {obj.done&&<Ionicons name="checkmark" size={14} color={proj.color}/>}
                        </View>
                        <Text style={{color:obj.done?c.textSecondary:c.textPrimary,fontSize:14,flex:1,
                          textDecorationLine:obj.done?"line-through":"none"}}>{obj.text}</Text>
                      </Pressable>
                    ))}
                    {/* Add objective */}
                    <Pressable onPress={()=>{setObjModal(proj.id);setObjText("");}}
                      style={{flexDirection:"row",alignItems:"center",gap:6,marginTop:4,paddingTop:8,
                        borderTopWidth:1,borderTopColor:c.border}}>
                      <Ionicons name="add-circle-outline" size={16} color={proj.color}/>
                      <Text style={{color:proj.color,fontSize:13,fontWeight:"700"}}>Ajouter un objectif</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}

          {tab==="badges"&&(
            <View style={s.cardList}>
              {badges.filter(b=>b.unlocked).length>0&&(
                <>
                  <Text style={[s.sectionLabel,{color:c.textSecondary}]}>🏅 Badges obtenus</Text>
                  <View style={s.badgesGrid}>
                    {badges.filter(b=>b.unlocked).map((b:any)=>(
                      <View key={b.id} style={[s.badgeCard,{backgroundColor:c.card,borderColor:"#7B6CFF"}]}>
                        <Text style={{fontSize:28}}>{b.icon}</Text>
                        <Text style={s.badgeName}>{b.name}</Text>
                        <Text style={[s.badgeDesc,{color:c.textSecondary}]}>{b.desc}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {badges.filter(b=>!b.unlocked).length>0&&(
                <>
                  <Text style={[s.sectionLabel,{color:c.textSecondary,marginTop:14}]}>🔒 À débloquer</Text>
                  <View style={s.badgesGrid}>
                    {badges.filter(b=>!b.unlocked).map((b:any)=>(
                      <View key={b.id} style={[s.badgeCard,{backgroundColor:c.card,borderColor:c.border,opacity:0.5}]}>
                        <Text style={{fontSize:28,opacity:0.4}}>🔒</Text>
                        <Text style={s.badgeName}>{b.name}</Text>
                        <Text style={[s.badgeDesc,{color:c.textSecondary}]}>{b.desc}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Post modal */}
      <Modal visible={postVis} transparent animationType="slide" onRequestClose={()=>setPostVis(false)}>
        <View style={s.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={()=>setPostVis(false)}/>
          <View style={[s.modalCard,{backgroundColor:c.card,borderColor:c.border}]}>
            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
              <Text style={s.modalTitle}>Nouvelle publication</Text>
              <Pressable onPress={()=>setPostVis(false)}><Ionicons name="close" size={22} color={c.textSecondary}/></Pressable>
            </View>
            <TextInput value={postTitle} onChangeText={setPostTitle} placeholder="Titre (optionnel)"
              placeholderTextColor={c.textSecondary} style={[s.input,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary}]}/>
            <TextInput value={postBody} onChangeText={setPostBody} multiline placeholder="Exprime-toi..."
              placeholderTextColor={c.textSecondary} style={[s.inputArea,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary}]}/>
            <Pressable onPress={publishPost} disabled={posting||!postBody.trim()} style={[s.primaryBtn,(posting||!postBody.trim())&&{opacity:0.45}]}>
              {posting?<ActivityIndicator size="small" color="#FFF"/>
                :<Text style={s.primaryBtnTxt}>Publier · +20 XP 🎯</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Create Project modal */}
      <Modal visible={projModal} transparent animationType="slide" onRequestClose={()=>setProjModal(false)}>
        <View style={s.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={()=>setProjModal(false)}/>
          <View style={[s.modalCard,{backgroundColor:c.card,borderColor:c.border}]}>
            <Text style={s.modalTitle}>Nouveau projet</Text>
            <TextInput value={projTitle} onChangeText={setProjTitle} placeholder="Titre du projet"
              placeholderTextColor={c.textSecondary}
              style={[s.input,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary}]}/>
            <TextInput value={projDesc} onChangeText={setProjDesc} multiline placeholder="Description (optionnelle)"
              placeholderTextColor={c.textSecondary}
              style={[s.inputArea,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary}]}/>
            <View style={{flexDirection:"row",gap:10}}>
              <Pressable onPress={()=>setProjModal(false)} style={[s.outlineBtn,{flex:1,borderColor:c.border}]}>
                <Text style={{color:c.textPrimary,fontWeight:"700"}}>Annuler</Text>
              </Pressable>
              <Pressable disabled={!projTitle.trim()} onPress={async()=>{
                  const p=await createProject({title:projTitle.trim(),description:projDesc.trim()});
                  setProjects(prev=>[...prev,p]);
                  setProjTitle(""); setProjDesc(""); setProjModal(false);
                }}
                style={[s.primaryBtn,{flex:1,opacity:projTitle.trim()?1:0.45}]}>
                <Text style={s.primaryBtnTxt}>Créer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Objective modal */}
      <Modal visible={!!objModal} transparent animationType="slide" onRequestClose={()=>setObjModal(null)}>
        <View style={s.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={()=>setObjModal(null)}/>
          <View style={[s.modalCard,{backgroundColor:c.card,borderColor:c.border}]}>
            <Text style={s.modalTitle}>Ajouter un objectif</Text>
            <TextInput value={objText} onChangeText={setObjText} placeholder="Décrire l'objectif..."
              placeholderTextColor={c.textSecondary}
              style={[s.input,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary}]}/>
            <View style={{flexDirection:"row",gap:10}}>
              <Pressable onPress={()=>setObjModal(null)} style={[s.outlineBtn,{flex:1,borderColor:c.border}]}>
                <Text style={{color:c.textPrimary,fontWeight:"700"}}>Annuler</Text>
              </Pressable>
              <Pressable disabled={!objText.trim()} onPress={async()=>{
                  if(!objModal) return;
                  const updated=await addObjective(objModal,objText.trim());
                  if(updated) setProjects(prev=>prev.map(p=>p.id===objModal?updated:p));
                  setObjText(""); setObjModal(null);
                }}
                style={[s.primaryBtn,{flex:1,opacity:objText.trim()?1:0.45}]}>
                <Text style={s.primaryBtnTxt}>Ajouter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit modal */}
      <Modal visible={editVis} transparent animationType="fade" onRequestClose={()=>setEditVis(false)}>
        <View style={s.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={()=>setEditVis(false)}/>
          <View style={[s.modalCard,{backgroundColor:c.card,borderColor:c.border}]}>
            <Text style={s.modalTitle}>Modifier le profil</Text>
            {[
              {val:fullName,set:setFullName,ph:"Nom complet"},
              {val:username,set:setUsername,ph:"@username"},
              {val:filiere, set:setFiliere, ph:"Filière"},
            ].map((f,i)=>(
              <TextInput key={i} value={f.val} onChangeText={f.set} placeholder={f.ph}
                placeholderTextColor={c.textSecondary} style={[s.input,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary}]}/>
            ))}
            <TextInput value={bio} onChangeText={setBio} multiline placeholder="Bio"
              placeholderTextColor={c.textSecondary} style={[s.inputArea,{borderColor:c.border,backgroundColor:c.cardAlt,color:c.textPrimary}]}/>
            <View style={{flexDirection:"row",gap:10}}>
              <Pressable onPress={()=>setEditVis(false)} style={[s.outlineBtn,{flex:1,borderColor:c.border}]}>
                <Text style={{color:c.textPrimary,fontWeight:"700"}}>Annuler</Text>
              </Pressable>
              <Pressable onPress={saveProfile} style={[s.primaryBtn,{flex:1}]}>
                <Text style={s.primaryBtnTxt}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  cover:{height:170,paddingHorizontal:16,justifyContent:"flex-start"},
  coverBtn:{width:36,height:36,borderRadius:18,backgroundColor:"rgba(255,255,255,0.13)",alignItems:"center",justifyContent:"center"},
  avatarRow:{marginTop:-56,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between"},
  avatarOuter:{width:138,height:138,alignItems:"center",justifyContent:"center",position:"relative"},
  avatarArc:{position:"absolute",width:138,height:138,borderRadius:69,borderWidth:3,opacity:0.9},
  avatarInner:{width:124,height:124,borderRadius:62,borderWidth:4,backgroundColor:"#1D1D22",overflow:"hidden",alignItems:"center",justifyContent:"center"},
  avatarImg:{width:120,height:120,borderRadius:60},
  avatarInitials:{color:"#FFF",fontSize:32,fontWeight:"900"},
  avatarOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(0,0,0,0.45)",alignItems:"center",justifyContent:"center"},
  levelPill:{position:"absolute",bottom:-2,alignSelf:"center",backgroundColor:"#7B6CFF",borderRadius:999,paddingHorizontal:10,paddingVertical:3},
  levelPillTxt:{color:"#fff",fontSize:11,fontWeight:"800"},
  progBtn:{flexDirection:"row",alignItems:"center",gap:8,borderRadius:14,borderWidth:1,borderColor:"#7B6CFF",paddingHorizontal:12,paddingVertical:8,backgroundColor:"rgba(123,108,255,0.10)"},
  progBtnTitle:{color:"#D0C8FF",fontSize:12,fontWeight:"800"},
  progBtnXp:{color:"#9090AA",fontSize:11},
  avatarBuilderBtn:{
    minHeight:36,
    borderRadius:999,
    paddingHorizontal:12,
    paddingVertical:8,
    backgroundColor:"rgba(123,108,255,0.16)",
    borderWidth:1,
    borderColor:"rgba(123,108,255,0.38)",
    flexDirection:"row",
    alignItems:"center",
    gap:6,
  },
  avatarBuilderTxt:{color:"#EAE6FF",fontWeight:"800",fontSize:12},
  outlineBtn:{minHeight:38,borderRadius:999,borderWidth:1,paddingHorizontal:14,alignItems:"center",justifyContent:"center"},
  displayName:{color:"#FFF",fontSize:24,fontWeight:"900",letterSpacing:-0.4},
  handle:{color:"#9A9AA7",fontSize:14,fontWeight:"700"},
  roleText:{color:"#7B6CFF",fontSize:12,fontWeight:"800",marginTop:2},
  bioText:{color:"#E0E0EA",fontSize:14,lineHeight:20,marginTop:4},
  metaItem:{flexDirection:"row",alignItems:"center",gap:4},
  metaTxt:{fontSize:13},
  xpCard:{marginTop:12,borderRadius:16,borderWidth:1,padding:12},
  xpBarTrack:{height:6,borderRadius:999,overflow:"hidden"},
  tabChip:{flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1},
  tabLabel:{fontSize:12,fontWeight:"700"},
  emptyBox:{alignItems:"center",gap:10,paddingVertical:44},
  emptyText:{color:"#FFF",fontSize:16,fontWeight:"800"},
  cardList:{paddingHorizontal:12,paddingTop:6,gap:10},
  simpleCard:{borderRadius:18,borderWidth:1,padding:14},
  moduleIcon:{width:44,height:44,borderRadius:12,alignItems:"center",justifyContent:"center"},
  cardTitle:{color:"#FFF",fontSize:14,fontWeight:"800"},
  cardSub:{fontSize:12,marginTop:2},
  barTrack:{height:5,borderRadius:999,overflow:"hidden"},
  barFill:{height:"100%",borderRadius:999,backgroundColor:"#7B6CFF"},
  sectionLabel:{fontSize:13,fontWeight:"700"},
  badgesGrid:{flexDirection:"row",flexWrap:"wrap",gap:10,marginTop:6},
  badgeCard:{width:"30%",borderRadius:16,borderWidth:1,padding:12,alignItems:"center",gap:4},
  badgeName:{color:"#FFF",fontSize:12,fontWeight:"800",textAlign:"center"},
  badgeDesc:{fontSize:10,textAlign:"center"},
  backdrop:{flex:1,backgroundColor:"rgba(0,0,0,0.65)",justifyContent:"center",alignItems:"center",padding:16},
  modalCard:{width:"100%",borderRadius:20,borderWidth:1,padding:18,gap:10},
  modalTitle:{color:"#FFF",fontSize:18,fontWeight:"900"},
  input:{minHeight:46,borderRadius:12,borderWidth:1,paddingHorizontal:14,fontSize:14},
  inputArea:{minHeight:100,borderRadius:12,borderWidth:1,paddingHorizontal:14,paddingVertical:10,textAlignVertical:"top",fontSize:14},
  primaryBtn:{minHeight:46,borderRadius:999,paddingHorizontal:16,alignItems:"center",justifyContent:"center",backgroundColor:"#7B6CFF"},
  primaryBtnTxt:{color:"#FFF",fontWeight:"800",fontSize:13},
});
