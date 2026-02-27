import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SegmentedTabs, { SegmentedItem } from "../../../src/core/ui/SegmentedTabs";
import { ConversationItem } from "../../../src/features/messages/v1/components/ConversationItem";
import { GroupItem } from "../../../src/features/messages/v1/components/GroupItem";
import { useMessagesStore } from "../../../state/useMessagesStore";
import { AppButton } from "../../../src/core/ui/AppButton";
import IconButton from "../../../src/core/ui/IconButton";

type SectionTab = "discussions" | "groupes";

const messageTabs: SegmentedItem<SectionTab>[] = [
  { key: "discussions", label: "Discussions" },
  { key: "groupes", label: "Groupes" },
];

function SkeletonList() {
  return (
    <View style={{ gap: 10, marginTop: 4 }}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonRow}>
          <View style={styles.skeletonAvatar} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={styles.skeletonLineMd} />
            <View style={styles.skeletonLineSm} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function MessagesTabScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SectionTab>("discussions");
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupTrack, setGroupTrack] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState<"public" | "private">("public");

  const { inbox, groups, loading, loadInbox, loadGroups, createGroup, joinGroup } = useMessagesStore();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInbox().catch(() => null);
    loadGroups().catch(() => null);
  }, [loadInbox, loadGroups]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [activeTab, fadeAnim, slideAnim]);

  const joinedGroups = useMemo(() => groups.filter((group) => group.joined), [groups]);
  const discoverGroups = useMemo(() => groups.filter((group) => !group.joined), [groups]);

  const createGroupAction = async () => {
    const name = groupName.trim();
    if (!name) return;

    try {
      await createGroup({
        name,
        description: groupDescription,
        filiere: groupTrack,
        privacy: groupPrivacy,
      });
      setGroupName("");
      setGroupDescription("");
      setGroupTrack("");
      setGroupPrivacy("public");
      setIsCreateVisible(false);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de creer le groupe.");
    }
  };

  const discussionsEmpty = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Aucune discussion.</Text>
      <Text style={styles.emptyText}>Ecris a un ami ou rejoins un groupe.</Text>
      <View style={{ width: "100%", gap: 8, paddingHorizontal: 12 }}>
        <AppButton onPress={() => router.push("/(modals)/new-conversation")}>Demarrer une discussion</AppButton>
        <AppButton variant="secondary" onPress={() => setActiveTab("groupes")}>Voir les groupes</AppButton>
      </View>
    </View>
  );

  const groupsEmpty = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Aucun groupe rejoint.</Text>
      <Text style={styles.emptyText}>Cree un groupe de travail pour ton cours.</Text>
      <AppButton onPress={() => setIsCreateVisible(true)}>Creer un groupe</AppButton>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Messages</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <IconButton onPress={() => router.push("/(modals)/new-conversation")}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </IconButton>
          {activeTab === "groupes" ? (
            <AppButton variant="secondary" style={styles.lightAction} onPress={() => setIsCreateVisible(true)}>Creer</AppButton>
          ) : null}
        </View>
      </View>

      <SegmentedTabs items={messageTabs} value={activeTab} onChange={setActiveTab} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
        {loading ? (
          <SkeletonList />
        ) : activeTab === "discussions" ? (
          <FlatList
            data={inbox}
            keyExtractor={(item) => item.conversationId}
            renderItem={({ item }) => (
              <ConversationItem
                id={item.conversationId}
                name={item.name}
                lastMessage={item.lastMessage}
                timestamp={item.timestamp}
                unreadCount={item.unreadCount}
                avatar={item.avatar}
                onPress={(id) => router.push({ pathname: "/messages/[id]", params: { id } })}
              />
            )}
            ListEmptyComponent={discussionsEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={joinedGroups}
            keyExtractor={(item) => item.groupId}
            renderItem={({ item }) => (
              <GroupItem
                groupId={item.groupId}
                name={item.name}
                description={item.description}
                track={item.filiere || "General"}
                privacy={item.privacy}
                memberCount={item.memberCount}
                lastMessage={item.lastMessage}
                lastActivity={item.lastActivity}
                unreadCount={item.unreadCount}
                avatarColor={item.avatarColor}
                onPress={(group) =>
                  router.push({ pathname: "/messages/group/[id]", params: { id: group.groupId } })
                }
              />
            )}
            ListHeaderComponent={
              discoverGroups.length > 0 ? (
                <View style={styles.discoverWrap}>
                  <Text style={styles.discoverTitle}>Decouvrir</Text>
                  {discoverGroups.map((group) => (
                    <View key={group.groupId} style={styles.discoverRow}>
                      <View style={[styles.discoverAvatar, { backgroundColor: group.avatarColor }]}>
                        <Text style={styles.discoverAvatarText}>{group.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.discoverName}>{group.name}</Text>
                        <Text style={styles.discoverMeta}>{group.memberCount} membres - {group.privacy}</Text>
                      </View>
                      <AppButton
                        style={styles.joinBtn}
                        onPress={async () => {
                          try {
                            await joinGroup(group.groupId);
                          } catch (error: any) {
                            Alert.alert("Erreur", error?.message || "Impossible de rejoindre");
                          }
                        }}
                      >
                        Rejoindre
                      </AppButton>
                    </View>
                  ))}
                </View>
              ) : null
            }
            ListEmptyComponent={groupsEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      <Modal visible={isCreateVisible} transparent animationType="fade" onRequestClose={() => setIsCreateVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsCreateVisible(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Creer un groupe</Text>

            <TextInput value={groupName} onChangeText={setGroupName} placeholder="Nom" placeholderTextColor="#6E6E77" style={styles.input} />
            <TextInput value={groupDescription} onChangeText={setGroupDescription} placeholder="Description" placeholderTextColor="#6E6E77" style={styles.input} />
            <TextInput value={groupTrack} onChangeText={setGroupTrack} placeholder="Filiere" placeholderTextColor="#6E6E77" style={styles.input} />

            <View style={styles.privacyRow}>
              <AppButton style={[styles.privacyButton, groupPrivacy === "public" && styles.privacyButtonActive]} variant="secondary" onPress={() => setGroupPrivacy("public")}>Public</AppButton>
              <AppButton style={[styles.privacyButton, groupPrivacy === "private" && styles.privacyButtonActive]} variant="secondary" onPress={() => setGroupPrivacy("private")}>Prive</AppButton>
            </View>

            <View style={styles.actionsRow}>
              <AppButton variant="secondary" style={styles.secondaryAction} onPress={() => setIsCreateVisible(false)}>Annuler</AppButton>
              <AppButton style={styles.primaryAction} onPress={createGroupAction}>Creer</AppButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", paddingTop: 56, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  header: { fontSize: 30, fontWeight: "800", color: "#F5F5F5" },
  lightAction: {
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: "#1A1A21",
    borderWidth: 1,
    borderColor: "#2B2B36",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, marginTop: 10 },
  listContent: { paddingBottom: 110, gap: 10 },
  emptyState: { marginTop: 30, alignItems: "center", gap: 8, paddingHorizontal: 22 },
  emptyTitle: { color: "#F6F6FA", fontSize: 18, fontWeight: "800", textAlign: "center" },
  emptyText: { color: "#8A8A97", textAlign: "center", lineHeight: 19 },
  emptyCta: {
    marginTop: 8,
    height: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: "#5B4CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCtaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#111115",
    borderWidth: 1,
    borderColor: "#1D1D25",
    gap: 10,
  },
  skeletonAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#1F1F29" },
  skeletonLineMd: { height: 12, width: "56%", borderRadius: 6, backgroundColor: "#1F1F29" },
  skeletonLineSm: { height: 10, width: "72%", borderRadius: 5, backgroundColor: "#1A1A24" },
  discoverWrap: { marginBottom: 12, gap: 8 },
  discoverTitle: { color: "#F5F5F5", fontWeight: "700", fontSize: 14 },
  discoverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#121216",
    borderWidth: 1,
    borderColor: "#1E1E25",
    borderRadius: 14,
    padding: 10,
  },
  discoverAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  discoverAvatarText: { color: "#fff", fontWeight: "800" },
  discoverName: { color: "#fff", fontWeight: "700" },
  discoverMeta: { color: "#999", fontSize: 12, marginTop: 2 },
  joinBtn: { backgroundColor: "#2C7BFF", borderRadius: 10, paddingHorizontal: 10, height: 32, alignItems: "center", justifyContent: "center" },
  joinBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  modalRoot: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  modalCard: {
    width: "90%",
    backgroundColor: "#111115",
    borderWidth: 1,
    borderColor: "#232330",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  modalTitle: { color: "#F5F5F5", fontSize: 18, fontWeight: "800", marginBottom: 2 },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#232330",
    backgroundColor: "#17171D",
    color: "#F5F5F5",
    paddingHorizontal: 12,
  },
  privacyRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  privacyButton: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#303040",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#181820",
  },
  privacyButtonActive: { backgroundColor: "#2C2468", borderColor: "#6152D7" },
  privacyText: { color: "#A3A3AF", fontWeight: "700" },
  privacyTextActive: { color: "#F1EFFF" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  secondaryAction: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#343445",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: { color: "#D0D0D8", fontWeight: "700" },
  primaryAction: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#654BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.85 },
});
