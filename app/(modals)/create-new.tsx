import { useTheme } from "../../src/core/theme/ThemeProvider";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFeedStore } from "../../state/useFeedStore";
import { useAuthStore } from "../../state/useAuthStore";

// expo-av chargé dynamiquement pour éviter crash Expo Go
async function safeGetAudio() {
  try {
    const { Audio } = await import("expo-av");
    return Audio;
  } catch {
    return null;
  }
}

export default function CreateModal() {
  const router   = useRouter();
  const { c }    = useTheme();
  const { profile } = useAuthStore();
  const { createPost, refresh } = useFeedStore();

  const [tab,         setTab]         = useState<"post"|"audio"|"fichier">("post");
  const [title,       setTitle]       = useState("");
  const [content,     setContent]     = useState("");
  const [publishing,  setPublishing]  = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs,  setRecordSecs]  = useState(0);
  const recRef   = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fmt = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;

  const startRec = async () => {
    const Audio = await safeGetAudio();
    if (!Audio) { Alert.alert("Non supporté", "L'enregistrement audio n'est pas disponible ici."); return; }
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recRef.current = recording;
      setIsRecording(true); setRecordSecs(0);
      timerRef.current = setInterval(() => setRecordSecs(s => s+1), 1000);
    } catch (e: any) { Alert.alert("Erreur", e?.message); }
  };

  const stopRec = async () => {
    if (!recRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await recRef.current.stopAndUnloadAsync();
      recRef.current = null; setIsRecording(false); setRecordSecs(0);
      Alert.alert("Enregistré ✅", "Note audio sauvegardée.");
    } catch { setIsRecording(false); }
  };

  const pickFile = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (!r.canceled && r.assets?.[0]) Alert.alert("Fichier sélectionné", r.assets[0].name);
    } catch {}
  };

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.images, quality: 0.85 });
      if (!r.canceled && r.assets?.[0]) Alert.alert("Média sélectionné", r.assets[0].uri.split("/").pop() || "");
    } catch {}
  };

  const publish = async () => {
    if (!content.trim()) { Alert.alert("Champ requis", "Ajoute un contenu."); return; }
    setPublishing(true);
    try {
      await createPost({ title: title.trim() || undefined, content: content.trim(), filiere: profile?.filiere || "Général" } as any);
      await refresh(profile?.filiere || undefined);
      router.back();
    } catch (e: any) { Alert.alert("Erreur", e?.message || "Impossible de publier."); }
    finally { setPublishing(false); }
  };

  const TABS = [
    { key: "post"    as const, label: "Publication", icon: "create-outline"      },
    { key: "audio"   as const, label: "Audio",       icon: "mic-outline"          },
    { key: "fichier" as const, label: "Fichier",     icon: "attach-outline"       },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor:c.border }}>
        <Pressable onPress={() => router.back()} style={{ width:36, height:36, borderRadius:18, backgroundColor:c.cardAlt, alignItems:"center", justifyContent:"center" }}>
          <Ionicons name="close" size={20} color={c.textPrimary} />
        </Pressable>
        <Text style={{ color:c.textPrimary, fontSize:17, fontWeight:"800" }}>Créer</Text>
        <Pressable onPress={publish} disabled={publishing || !content.trim()} style={{ height:34, borderRadius:999, paddingHorizontal:16, backgroundColor: content.trim() ? c.accentPurple : c.cardAlt, alignItems:"center", justifyContent:"center" }}>
          {publishing ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={{ color: content.trim() ? "#FFF" : c.textSecondary, fontWeight:"800", fontSize:14 }}>Publier</Text>}
        </Pressable>
      </View>

      {/* Onglets type */}
      <View style={{ flexDirection:"row", borderBottomWidth:1, borderBottomColor:c.border }}>
        {TABS.map(t => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={{ flex:1, paddingVertical:12, alignItems:"center", flexDirection:"row", justifyContent:"center", gap:6, borderBottomWidth:2, borderBottomColor:tab===t.key?c.accentPurple:"transparent" }}>
            <Ionicons name={t.icon as any} size={16} color={tab===t.key?c.accentPurple:c.textSecondary} />
            <Text style={{ color:tab===t.key?c.accentPurple:c.textSecondary, fontWeight:"700", fontSize:13 }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding:16, gap:14 }} keyboardShouldPersistTaps="handled">
        {tab === "post" && (
          <>
            <TextInput value={title} onChangeText={setTitle} placeholder="Titre (optionnel)" placeholderTextColor={c.textSecondary}
              style={{ backgroundColor:c.cardAlt, borderRadius:14, borderWidth:1, borderColor:c.border, paddingHorizontal:14, paddingVertical:12, color:c.textPrimary, fontSize:15 }} />
            <TextInput value={content} onChangeText={setContent} placeholder="Exprime-toi, partage tes notes, tes QCM…" placeholderTextColor={c.textSecondary}
              style={{ backgroundColor:c.cardAlt, borderRadius:14, borderWidth:1, borderColor:c.border, paddingHorizontal:14, paddingVertical:12, color:c.textPrimary, fontSize:15, minHeight:160, textAlignVertical:"top" }} multiline />
            <Pressable onPress={pickImage} style={({ pressed }) => [{ flexDirection:"row", alignItems:"center", gap:12, backgroundColor:c.cardAlt, borderRadius:14, borderWidth:1, borderColor:c.border, padding:14 }, pressed && { opacity:0.8 }]}>
              <Ionicons name="image-outline" size={22} color={c.accentBlue} />
              <Text style={{ color:c.textPrimary, fontWeight:"600" }}>Ajouter une image</Text>
            </Pressable>
          </>
        )}

        {tab === "audio" && (
          <View style={{ alignItems:"center", gap:20, paddingVertical:30 }}>
            <View style={{ width:100, height:100, borderRadius:50, backgroundColor: isRecording ? "#FF3B3020" : c.accentPurple+"20", borderWidth:2, borderColor: isRecording ? "#FF3B30" : c.accentPurple, alignItems:"center", justifyContent:"center" }}>
              <Ionicons name={isRecording ? "stop" : "mic"} size={40} color={isRecording ? "#FF3B30" : c.accentPurple} />
            </View>
            {isRecording && <Text style={{ color:"#FF3B30", fontSize:22, fontWeight:"800", fontVariant:["tabular-nums"] }}>{fmt(recordSecs)}</Text>}
            <Pressable onPress={isRecording ? stopRec : startRec} style={{ height:50, borderRadius:999, paddingHorizontal:30, backgroundColor: isRecording ? "#FF3B30" : c.accentPurple, alignItems:"center", justifyContent:"center" }}>
              <Text style={{ color:"#FFF", fontWeight:"800", fontSize:16 }}>{isRecording ? "Arrêter et sauvegarder" : "Commencer l'enregistrement"}</Text>
            </Pressable>
            <Text style={{ color:c.textSecondary, textAlign:"center", fontSize:13 }}>Maintiens pour enregistrer une note audio à partager</Text>
          </View>
        )}

        {tab === "fichier" && (
          <View style={{ gap:12 }}>
            {[
              { icon:"document-attach-outline", label:"Importer un PDF",      action: pickFile  },
              { icon:"image-outline",           label:"Importer une image",   action: pickImage },
              { icon:"cloud-upload-outline",    label:"Depuis le stockage",   action: pickFile  },
            ].map(item => (
              <Pressable key={item.label} onPress={item.action} style={({ pressed }) => [{ flexDirection:"row", alignItems:"center", gap:14, backgroundColor:c.cardAlt, borderRadius:16, borderWidth:1, borderColor:c.border, padding:16 }, pressed && { opacity:0.8 }]}>
                <View style={{ width:44, height:44, borderRadius:14, backgroundColor:c.accentPurple+"22", alignItems:"center", justifyContent:"center" }}>
                  <Ionicons name={item.icon as any} size={22} color={c.accentPurple} />
                </View>
                <Text style={{ color:c.textPrimary, fontWeight:"700", fontSize:15 }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={c.textSecondary} style={{ marginLeft:"auto" }} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
