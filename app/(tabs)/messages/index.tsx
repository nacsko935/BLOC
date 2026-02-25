import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import SegmentedTabs, { SegmentedItem } from "../../../src/core/ui/SegmentedTabs";
import { ConversationItem } from "../../../src/features/messages/v1/components/ConversationItem";
import { GroupItem } from "../../../src/features/messages/v1/components/GroupItem";
import { GroupPrivacy, WorkGroup, conversations, initialWorkGroups } from "../../../src/features/messages/v1/mock";

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
  const [groups, setGroups] = useState<WorkGroup[]>(initialWorkGroups);
  const [loading, setLoading] = useState(true);

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupTrack, setGroupTrack] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState<GroupPrivacy>("public");

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [activeTab, fadeAnim, slideAnim]);

  const openGroup = (group: WorkGroup) => {
    router.push({
      pathname: "/messages/group/[id]",
      params: {
        id: group.groupId,
        name: group.name,
        members: String(group.memberCount),
      },
    });
  };

  const createGroup = () => {
    const name = groupName.trim();
    if (!name) return;

    const palette = ["#654BFF", "#2A8CFF", "#7C52FF", "#4A7BFF"];
    const nextGroup: WorkGroup = {
      groupId: `grp-${Date.now()}`,
      name,
      description: groupDescription.trim() || "Groupe de travail",
      track: groupTrack.trim() || "General",
      privacy: groupPrivacy,
      memberCount: 1,
      lastMessage: "Groupe cree. Lance la discussion.",
      lastActivity: "Maintenant",
      unreadCount: 0,
      avatarColor: palette[Date.now() % palette.length],
    };

    setGroups((prev) => [nextGroup, ...prev]);
    setGroupName("");
    setGroupDescription("");
    setGroupTrack("");
    setGroupPrivacy("public");
    setIsCreateVisible(false);
  };

  const discussionsEmpty = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Aucune discussion.</Text>
      <Text style={styles.emptyText}>Ecris a un ami ou rejoins un groupe.</Text>
      <Pressable style={({ pressed }) => [styles.emptyCta, pressed && styles.pressed]} onPress={() => router.push("/(modals)/new-conversation")}>
        <Text style={styles.emptyCtaText}>Trouver des etudiants</Text>
      </Pressable>
    </View>
  );

  const groupsEmpty = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Aucun groupe.</Text>
      <Text style={styles.emptyText}>Cree un groupe de travail pour ton cours.</Text>
      <Pressable style={({ pressed }) => [styles.emptyCta, pressed && styles.pressed]} onPress={() => setIsCreateVisible(true)}>
        <Text style={styles.emptyCtaText}>Creer un groupe</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Messages</Text>
        {activeTab === "groupes" ? (
          <Pressable style={({ pressed }) => [styles.lightAction, pressed && styles.pressed]} onPress={() => setIsCreateVisible(true)}>
            <Text style={styles.lightActionText}>Creer</Text>
          </Pressable>
        ) : null}
      </View>

      <SegmentedTabs items={messageTabs} value={activeTab} onChange={setActiveTab} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {loading ? (
          <SkeletonList />
        ) : activeTab === "discussions" ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationItem
                {...item}
                onPress={(id) => router.push({ pathname: "/messages/[id]", params: { id } })}
              />
            )}
            ListEmptyComponent={discussionsEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.groupId}
            renderItem={({ item }) => <GroupItem {...item} onPress={openGroup} />}
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

            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Nom"
              placeholderTextColor="#6E6E77"
              style={styles.input}
            />
            <TextInput
              value={groupDescription}
              onChangeText={setGroupDescription}
              placeholder="Description"
              placeholderTextColor="#6E6E77"
              style={styles.input}
            />
            <TextInput
              value={groupTrack}
              onChangeText={setGroupTrack}
              placeholder="Filiere"
              placeholderTextColor="#6E6E77"
              style={styles.input}
            />

            <View style={styles.privacyRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.privacyButton,
                  groupPrivacy === "public" && styles.privacyButtonActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => setGroupPrivacy("public")}
              >
                <Text style={[styles.privacyText, groupPrivacy === "public" && styles.privacyTextActive]}>Public</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.privacyButton,
                  groupPrivacy === "private" && styles.privacyButtonActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => setGroupPrivacy("private")}
              >
                <Text style={[styles.privacyText, groupPrivacy === "private" && styles.privacyTextActive]}>Prive</Text>
              </Pressable>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]} onPress={() => setIsCreateVisible(false)}>
                <Text style={styles.secondaryActionText}>Annuler</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]} onPress={createGroup}>
                <Text style={styles.primaryActionText}>Creer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F5F5F5",
  },
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
  lightActionText: {
    color: "#D5D5E0",
    fontWeight: "700",
    fontSize: 12,
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 110,
    gap: 10,
  },
  emptyState: {
    marginTop: 30,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
  },
  emptyTitle: {
    color: "#F6F6FA",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#8A8A97",
    textAlign: "center",
    lineHeight: 19,
  },
  emptyCta: {
    marginTop: 8,
    height: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: "#5B4CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCtaText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
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
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1F1F29",
  },
  skeletonLineMd: {
    height: 12,
    width: "56%",
    borderRadius: 6,
    backgroundColor: "#1F1F29",
  },
  skeletonLineSm: {
    height: 10,
    width: "72%",
    borderRadius: 5,
    backgroundColor: "#1A1A24",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#111115",
    borderWidth: 1,
    borderColor: "#232330",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  modalTitle: {
    color: "#F5F5F5",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#232330",
    backgroundColor: "#17171D",
    color: "#F5F5F5",
    paddingHorizontal: 12,
  },
  privacyRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
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
  privacyButtonActive: {
    backgroundColor: "#2C2468",
    borderColor: "#6152D7",
  },
  privacyText: {
    color: "#A3A3AF",
    fontWeight: "700",
  },
  privacyTextActive: {
    color: "#F1EFFF",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  secondaryAction: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#343445",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: "#D0D0D8",
    fontWeight: "700",
  },
  primaryAction: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#654BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
  },
});
