import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SegmentedTabs, { SegmentedItem } from "../../src/core/ui/SegmentedTabs";
import { ProfileHeader } from "../../src/features/profile/components/ProfileHeader";
import { ProfileStats } from "../../src/features/profile/components/ProfileStats";
import { useAuthStore } from "../../state/useAuthStore";
import { AppButton } from "../../src/core/ui/AppButton";

type ProfileTab = "activite" | "contenus" | "groupes";

const profileTabs: SegmentedItem<ProfileTab>[] = [
  { key: "activite", label: "Activite" },
  { key: "contenus", label: "Contenus" },
  { key: "groupes", label: "Groupes" },
];

export default function ProfileTabRoute() {
  const router = useRouter();
  const { profile, user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>("activite");
  const [editVisible, setEditVisible] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setUsername(profile?.username || "");
    setBio(profile?.bio || "");
  }, [profile]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [activeTab, fadeAnim, slideAnim]);

  const tabContent = useMemo(() => {
    if (activeTab === "activite") {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aucune activite recente</Text>
          <Text style={styles.cardMeta}>Partage une publication depuis l'onglet Creer.</Text>
        </View>
      );
    }

    if (activeTab === "contenus") {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contenus sauvegardes</Text>
          <Text style={styles.cardMeta}>Les PDF/QCM sauvegardes apparaitront ici.</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Groupes rejoints</Text>
        <Text style={styles.cardMeta}>Retrouve tes groupes de travail dans Messages.</Text>
      </View>
    );
  }, [activeTab]);

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName, username, bio });
    setEditVisible(false);
  };

  const headerName = fullName || profile?.full_name || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfileHeader
          name={headerName}
          onEditPhoto={() => setEditVisible(true)}
          onSettings={() => router.push("/settings")}
          onShare={() => Alert.alert("Partager", "Lien profil copie (demo).")}
        />

        <View style={styles.infoBlock}>
          <Text style={styles.name}>{headerName}</Text>
          <Text style={styles.handle}>@{profile?.username || user?.email?.split("@")[0] || "bloc"}</Text>
          <Text style={styles.bio} numberOfLines={2}>{profile?.bio || "Ajoute une bio pour completer ton profil."}</Text>
          <ProfileStats followers={11} following={9} points={906} />
        </View>

        <AppButton style={styles.primaryButton} onPress={() => setEditVisible(true)}>Modifier le profil</AppButton>

        <Pressable style={({ pressed }) => [styles.composer, pressed && styles.pressed]} onPress={() => router.push("/create") }>
          <Text style={styles.composerText}>Quoi de neuf ?</Text>
          <View style={styles.composerActions}>
            <Ionicons name="image-outline" size={18} color="#8D8D98" />
            <Ionicons name="sparkles-outline" size={18} color="#8D8D98" />
          </View>
        </Pressable>

        <SegmentedTabs items={profileTabs} value={activeTab} onChange={setActiveTab} />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {tabContent}
        </Animated.View>
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditVisible(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Nom" placeholderTextColor="#888" style={styles.input} />
            <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor="#888" style={styles.input} />
            <TextInput value={bio} onChangeText={setBio} placeholder="Bio" placeholderTextColor="#888" style={[styles.input, { minHeight: 78 }]} multiline />
            <View style={styles.actionsRow}>
              <AppButton variant="secondary" style={styles.secondaryAction} onPress={() => setEditVisible(false)}>Annuler</AppButton>
              <AppButton style={styles.primaryAction} onPress={handleSaveProfile}>Enregistrer</AppButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000000" },
  scrollContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 110, gap: 12 },
  infoBlock: { gap: 6 },
  name: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  handle: { color: "#8A8A95", fontSize: 14, fontWeight: "600" },
  bio: { color: "#C5C5CF", marginTop: 4, lineHeight: 20 },
  primaryButton: {
    height: 44,
    borderRadius: 999,
    backgroundColor: "#5B4CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
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
  composerText: { color: "#91919D", fontSize: 15, fontWeight: "600" },
  composerActions: { flexDirection: "row", gap: 10 },
  card: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#202028",
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  cardTitle: { color: "#F8F8FB", fontWeight: "700", fontSize: 15 },
  cardMeta: { color: "#7D7D89", fontSize: 12 },
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#232330",
    backgroundColor: "#17171D",
    color: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
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
