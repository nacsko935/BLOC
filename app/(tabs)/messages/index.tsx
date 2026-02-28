import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Modal, Pressable, Text, TextInput, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../src/core/theme/ThemeProvider";
import { ConversationItem } from "../../../src/features/messages/v1/components/ConversationItem";
import { GroupItem } from "../../../src/features/messages/v1/components/GroupItem";
import { useMessagesStore } from "../../../state/useMessagesStore";

type Tab = "discussions" | "groupes";

export default function MessagesTabScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  const [tab,          setTab]          = useState<Tab>("discussions");
  const [createModal,  setCreateModal]  = useState(false);
  const [groupName,    setGroupName]    = useState("");
  const [groupDesc,    setGroupDesc]    = useState("");
  const [groupTrack,   setGroupTrack]   = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState<"public"|"private">("public");

  const { inbox, groups, loading, loadInbox, loadGroups, createGroup, joinGroup } = useMessagesStore();

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadInbox().catch(()=>null); loadGroups().catch(()=>null); }, [loadInbox, loadGroups]);

  useEffect(() => {
    fadeAnim.setValue(0); slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:1, duration:200, useNativeDriver:true }),
      Animated.timing(slideAnim, { toValue:0, duration:220, useNativeDriver:true }),
    ]).start();
  }, [tab, fadeAnim, slideAnim]);

  const joinedGroups   = useMemo(()=>groups.filter(g=>g.joined),  [groups]);
  const discoverGroups = useMemo(()=>groups.filter(g=>!g.joined), [groups]);

  const doCreate = async () => {
    if (!groupName.trim()) return;
    try {
      await createGroup({ name: groupName.trim(), description: groupDesc, filiere: groupTrack, privacy: groupPrivacy });
      setGroupName(""); setGroupDesc(""); setGroupTrack(""); setGroupPrivacy("public");
      setCreateModal(false);
    } catch(e:any) { Alert.alert("Erreur", e?.message || "Impossible de créer le groupe."); }
  };

  const inputStyle = {
    height: 44, borderRadius: 12, borderWidth: 1,
    borderColor: c.border, backgroundColor: c.cardAlt,
    color: c.textPrimary, paddingHorizontal: 14, fontSize: 15,
  };

  // Skeleton
  const Skeleton = () => (
    <View style={{ gap: 10, marginTop: 4 }}>
      {[1,2,3].map(i => (
        <View key={i} style={{ flexDirection:"row", alignItems:"center", padding:14,
          borderRadius:16, backgroundColor:c.card, borderWidth:1, borderColor:c.border, gap:12 }}>
          <View style={{ width:48, height:48, borderRadius:24, backgroundColor:c.cardAlt }} />
          <View style={{ flex:1, gap:8 }}>
            <View style={{ height:12, width:"56%", borderRadius:6, backgroundColor:c.cardAlt }} />
            <View style={{ height:10, width:"72%", borderRadius:5, backgroundColor:c.cardAlt }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:c.background, paddingTop:insets.top }}>

      {/* Header */}
      <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center",
        paddingHorizontal:20, paddingTop:14, paddingBottom:10,
        borderBottomWidth:1, borderBottomColor:c.border }}>
        <Text style={{ fontSize:28, fontWeight:"800", color:c.textPrimary }}>Messages</Text>
        <View style={{ flexDirection:"row", gap:8 }}>
          <Pressable onPress={()=>setCreateModal(true)}
            style={({ pressed })=>[{ width:38, height:38, borderRadius:19, backgroundColor:c.cardAlt,
              borderWidth:1, borderColor:c.border, alignItems:"center", justifyContent:"center" },
              pressed&&{opacity:0.7}]}>
            <Ionicons name="people-outline" size={18} color={c.textPrimary} />
          </Pressable>
          <Pressable onPress={()=>router.push("/(modals)/new-conversation")}
            style={({ pressed })=>[{ width:38, height:38, borderRadius:19, backgroundColor:c.cardAlt,
              borderWidth:1, borderColor:c.border, alignItems:"center", justifyContent:"center" },
              pressed&&{opacity:0.7}]}>
            <Ionicons name="create-outline" size={18} color={c.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection:"row", marginHorizontal:20, marginTop:12, marginBottom:4,
        backgroundColor:c.cardAlt, borderRadius:12, padding:3, borderWidth:1, borderColor:c.border }}>
        {(["discussions","groupes"] as Tab[]).map(t=>(
          <Pressable key={t} onPress={()=>setTab(t)}
            style={{ flex:1, paddingVertical:9, borderRadius:10, alignItems:"center",
              backgroundColor: tab===t ? c.accentPurple : "transparent" }}>
            <Text style={{ color: tab===t ? "#fff" : c.textSecondary, fontWeight:"700", fontSize:14 }}>
              {t === "discussions" ? "Discussions" : "Groupes"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Contenu */}
      <Animated.View style={{ flex:1, opacity:fadeAnim, transform:[{translateY:slideAnim}], paddingHorizontal:16, paddingTop:10 }}>
        {tab === "discussions" ? (
          loading ? <Skeleton /> :
          inbox.length === 0 ? (
            <View style={{ marginTop:40, alignItems:"center", gap:12 }}>
              <View style={{ width:70, height:70, borderRadius:35, backgroundColor:c.accentPurple+"22",
                alignItems:"center", justifyContent:"center" }}>
                <Ionicons name="chatbubbles-outline" size={32} color={c.accentPurple} />
              </View>
              <Text style={{ color:c.textPrimary, fontSize:18, fontWeight:"800" }}>Aucune discussion</Text>
              <Text style={{ color:c.textSecondary, textAlign:"center" }}>Écris à un ami ou rejoins un groupe.</Text>
              <Pressable onPress={()=>router.push("/(modals)/new-conversation")}
                style={{ height:42, borderRadius:999, paddingHorizontal:24,
                  backgroundColor:c.accentPurple, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:"#fff", fontWeight:"800" }}>Nouvelle discussion</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={inbox} keyExtractor={i=>i.conversationId}
              contentContainerStyle={{ gap:8, paddingBottom:110 }}
              showsVerticalScrollIndicator={false}
              renderItem={({item})=>(
                <ConversationItem
                  id={item.conversationId}
                  name={item.name}
                  lastMessage={item.lastMessage}
                  timestamp={item.timestamp}
                  unreadCount={item.unreadCount}
                  avatar={item.avatar}
                  onPress={()=>router.push({ pathname:"/messages/[id]", params:{ id:item.conversationId } })} />
              )}
            />
          )
        ) : (
          loading ? <Skeleton /> :
          <FlatList
            data={joinedGroups} keyExtractor={i=>i.groupId}
            contentContainerStyle={{ gap:8, paddingBottom:110 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={discoverGroups.length>0 ? (
              <View style={{ marginBottom:16 }}>
                <Text style={{ color:c.textSecondary, fontWeight:"700", fontSize:13,
                  marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Découvrir</Text>
                {discoverGroups.map(g=>(
                  <View key={g.groupId} style={{ flexDirection:"row", alignItems:"center", gap:12,
                    backgroundColor:c.card, borderWidth:1, borderColor:c.border,
                    borderRadius:14, padding:12, marginBottom:8 }}>
                    <View style={{ width:40, height:40, borderRadius:20,
                      backgroundColor:g.avatarColor, alignItems:"center", justifyContent:"center" }}>
                      <Text style={{ color:"#fff", fontWeight:"800" }}>{g.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:c.textPrimary, fontWeight:"700" }}>{g.name}</Text>
                      <Text style={{ color:c.textSecondary, fontSize:12 }}>{g.memberCount} membres · {g.privacy}</Text>
                    </View>
                    <Pressable onPress={async()=>{ try{await joinGroup(g.groupId);}catch(e:any){Alert.alert("Erreur",e?.message);} }}
                      style={({ pressed })=>[{ backgroundColor:c.accentBlue, borderRadius:10,
                        paddingHorizontal:12, height:32, alignItems:"center", justifyContent:"center" },
                        pressed&&{opacity:0.8}]}>
                      <Text style={{ color:"#fff", fontSize:12, fontWeight:"700" }}>Rejoindre</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
            ListEmptyComponent={
              <View style={{ marginTop:30, alignItems:"center", gap:10 }}>
                <Ionicons name="people-outline" size={44} color={c.textSecondary} />
                <Text style={{ color:c.textPrimary, fontSize:18, fontWeight:"800" }}>Aucun groupe</Text>
                <Pressable onPress={()=>setCreateModal(true)}
                  style={{ height:42, borderRadius:999, paddingHorizontal:24,
                    backgroundColor:c.accentPurple, alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ color:"#fff", fontWeight:"800" }}>Créer un groupe</Text>
                </Pressable>
              </View>
            }
            renderItem={({item})=>(
              <GroupItem
                groupId={item.groupId}
                name={item.name}
                description={item.description}
                track={item.filiere || ""}
                privacy={item.privacy}
                memberCount={item.memberCount}
                lastMessage={item.lastMessage}
                lastActivity={item.lastActivity}
                unreadCount={item.unreadCount}
                avatarColor={item.avatarColor}
                onPress={g=>router.push({ pathname:"/messages/group/[id]", params:{ id:g.groupId } })} />
            )}
          />
        )}
      </Animated.View>

      {/* Modal créer groupe */}
      <Modal visible={createModal} transparent animationType="slide" onRequestClose={()=>setCreateModal(false)}>
        <View style={{ flex:1, justifyContent:"flex-end", backgroundColor:"rgba(0,0,0,0.55)" }}>
          <Pressable style={{ position:"absolute", top:0, left:0, right:0, bottom:0 }} onPress={()=>setCreateModal(false)} />
          <View style={{ backgroundColor:c.card, borderTopLeftRadius:24, borderTopRightRadius:24,
            borderWidth:1, borderColor:c.border, padding:24, paddingBottom:insets.bottom+20, gap:14 }}>
            <Text style={{ color:c.textPrimary, fontSize:20, fontWeight:"800" }}>Créer un groupe</Text>
            <TextInput value={groupName} onChangeText={setGroupName} placeholder="Nom du groupe"
              placeholderTextColor={c.textSecondary} style={inputStyle} />
            <TextInput value={groupDesc} onChangeText={setGroupDesc} placeholder="Description (optionnel)"
              placeholderTextColor={c.textSecondary} style={inputStyle} />
            <TextInput value={groupTrack} onChangeText={setGroupTrack} placeholder="Filière"
              placeholderTextColor={c.textSecondary} style={inputStyle} />
            <View style={{ flexDirection:"row", gap:8 }}>
              {(["public","private"] as const).map(p=>(
                <Pressable key={p} onPress={()=>setGroupPrivacy(p)}
                  style={{ flex:1, height:38, borderRadius:10, borderWidth:1.5,
                    borderColor: groupPrivacy===p ? c.accentPurple : c.border,
                    backgroundColor: groupPrivacy===p ? c.accentPurple+"22" : c.cardAlt,
                    alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ color: groupPrivacy===p ? c.accentPurple : c.textSecondary, fontWeight:"700" }}>
                    {p === "public" ? "Public" : "Privé"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection:"row", gap:10 }}>
              <Pressable onPress={()=>setCreateModal(false)}
                style={{ flex:1, height:44, borderRadius:12, borderWidth:1, borderColor:c.border,
                  alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:c.textSecondary, fontWeight:"700" }}>Annuler</Text>
              </Pressable>
              <Pressable onPress={doCreate}
                style={{ flex:1, height:44, borderRadius:12, backgroundColor:c.accentPurple,
                  alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:"#fff", fontWeight:"800" }}>Créer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
