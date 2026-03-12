import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Image,
  Pressable, StyleSheet, Text, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../state/useAuthStore";
import { Profile } from "../../types/db";
import {
  getFollowersList,
  getFollowingList,
  toggleFollow,
  isFollowing as checkFollowing,
} from "../../lib/services/profileService";

function asStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default function FollowersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, type } = useLocalSearchParams<{ userId?: string | string[]; type?: string | string[] }>();
  const targetUserId = asStr(userId);
  const listType = asStr(type) === "following" ? "following" : "followers";
  const title = listType === "following" ? "Suivis" : "Abonnés";

  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const list = listType === "following"
        ? await getFollowingList(targetUserId)
        : await getFollowersList(targetUserId);
      setProfiles(list);

      // Check follow status for each user (excluding self)
      if (user?.id) {
        const checks = await Promise.all(
          list
            .filter(p => p.id !== user.id)
            .map(async p => ({ id: p.id, following: await checkFollowing(p.id) }))
        );
        const map: Record<string, boolean> = {};
        checks.forEach(c => { map[c.id] = c.following; });
        setFollowMap(map);
      }
    } finally {
      setLoading(false);
    }
  }, [targetUserId, listType, user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleToggleFollow = useCallback(async (profileId: string) => {
    if (!user?.id || profileId === user.id) return;
    setLoadingMap(prev => ({ ...prev, [profileId]: true }));
    const prev = followMap[profileId];
    setFollowMap(m => ({ ...m, [profileId]: !prev }));
    try {
      await toggleFollow(profileId);
    } catch {
      setFollowMap(m => ({ ...m, [profileId]: prev }));
    } finally {
      setLoadingMap(m => ({ ...m, [profileId]: false }));
    }
  }, [followMap, user?.id]);

  const renderItem = ({ item }: { item: Profile }) => {
    const displayName = item.display_name || item.full_name || item.username || "Utilisateur";
    const handle = item.username ? `@${item.username}` : "";
    const isMe = item.id === user?.id;
    const following = followMap[item.id];
    const busy = loadingMap[item.id];

    return (
      <Pressable
        onPress={() => router.push({ pathname: "/profile/[id]", params: { id: item.id } })}
        style={s.row}>
        <View style={s.avatarWrap}>
          {item.avatar_url
            ? <Image source={{ uri: item.avatar_url }} style={s.avatar} />
            : <Text style={s.avatarFallback}>{displayName.charAt(0).toUpperCase()}</Text>
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{displayName}</Text>
          {handle ? <Text style={s.handle} numberOfLines={1}>{handle}</Text> : null}
        </View>
        {!isMe && (
          <Pressable
            onPress={() => handleToggleFollow(item.id)}
            disabled={busy}
            style={[s.followBtn, following && s.followBtnActive]}>
            {busy
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.followBtnTxt}>{following ? "Abonné" : "Suivre"}</Text>
            }
          </Pressable>
        )}
      </Pressable>
    );
  };

  return (
    <View style={s.screen}>
      <LinearGradient
        colors={["#1A0A3B", "#000"]}
        style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>{title}</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#7B6CFF" size="large" />
        </View>
      ) : profiles.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="people-outline" size={52} color="rgba(255,255,255,0.15)" />
          <Text style={s.emptyTxt}>
            {listType === "followers" ? "Aucun abonné" : "Ne suit personne"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={s.separator} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: "#000" },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:  { color: "#fff", fontSize: 18, fontWeight: "800" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  center:       { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTxt:     { color: "rgba(255,255,255,0.35)", fontSize: 15 },
  separator:    { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginHorizontal: 16 },
  row:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  avatarWrap:   { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(123,108,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(123,108,255,0.3)" },
  avatar:       { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { color: "#fff", fontSize: 20, fontWeight: "900" },
  name:         { color: "#fff", fontWeight: "700", fontSize: 15 },
  handle:       { color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 1 },
  followBtn:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#7B6CFF", backgroundColor: "#7B6CFF" },
  followBtnActive: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" },
  followBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
