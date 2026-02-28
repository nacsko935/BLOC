import { useTheme } from "../../src/core/theme/ThemeProvider";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { searchUsers } from "../../lib/services/searchService";
import { ensureDmConversation } from "../../lib/services/messageService";
import { useAuthStore } from "../../state/useAuthStore";

type FoundUser = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  filiere: string | null;
  niveau: string | null;
  bio: string | null;
};

export default function NewConversationModal() {
  const { c } = useTheme();
  const router = useRouter();
  const { profile } = useAuthStore();

  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<FoundUser[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<FoundUser | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await searchUsers(query);
        setResults(users.filter(u => u.id !== profile?.id) as FoundUser[]);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, profile?.id]);

  const handleStart = async () => {
    if (!selected || creating) return;
    setCreating(true);
    try {
      const convId = await ensureDmConversation(selected.id);
      router.replace({ pathname: "/messages/[id]", params: { id: convId } } as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de démarrer la conversation.");
    } finally { setCreating(false); }
  };

  const displayName = (u: FoundUser) => u.full_name || u.username || "Utilisateur";
  const initials    = (u: FoundUser) => displayName(u).slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: c.border,
      }}>
        <Pressable onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.cardAlt, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="close" size={20} color={c.textPrimary} />
        </Pressable>
        <Text style={{ color: c.textPrimary, fontSize: 18, fontWeight: "800" }}>Nouvelle discussion</Text>
        <Pressable
          onPress={handleStart}
          disabled={!selected || creating}
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: selected ? c.accentPurple : c.cardAlt, opacity: (!selected || creating) ? 0.5 : 1 }}
        >
          {creating
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={{ color: selected ? "#fff" : c.textSecondary, fontWeight: "700", fontSize: 14 }}>Démarrer</Text>
          }
        </Pressable>
      </View>

      {selected && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: c.accentPurple + "15", borderBottomWidth: 1, borderBottomColor: c.border }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.accentPurple + "33", alignItems: "center", justifyContent: "center" }}>
            {selected.avatar_url
              ? <Image source={{ uri: selected.avatar_url }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              : <Text style={{ color: c.accentPurple, fontWeight: "800" }}>{initials(selected)}</Text>
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.textPrimary, fontWeight: "700" }}>{displayName(selected)}</Text>
            {selected.username && <Text style={{ color: c.textSecondary, fontSize: 12 }}>@{selected.username}</Text>}
          </View>
          <Pressable onPress={() => setSelected(null)}>
            <Ionicons name="close-circle" size={22} color={c.textSecondary} />
          </Pressable>
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.cardAlt, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, height: 46, margin: 16 }}>
        <Ionicons name="search-outline" size={16} color={c.textSecondary} />
        <TextInput
          autoFocus value={query} onChangeText={setQuery}
          placeholder="Chercher un utilisateur…" placeholderTextColor={c.textSecondary}
          style={{ flex: 1, color: c.textPrimary, fontSize: 15 }} autoCapitalize="none"
        />
        {loading && <ActivityIndicator size="small" color={c.accentPurple} />}
        {query.length > 0 && !loading && (
          <Pressable onPress={() => { setQuery(""); setResults([]); }}>
            <Ionicons name="close-circle" size={18} color={c.textSecondary} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={u => u.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 50, gap: 10 }}>
            <Ionicons name={query.trim() ? "search-outline" : "people-outline"} size={44} color={c.textSecondary} />
            <Text style={{ color: c.textSecondary, fontSize: 15 }}>
              {query.trim() ? `Aucun résultat pour "${query}"` : "Tape un nom ou @pseudo pour chercher"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSel = selected?.id === item.id;
          return (
            <Pressable
              onPress={() => setSelected(isSel ? null : item)}
              style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: isSel ? c.accentPurple + "18" : c.card, borderWidth: 1.5, borderColor: isSel ? c.accentPurple : c.border, borderRadius: 16, padding: 14 }, pressed && { opacity: 0.8 }]}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.accentPurple + "25", alignItems: "center", justifyContent: "center" }}>
                {item.avatar_url
                  ? <Image source={{ uri: item.avatar_url }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                  : <Text style={{ color: c.accentPurple, fontWeight: "800", fontSize: 18 }}>{initials(item)}</Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textPrimary, fontWeight: "700", fontSize: 15 }}>{displayName(item)}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {item.username ? `@${item.username}` : ""}
                  {item.filiere ? `  ·  ${item.filiere}` : ""}
                </Text>
              </View>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: isSel ? c.accentPurple : "transparent", borderWidth: 2, borderColor: isSel ? c.accentPurple : c.border, alignItems: "center", justifyContent: "center" }}>
                {isSel && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
