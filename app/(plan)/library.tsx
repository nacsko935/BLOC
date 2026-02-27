import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "../../src/core/ui/AppButton";
import { BottomSheetCreate } from "../../src/features/plan/components/BottomSheetCreate";
import { CollapsibleShortcutsCard } from "../../src/features/plan/components/CollapsibleShortcutsCard";
import { FilterDropdown, LibraryQuickFilter } from "../../src/features/plan/components/FilterDropdown";
import { LibraryRow } from "../../src/features/plan/components/LibraryRow";
import { PrimaryPillButton } from "../../src/features/plan/components/PrimaryPillButton";
import { ScreenHeader } from "../../src/features/plan/components/ScreenHeader";
import { LibraryTabKey, TabsRow } from "../../src/features/plan/components/TabsRow";
import { LibraryItem } from "../../src/features/plan/types";
import { usePlanStore } from "../../state/usePlanStore";

type ViewMode = "list" | "grid";
type SortMode = "recent" | "alpha";

function tabMatcher(tab: LibraryTabKey, item: LibraryItem) {
  if (tab === "projects") return item.type === "project";
  if (tab === "files") return ["pdf", "note", "folder", "summary"].includes(item.type);
  if (tab === "flashcards") return item.type === "flashcards";
  if (tab === "quiz") return item.type === "quiz";
  return item.type === "group";
}

function quickFilterMatcher(filter: LibraryQuickFilter, item: LibraryItem) {
  if (filter === "all") return true;
  if (filter === "recent") return true;
  if (filter === "favorites") return item.isPinned === true;
  if (filter === "shared") return item.type === "group" || Boolean(item.projectId);
  return item.isLocked === true;
}

function formatDate(dateIso: string | undefined) {
  if (!dateIso) return "";
  return new Date(dateIso).toLocaleDateString("fr-FR");
}

