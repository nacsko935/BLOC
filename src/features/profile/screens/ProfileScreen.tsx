import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getSessionUser } from "../../auth/authRepo";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { ProfileTabs, ProfileTab } from "../components/ProfileTabs";

type ActivityPost = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
};

type CourseItem = {
  id: string;
  title: string;
  progress: string;
};

type FileItem = {
  id: string;
  title: string;
  type: string;
  size: string;
};

type GroupItem = {
  id: string;
  name: string;
  members: number;
  activity: string;
};

const activityData: ActivityPost[] = [
  { id: "a1", title: "Resume BDD publie", subtitle: "Tu as partage une fiche SQL.", time: "Il y a 2 h" },
  { id: "a2", title: "QCM termine", subtitle: "Score 18/20 en algorithmie.", time: "Hier" },
];

const courseData: CourseItem[] = [
  { id: "c1", title: "Base de donnees", progress: "Progression 72%" },
  { id: "c2", title: "Systemes repartis", progress: "Progression 38%" },
];

const fileData: FileItem[] = [
  { id: "f1", title: "CheatSheet_SQL.pdf", type: "PDF", size: "1.4 MB" },
  { id: "f2", title: "Architecture_Cloud.pdf", type: "PDF", size: "2.1 MB" },
];

const groupData: GroupItem[] = [
  { id: "g1", name: "BDD L3", members: 18, activity: "Actif il y a 5 min" },
  { id: "g2", name: "Algo avancee", members: 11, activity: "Actif hier" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<ProfileTab>("activite");
  const [user, setUser] = useState<{ name: string; handle: string; bio: string | null } | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const sessionUser = await getSessionUser();
      if (!sessionUser) return;
      setUser({ name: sessionUser.name, handle: sessionUser.handle, bio: sessionUser.bio ?? null });
    })();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [tab, fadeAnim, slideAnim]);

  const content = useMemo(() => {
    if (tab === "activite") {
      return activityData.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          <Text style={styles.cardMeta}>{item.time}</Text>
        </View>
      ));
    }

    if (tab === "cours") {
      return courseData.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.progress}</Text>
        </View>
      ));
    }

    if (tab === "fichiers") {
      return fileData.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.badge}>{item.type}</Text>
          </View>
          <Text style={styles.cardMeta}>{item.size}</Text>
        </View>
      ));
    }

    return groupData.map((item) => (
      <View key={item.id} style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.members} membres</Text>
        <Text style={styles.cardMeta}>{item.activity}</Text>
      </View>
    ));
  }, [tab]);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} stickyHeaderIndices={[4]}>
        <ProfileHeader
          name={user?.name ?? "Utilisateur"}
          onEditPhoto={() => router.push("/(modals)/profile-photo")}
          onSettings={() => router.push("/settings")}
          onShare={() => {}}
        />

        <View style={styles.infoBlock}>
          <Text style={styles.name}>{user?.name ?? "Utilisateur"}</Text>
          <Text style={styles.handle}>{user?.handle ?? "@username"}</Text>
          <Text style={styles.bio} numberOfLines={2}>
            {user?.bio ?? "Etudiant motive, passionne de productivite et de collaboration."}
          </Text>
          <ProfileStats followers={11} following={9} points={906} />
        </View>

        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={() => router.push("/(modals)/edit-profile")}>
          <Text style={styles.primaryButtonText}>Modifier le profil</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.composer, pressed && styles.pressed]} onPress={() => router.push("/(modals)/create-new")}>
          <Text style={styles.composerText}>Quoi de neuf ?</Text>
          <View style={styles.composerActions}>
            <Ionicons name="image-outline" size={18} color="#8D8D98" />
            <Ionicons name="sparkles-outline" size={18} color="#8D8D98" />
          </View>
        </Pressable>

        <View style={styles.stickyTabsWrap}>
          <ProfileTabs activeTab={tab} onChange={setTab} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 10 }}>
          {content}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 110,
    gap: 12,
  },
  infoBlock: {
    gap: 6,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  handle: {
    color: "#8A8A95",
    fontSize: 14,
    fontWeight: "600",
  },
  bio: {
    color: "#C5C5CF",
    marginTop: 4,
    lineHeight: 20,
  },
  primaryButton: {
    height: 42,
    borderRadius: 999,
    backgroundColor: "#5B4CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  composer: {
    backgroundColor: "#111114",
    borderWidth: 1,
    borderColor: "#1F1F26",
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  composerText: {
    color: "#91919D",
    fontSize: 15,
    fontWeight: "600",
  },
  composerActions: {
    flexDirection: "row",
    gap: 10,
  },
  stickyTabsWrap: {
    backgroundColor: "#000000",
    paddingBottom: 8,
    paddingTop: 2,
  },
  card: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#202028",
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    color: "#F8F8FB",
    fontWeight: "700",
    fontSize: 15,
  },
  cardSubtitle: {
    color: "#A5A5B0",
    fontSize: 13,
  },
  cardMeta: {
    color: "#7D7D89",
    fontSize: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    color: "#DAD7FF",
    backgroundColor: "#2A2663",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
