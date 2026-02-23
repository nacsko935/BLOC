import { useCallback, useRef, useState } from "react";
import { Animated, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Screen from "../../../core/ui/Screen";
import { AppHeader } from "../../../core/ui/AppHeader";
import { AppText } from "../../../core/ui/AppText";
import Card from "../../../core/ui/Card";
import { PrimaryButton, SecondaryButton } from "../../../core/ui/Buttons";
import { StatTile } from "../../../core/ui/StatTile";
import { PressableScale } from "../../../core/ui/PressableScale";
import { EditableAvatar } from "../components/EditableAvatar";
import { theme } from "../../../core/ui/theme";
import { getSessionUser, getUserSchool, listFollowedProfessors, signOut } from "../../auth/authRepo";
import { getProfilePhoto } from "../profileStore";

const badges = ["Focus", "7 jours", "QCM Master", "Productif"];

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    handle: string;
    bio: string | null;
    level: number;
    accountType: "student" | "professor" | "school";
  } | null>(null);
  const [school, setSchool] = useState<{ code: string; name: string } | null>(null);
  const [profs, setProfs] = useState<{ name: string; handle: string }[]>([]);
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const editScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fadeAnim.setValue(0);
      slideAnim.setValue(20);

      (async () => {
        const nextUser = await getSessionUser();
        const nextSchool = await getUserSchool();
        const nextProfs = await listFollowedProfessors();
        const photoUri = getProfilePhoto();
        if (!active) return;
        setUser(nextUser);
        setSchool(nextSchool);
        setProfs(nextProfs);
        setProfilePhotoState(photoUri);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, tension: 85, friction: 10, useNativeDriver: true }),
        ]).start();
      })();

      return () => {
        active = false;
      };
    }, [fadeAnim, slideAnim]),
  );

  const accountTone = user?.accountType === "professor" ? "Pro" : user?.accountType === "school" ? "Ecole" : "Etudiant";

  return (
    <Screen>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
          <AppHeader title="Profil" subtitle={accountTone} rightLabel="💬" onRightPress={() => router.push("/messages")} />

          <Card variant="elevated" style={{ padding: 0, overflow: "hidden" }}>
            <LinearGradient colors={["#10131b", "#171923"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
              <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                <EditableAvatar uri={profilePhoto} name={user?.name} onEdit={() => router.push("/(modals)/profile-photo")} />
                <View style={{ flex: 1 }}>
                  <AppText variant="h2">{user?.name ?? "Utilisateur"}</AppText>
                  <AppText muted variant="caption" style={{ marginTop: 2 }}>{user?.handle ?? "@user"}</AppText>
                  <View style={{ marginTop: 8, alignSelf: "flex-start", backgroundColor: "rgba(61,143,255,0.2)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <AppText variant="micro" style={{ color: theme.colors.accent, fontWeight: "800" }}>
                      Niveau {user?.level ?? 1}
                    </AppText>
                  </View>
                </View>
              </View>

              <AppText muted variant="body" style={{ marginTop: 14 }}>
                {user?.bio ?? "Passionne par l'apprentissage et la productivite."}
              </AppText>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <PrimaryButton style={{ flex: 1 }}>Partager</PrimaryButton>
                <SecondaryButton
                  style={{ flex: 1 }}
                  onPress={async () => {
                    await signOut();
                    router.replace("/(auth)/login");
                  }}
                >
                  Deconnexion
                </SecondaryButton>
              </View>
            </LinearGradient>
          </Card>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatTile label="Notes" value="128" icon="??" />
            <StatTile label="Taches" value="46" icon="?" />
            <StatTile label="Streak" value="9j" icon="??" />
          </View>

          <Card variant="outlined">
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <AppText variant="h3">Ecole</AppText>
                <AppText muted variant="caption" style={{ marginTop: 4 }}>
                  {school?.name ?? "Non relie a une ecole"}
                </AppText>
                <AppText muted variant="micro" style={{ marginTop: 2 }}>
                  {school?.code ? `Code: ${school.code}` : "Ajoute ton code etablissement"}
                </AppText>
              </View>
              <SecondaryButton onPress={() => router.push("/(modals)/link-school")}>{school ? "Changer" : "Ajouter"}</SecondaryButton>
            </View>
          </Card>

          <PressableScale onPress={() => router.push("/progress")}>
            <Card variant="outlined">
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <AppText variant="h3">Progression</AppText>
                  <AppText muted variant="caption" style={{ marginTop: 4 }}>
                    Streak, XP, missions du jour et badges
                  </AppText>
                </View>
                <SecondaryButton>Ouvrir</SecondaryButton>
              </View>
            </Card>
          </PressableScale>

          <Card variant="default">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <AppText variant="h3">Badges</AppText>
              <SecondaryButton>Tous</SecondaryButton>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {badges.map((b) => (
                <Card key={b} variant="outlined" style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                  <AppText variant="caption">{b}</AppText>
                </Card>
              ))}
            </View>
          </Card>

          <Card variant="default">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <AppText variant="h3">Professeurs suivis</AppText>
              <SecondaryButton onPress={() => router.push("/(modals)/prof-follow")}>Ajouter</SecondaryButton>
            </View>
            <View style={{ gap: 8, marginTop: 10 }}>
              {profs.length === 0 ? (
                <AppText muted>Aucun professeur suivi.</AppText>
              ) : (
                profs.map((prof) => (
                  <PressableScale key={`${prof.handle}-${prof.name}`}>
                    <Card variant="outlined" style={{ paddingVertical: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <EditableAvatar name={prof.name} size={44} onEdit={() => {}} />
                        <View>
                          <AppText>{prof.name}</AppText>
                          <AppText muted variant="caption">{prof.handle}</AppText>
                        </View>
                      </View>
                    </Card>
                  </PressableScale>
                ))
              )}
            </View>
          </Card>

          <Animated.View
            style={{ transform: [{ scale: editScale }] }}
          >
            <PressableScale
              onPress={() => {
                Animated.sequence([
                  Animated.timing(editScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
                  Animated.spring(editScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 7 }),
                ]).start(() => router.push("/(modals)/edit-profile"));
              }}
            >
              <Card variant="outlined" style={{ alignItems: "center" }}>
                <AppText variant="caption">Modifier mon profil ?</AppText>
              </Card>
            </PressableScale>
          </Animated.View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </Screen>
  );
}
