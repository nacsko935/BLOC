import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../state/useAuthStore";
import { AppButton } from "../../src/core/ui/AppButton";
import { FloatingActionButton } from "../../src/features/learning/components/FloatingActionButton";
import { ModuleCardLarge } from "../../src/features/learning/components/ModuleCardLarge";
import { ModuleCardSmall } from "../../src/features/learning/components/ModuleCardSmall";
import { ModuleRow } from "../../src/features/learning/components/ModuleRow";
import { PillButton } from "../../src/features/learning/components/PillButton";
import { ProgressBar } from "../../src/features/learning/components/ProgressBar";
import { SectionContainer } from "../../src/features/learning/components/SectionContainer";
import { ToolIcon } from "../../src/features/learning/components/ToolIcon";
import {
  getBadges,
  getLearningUser,
  getMyProgress,
  listCollections,
  listModules,
  listToolPresets,
} from "../../src/features/learning/services";
import { Badge, Collection, Module, Progress, ToolPreset, User } from "../../src/features/learning/types";

function profileRole(profile: Record<string, unknown> | null): User["role"] {
  if (!profile) return "standard";
  if (profile.role === "certified" || profile.account_type === "certified" || profile.is_certified === true) return "certified";
  return "standard";
}

export default function LearningHomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile) as Record<string, unknown> | null;
  const role = profileRole(profile);

  const [fabOpen, setFabOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [progressRows, setProgressRows] = useState<Progress[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [popular, setPopular] = useState<Module[]>([]);
  const [newest, setNewest] = useState<Module[]>([]);
  const [toolPresets, setToolPresets] = useState<ToolPreset[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    getLearningUser().then(setUser).catch(() => setUser(null));
    getMyProgress().then(setProgressRows).catch(() => setProgressRows([]));
    listCollections().then(setCollections).catch(() => setCollections([]));
    listModules({ popular: true }).then((rows) => setPopular(rows.slice(0, 8))).catch(() => setPopular([]));
    listModules({ newest: true }).then((rows) => setNewest(rows.slice(0, 6))).catch(() => setNewest([]));
    listToolPresets().then(setToolPresets).catch(() => setToolPresets([]));
    getBadges().then(setBadges).catch(() => setBadges([]));
  }, []);

  const progressMap = useMemo(() => new Map(progressRows.map((p) => [p.moduleId, p])), [progressRows]);
  const continueModules = useMemo(
    () =>
      newest
        .concat(popular)
        .filter((m, index, arr) => arr.findIndex((x) => x.id === m.id) === index)
        .filter((m) => progressMap.get(m.id)?.status === "in_progress")
        .slice(0, 3),
    [newest, popular, progressMap]
  );
  const teaserBadges = badges.filter((b) => !b.unlocked).slice(0, 3);

  const fabActions = [
    { id: "search", label: "Rechercher", onPress: () => router.push("/(learning)/catalog") },
    { id: "filters", label: "Filtres", onPress: () => router.push("/(learning)/catalog") },
    { id: "favorites", label: "Mes favoris", onPress: () => Alert.alert("Favoris", "Section favoris bientot disponible.") },
    {
      id: "publish",
      label: role === "certified" ? "Publier un module" : "Devenir certifie",
      onPress: () => router.push("/(learning)/creator"),
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Apprentissage</Text>
            <Text style={styles.subtitle}>Continue ta progression ou lance un module</Text>
          </View>
          <PillButton label={`Niveau ${user?.level ?? 1}`} tone="dark" onPress={() => router.push("/(learning)/badges")} />
        </View>

        <View style={styles.topCtas}>
          <Pressable style={({ pressed }) => [styles.topCtaPrimary, pressed && styles.topCtaPressed]} onPress={() => router.push("/create")}>
            <View>
              <Text style={styles.topCtaTitle}>Creer avec l'IA</Text>
              <Text style={styles.topCtaSubtitle}>Flashcards, quiz, resumes, plans</Text>
            </View>
            <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.topCtaSecondary, pressed && styles.topCtaPressed]}
            onPress={() => router.push("/(learning)/catalog")}
          >
            <View>
              <Text style={styles.topCtaTitle}>Explorer le catalogue</Text>
              <Text style={styles.topCtaSubtitle}>Modules certifies et parcours</Text>
            </View>
            <Ionicons name="search-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <SectionContainer>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continuer</Text>
            <Pressable onPress={() => router.push("/(learning)/catalog")}>
              <Text style={styles.linkText}>Tout voir</Text>
            </Pressable>
          </View>
          {continueModules.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>Aucun module en cours</Text>
              <Text style={styles.emptySubtitle}>Commence un module pour le reprendre ici en 1 tap.</Text>
              <AppButton style={styles.redBtn} onPress={() => router.push("/(learning)/catalog")}>
                Explorer
              </AppButton>
            </View>
          ) : (
            continueModules.map((module) => {
              const progress = progressMap.get(module.id);
              return (
                <View key={module.id} style={{ marginBottom: 10 }}>
                  <ModuleRow
                    module={module}
                    rightLabel="Reprendre"
                    progress={progress?.percent ?? 0}
                    onPress={() => router.push({ pathname: "/(learning)/player/[moduleId]", params: { moduleId: module.id } })}
                    subtitleOverride={`${module.subtitle} • ${Math.max(1, Math.round(module.durationMinutes / 60))}h`}
                  />
                </View>
              );
            })
          )}
        </SectionContainer>

        <SectionContainer>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Outils IA</Text>
            <PillButton label="AI" tone="accent" />
          </View>
          <View style={styles.toolsGrid}>
            {toolPresets.map((tool) => (
              <ToolIcon
                key={tool.id}
                tool={tool}
                onPress={() => {
                  if (tool.route) router.push(tool.route as never);
                  else Alert.alert("Outil", "Cet outil arrive bientot.");
                }}
              />
            ))}
          </View>
          <AppButton style={styles.redBtn} onPress={() => router.push("/create")}>
            Lancer IA
          </AppButton>
        </SectionContainer>

        <SectionContainer>
          <Text style={styles.sectionTitle}>Collections</Text>
          <FlatList
            horizontal
            data={collections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ModuleCardLarge item={item} onPress={() => router.push("/(learning)/catalog")} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 10 }}
          />
        </SectionContainer>

        <SectionContainer>
          <Text style={styles.sectionTitle}>Modules populaires</Text>
          <FlatList
            horizontal
            data={popular}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ModuleCardSmall module={item} onPress={() => router.push({ pathname: "/(learning)/module/[id]", params: { id: item.id } })} />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 10 }}
          />
        </SectionContainer>

        <SectionContainer>
          <Text style={styles.sectionTitle}>Nouveaux modules</Text>
          <View style={{ marginTop: 10, gap: 10 }}>
            {newest.map((module) => (
              <ModuleRow
                key={module.id}
                module={module}
                onPress={() => router.push({ pathname: "/(learning)/module/[id]", params: { id: module.id } })}
              />
            ))}
          </View>
        </SectionContainer>

        <View style={styles.whiteCtaWrap}>
          <Pressable style={({ pressed }) => [styles.whiteCta, pressed && { opacity: 0.92 }]} onPress={() => router.push("/(learning)/catalog")}>
            <Text style={styles.whiteCtaText}>Explorer le catalogue BLOC</Text>
          </Pressable>
          <Pressable style={styles.certifiedLink} onPress={() => router.push({ pathname: "/(learning)/catalog", params: { certified: "true" } })}>
            <Ionicons name="checkmark-circle-outline" size={15} color="#BFC6D0" />
            <Text style={styles.linkText}>Consulter les modules certifies</Text>
          </Pressable>
        </View>

        <SectionContainer>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges a debloquer</Text>
            <Pressable onPress={() => router.push("/(learning)/badges")}>
              <Text style={styles.linkText}>Voir mes badges</Text>
            </Pressable>
          </View>
          <View style={{ marginTop: 10, gap: 10 }}>
            {teaserBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeRow}>
                <View style={styles.badgeIcon}>
                  <Ionicons name={(badge.icon as keyof typeof Ionicons.glyphMap) ?? "ribbon-outline"} size={17} color="#E8E8E8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.badgeTitle}>{badge.name}</Text>
                  <Text style={styles.badgeText}>{badge.description ?? "Badge a debloquer"}</Text>
                </View>
                <PillButton label="Verrouille" tone="dark" />
              </View>
            ))}
          </View>
        </SectionContainer>

        <SectionContainer>
          <Text style={styles.sectionTitle}>{role === "certified" ? "Espace createur" : "Devenir certifie"}</Text>
          <Text style={styles.creatorText}>
            {role === "certified"
              ? "Publie tes modules, suis tes ventes et gere tes revenus."
              : "Valide ton profil pour publier des modules certifies."}
          </Text>
          {role === "certified" ? (
            <>
              <View style={styles.creatorStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Modules</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>4.8</Text>
                  <Text style={styles.statLabel}>Note moyenne</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <AppButton style={[styles.redBtn, { flex: 1 }]} onPress={() => router.push("/(learning)/creator/create")}>
                  Creer un module
                </AppButton>
                <AppButton variant="secondary" style={{ flex: 1 }} onPress={() => router.push("/(learning)/creator/modules")}>
                  Mes modules
                </AppButton>
              </View>
            </>
          ) : (
            <AppButton style={[styles.redBtn, { marginTop: 12 }]} onPress={() => router.push("/(learning)/creator")}>
              Decouvrir
            </AppButton>
          )}
        </SectionContainer>

        <SectionContainer style={{ marginBottom: 80 }}>
          <Text style={styles.sectionTitle}>Passe en Premium</Text>
          <Text style={styles.creatorText}>Debloque les parcours avances, templates IA et progression illimitee.</Text>
          <AppButton style={[styles.redBtn, { marginTop: 12 }]} onPress={() => Alert.alert("Premium", "Essai gratuit bientot disponible.")}>
            Essayer gratuitement
          </AppButton>
        </SectionContainer>
      </ScrollView>

      <FloatingActionButton visible={fabOpen} onOpen={() => setFabOpen(true)} onClose={() => setFabOpen(false)} actions={fabActions} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 58, paddingHorizontal: 14, paddingBottom: 24, gap: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#FFFFFF", fontWeight: "900", fontSize: 36 },
  subtitle: { color: "#9A9DA5", marginTop: 3, fontSize: 14 },
  topCtas: { gap: 10 },
  topCtaPrimary: {
    backgroundColor: "#E64558",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF7585",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topCtaSecondary: {
    backgroundColor: "#141518",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#26272C",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topCtaPressed: { opacity: 0.92 },
  topCtaTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  topCtaSubtitle: { color: "#DEE1E6", fontSize: 12, marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 19 },
  linkText: { color: "#B7BEC8", fontSize: 13, fontWeight: "700" },
  emptyBlock: { paddingTop: 8 },
  emptyTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  emptySubtitle: { color: "#989CA3", marginTop: 6, fontSize: 12 },
  redBtn: { backgroundColor: "#E64558" },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 12 },
  whiteCtaWrap: { gap: 8, paddingHorizontal: 2 },
  whiteCta: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  whiteCtaText: { color: "#111214", fontWeight: "800", fontSize: 16 },
  certifiedLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 4 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#141416",
    borderRadius: 14,
    borderColor: "#232429",
    borderWidth: 1,
    padding: 10,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1F2023",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  badgeText: { color: "#969BA3", marginTop: 2, fontSize: 12 },
  creatorText: { color: "#A0A5AE", marginTop: 8, fontSize: 13, lineHeight: 18 },
  creatorStats: { flexDirection: "row", gap: 8, marginTop: 12 },
  statBox: {
    flex: 1,
    backgroundColor: "#151619",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#26272C",
    padding: 10,
  },
  statValue: { color: "#FFFFFF", fontWeight: "900", fontSize: 18 },
  statLabel: { color: "#959AA4", fontSize: 11, marginTop: 2 },
});
