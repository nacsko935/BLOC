import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppButton } from "../../src/core/ui/AppButton";
import { listShopModules, purchaseModule, ShopModule } from "../../lib/services/shopService";

type Mode = "all" | "free" | "premium" | "owned";

const MODE_LABELS: Array<{ key: Mode; label: string }> = [
  { key: "all", label: "Tout" },
  { key: "free", label: "Gratuit" },
  { key: "premium", label: "Premium" },
  { key: "owned", label: "Mes achats" },
];

function euro(cents: number) {
  return `${(Math.max(0, cents) / 100).toFixed(2)}€`;
}

export default function LearningShopScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<ShopModule[]>([]);
  const [featureUnavailable, setFeatureUnavailable] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await listShopModules({ query, mode });
      setItems(res.items);
      setFeatureUnavailable(res.featureUnavailable);
    } catch (error: any) {
      Alert.alert("Boutique", error?.message || "Impossible de charger la boutique.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, query]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const onBuy = async (module: ShopModule) => {
    if (buyingId) return;
    setBuyingId(module.id);
    try {
      await purchaseModule(module.id, module.priceCents);
      Alert.alert("Achat confirmé", "Le module a été ajouté à tes achats.");
      await load(true);
    } catch (error: any) {
      Alert.alert("Paiement", error?.message || "Achat impossible pour le moment.");
    } finally {
      setBuyingId(null);
    }
  };

  const headerSubtitle = useMemo(() => {
    if (featureUnavailable) return "Mode dégradé actif (tables boutique non déployées)";
    return "Achète des modules certifiés et garde tes accès";
  }, [featureUnavailable]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={18} color="#FFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Boutique</Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#9FA3AE" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => load(true)}
          placeholder="Rechercher un module..."
          placeholderTextColor="#7E838F"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        horizontal
        data={MODE_LABELS}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = item.key === mode;
          return (
            <Pressable
              onPress={() => setMode(item.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7B6CFF" />
          <Text style={styles.hint}>Chargement de la boutique...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 120, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#7B6CFF" />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="bag-outline" size={26} color="#A7AEB9" />
              <Text style={styles.emptyTitle}>Aucun module</Text>
              <Text style={styles.emptyText}>Change de filtre ou de recherche.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const premium = item.isPaid;
            const owned = item.isOwned || !premium;
            const buying = buyingId === item.id;
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{item.authorName}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.meta}>{Math.max(5, item.durationMinutes)} min</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.meta}>★ {item.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <View style={[styles.pricePill, premium ? styles.pricePillPremium : styles.pricePillFree]}>
                    <Text style={styles.pricePillText}>{premium ? euro(item.priceCents) : "Gratuit"}</Text>
                  </View>

                  {owned ? (
                    <AppButton
                      variant="secondary"
                      style={{ minHeight: 36, borderRadius: 12, paddingHorizontal: 10 }}
                      onPress={() => router.push({ pathname: "/(learning)/module/[id]", params: { id: item.id } })}
                    >
                      Ouvrir
                    </AppButton>
                  ) : (
                    <AppButton
                      loading={buying}
                      style={{ minHeight: 36, borderRadius: 12, paddingHorizontal: 10 }}
                      onPress={() => onBuy(item)}
                    >
                      Acheter
                    </AppButton>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000", paddingTop: 58 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, marginBottom: 10 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#24262B",
    backgroundColor: "#121316",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#FFF", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#8D93A0", fontSize: 12, marginTop: 2 },
  searchWrap: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#25282F",
    backgroundColor: "#121316",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 14 },
  filters: { paddingHorizontal: 14, gap: 8, marginBottom: 10 },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A2D35",
    backgroundColor: "#121316",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: { borderColor: "#7B6CFF", backgroundColor: "rgba(123,108,255,0.17)" },
  filterText: { color: "#9EA3AE", fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: "#E7E2FF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  hint: { color: "#8D93A0", fontSize: 12 },
  emptyCard: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#242830",
    backgroundColor: "#101216",
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  emptyTitle: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  emptyText: { color: "#8D93A0", fontSize: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#242830",
    backgroundColor: "#101216",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  cardSubtitle: { color: "#9BA1AE", fontSize: 12, marginTop: 3 },
  metaRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { color: "#9BA1AE", fontSize: 11, fontWeight: "600" },
  dot: { color: "#5C626F" },
  pricePill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  pricePillPremium: { backgroundColor: "rgba(230,69,88,0.16)", borderColor: "rgba(230,69,88,0.4)" },
  pricePillFree: { backgroundColor: "rgba(46,213,115,0.16)", borderColor: "rgba(46,213,115,0.4)" },
  pricePillText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
});