export default function PlanLibraryScreen() {
  const router = useRouter();
  const { initialized, loadAll, libraryItems } = usePlanStore();

  const [activeTab, setActiveTab] = useState<LibraryTabKey>("projects");
  const [quickFilter, setQuickFilter] = useState<LibraryQuickFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [createSheetVisible, setCreateSheetVisible] = useState(false);

  useEffect(() => {
    if (!initialized) loadAll().catch(() => null);
  }, [initialized, loadAll]);

  const data = useMemo(() => {
    let items = [...libraryItems];

    items = items.filter((item) => tabMatcher(activeTab, item));
    items = items.filter((item) => quickFilterMatcher(quickFilter, item));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle ?? "").toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
      );
    }

    if (sortMode === "alpha") {
      items.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    } else {
      items.sort((a, b) => +new Date(b.updatedAt ?? b.createdAt) - +new Date(a.updatedAt ?? a.createdAt));
    }

    return items;
  }, [libraryItems, activeTab, quickFilter, query, sortMode]);

  const openItemMenu = (item: LibraryItem) => {
    Alert.alert(item.title, "Actions", [
      { text: "Renommer", onPress: () => Alert.alert("Renommer", "Action disponible bientôt.") },
      { text: "Partager", onPress: () => Alert.alert("Partager", "Action disponible bientôt.") },
      { text: "Déplacer", onPress: () => Alert.alert("Déplacer", "Action disponible bientôt.") },
      { text: "Supprimer", style: "destructive", onPress: () => Alert.alert("Supprimer", "Action disponible bientôt.") },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const renderGridCard = (item: LibraryItem) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [styles.gridCard, pressed && styles.gridCardPressed]}
      onPress={() => Alert.alert(item.title, "Ouverture du détail (placeholder).")}
      onLongPress={() => openItemMenu(item)}
    >
      <View style={styles.gridThumb}>
        <Ionicons name="folder-open-outline" size={20} color="#E4E8EE" />
      </View>
      <Text style={styles.gridTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.gridSubtitle} numberOfLines={1}>
        {item.subject} • {formatDate(item.updatedAt ?? item.createdAt)}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title="Bibliothèque"
          onSearch={() => setSearchOpen((v) => !v)}
          onSort={() =>
            Alert.alert("Tri", "Choisis un mode", [
              { text: "Récents", onPress: () => setSortMode("recent") },
              { text: "A-Z", onPress: () => setSortMode("alpha") },
              { text: "Annuler", style: "cancel" },
            ])
          }
          onToggleView={() => setViewMode((v) => (v === "list" ? "grid" : "list"))}
          premiumLabel="Get"
        />

        {searchOpen ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un projet ou une ressource"
            placeholderTextColor="#7F8794"
            value={query}
            onChangeText={setQuery}
          />
        ) : null}

        <TabsRow value={activeTab} onChange={setActiveTab} />
      </View>

      <View style={styles.actionsBar}>
        <FilterDropdown
          value={quickFilter}
          visible={filterMenuVisible}
          onOpen={() => setFilterMenuVisible(true)}
          onClose={() => setFilterMenuVisible(false)}
          onChange={setQuickFilter}
        />
        <PrimaryPillButton label="+ Nouveau" onPress={() => setCreateSheetVisible(true)} />
      </View>

      <View style={styles.shortcutsWrap}>
        <CollapsibleShortcutsCard
          shortcuts={[
            { id: "my-projects", label: "Mes projets", onPress: () => setActiveTab("projects") },
            { id: "collabs", label: "Collaborations", onPress: () => Alert.alert("Collaborations", "Section à venir.") },
            { id: "groups", label: "Projets de groupes", onPress: () => setActiveTab("groups") },
            { id: "trash", label: "Supprimés", onPress: () => setQuickFilter("archived") },
          ]}
        />
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun élément ici pour le moment</Text>
          <Text style={styles.emptyText}>Crée un projet ou importe un document pour démarrer.</Text>
          <AppButton style={styles.emptyBtn} onPress={() => setCreateSheetVisible(true)}>
            + Nouveau
          </AppButton>
        </View>
      ) : viewMode === "list" ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {data.map((item) => (
            <LibraryRow
              key={item.id}
              item={item}
              onPress={() => Alert.alert(item.title, "Ouverture du détail (placeholder).")}
              onOpenMenu={() => openItemMenu(item)}
              onLongPress={() => openItemMenu(item)}
            />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => renderGridCard(item)}
        />
      )}

      <BottomSheetCreate
        visible={createSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
        onCreateProject={() => router.push({ pathname: "/(plan)/projects", params: { create: "1" } })}
        onImportPdf={() => Alert.alert("Importer PDF", "Ouverture import PDF (placeholder).")}
        onImportNotes={() => Alert.alert("Importer Notes", "Ouverture import notes (placeholder).")}
        onCreateFolder={() => Alert.alert("Créer dossier", "Création de dossier (placeholder).")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000000" },
  headerWrap: { paddingTop: 58, paddingHorizontal: 14, gap: 10 },
  searchInput: {
    backgroundColor: "#121418",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#272B31",
    color: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionsBar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shortcutsWrap: { paddingHorizontal: 14, paddingTop: 10 },
  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 24, gap: 8 },
  gridContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 24 },
  gridRow: { gap: 10 },
  gridCard: {
    flex: 1,
    backgroundColor: "#101215",
    borderWidth: 1,
    borderColor: "#25282D",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  gridCardPressed: { opacity: 0.92 },
  gridThumb: {
    height: 72,
    borderRadius: 12,
    backgroundColor: "#1C1F24",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  gridSubtitle: { color: "#97A0AE", marginTop: 4, fontSize: 11 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", textAlign: "center" },
  emptyText: { color: "#9AA2AF", marginTop: 8, textAlign: "center", lineHeight: 18 },
  emptyBtn: { marginTop: 14, backgroundColor: "#5B4CFF", minWidth: 140 },
});
