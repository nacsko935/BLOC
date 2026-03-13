import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated,
  Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { AppButton } from "../../src/core/ui/AppButton";
import { useAuthStore } from "../../state/useAuthStore";
import {
  Avatar3D,
  Avatar3DConfig,
  ACCESSORY_LABELS,
  BG_COLORS,
  CLOTHING_COLORS,
  CLOTHING_LABELS,
  EYE_COLORS,
  EYE_STYLE_LABELS,
  EYEBROW_LABELS,
  FACIAL_HAIR_LABELS,
  HAIR_COLORS,
  HAIR_STYLE_LABELS,
  MOUTH_LABELS,
  SKIN_TONES,
  createDefaultAvatar3DConfig,
} from "../../src/components/Avatar3D";
import {
  getMyAvatar3DConfig,
  saveMyAvatar3DConfig,
} from "../../lib/services/avatarService";

// ── Category definition ────────────────────────────────────────────────────────

type Cat =
  | "skin" | "hair" | "haircolor"
  | "eyes" | "eyecolor" | "brows"
  | "mouth" | "beard" | "accessory"
  | "clothing" | "clothcolor" | "bg";

const CATS: { key: Cat; emoji: string; label: string }[] = [
  { key: "skin",      emoji: "🧴", label: "Teint"       },
  { key: "hair",      emoji: "💇", label: "Coupe"       },
  { key: "haircolor", emoji: "🎨", label: "Couleur"     },
  { key: "eyes",      emoji: "👁", label: "Yeux"        },
  { key: "eyecolor",  emoji: "💎", label: "Iris"        },
  { key: "brows",     emoji: "🤨", label: "Sourcils"    },
  { key: "mouth",     emoji: "👄", label: "Bouche"      },
  { key: "beard",     emoji: "🧔", label: "Barbe"       },
  { key: "accessory", emoji: "👓", label: "Accessoire"  },
  { key: "clothing",  emoji: "👕", label: "Tenue"       },
  { key: "clothcolor",emoji: "🎽", label: "Couleur"     },
  { key: "bg",        emoji: "🌌", label: "Fond"        },
];

// ── Helper: random avatar ──────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function randomize(base: Avatar3DConfig): Avatar3DConfig {
  return {
    ...base,
    skinColor:     pick(SKIN_TONES),
    hairStyle:     pick(Object.keys(HAIR_STYLE_LABELS) as Avatar3DConfig["hairStyle"][]),
    hairColor:     pick(HAIR_COLORS),
    eyeStyle:      pick(Object.keys(EYE_STYLE_LABELS) as Avatar3DConfig["eyeStyle"][]),
    eyeColor:      pick(EYE_COLORS),
    eyebrowStyle:  pick(Object.keys(EYEBROW_LABELS) as Avatar3DConfig["eyebrowStyle"][]),
    mouthStyle:    pick(Object.keys(MOUTH_LABELS) as Avatar3DConfig["mouthStyle"][]),
    facialHair:    pick(Object.keys(FACIAL_HAIR_LABELS) as Avatar3DConfig["facialHair"][]),
    accessory:     pick(Object.keys(ACCESSORY_LABELS) as Avatar3DConfig["accessory"][]),
    clothingStyle: pick(Object.keys(CLOTHING_LABELS) as Avatar3DConfig["clothingStyle"][]),
    clothingColor: pick(CLOTHING_COLORS),
    bgColor:       pick(BG_COLORS),
  };
}

// ── ColorSwatch ───────────────────────────────────────────────────────────────

function ColorRow({
  colors, selected, onSelect, large,
}: { colors: string[]; selected: string; onSelect: (v: string) => void; large?: boolean }) {
  const size = large ? 52 : 38;
  const r    = size / 2;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 2, paddingVertical: 6 }}>
      {colors.map(hex => {
        const active = selected === hex;
        const textColor = parseInt(hex.replace("#", ""), 16) > 0x888888 ? "#000" : "#fff";
        return (
          <Pressable key={hex} onPress={() => onSelect(hex)}
            style={[{
              width: size, height: size, borderRadius: r,
              backgroundColor: hex, alignItems: "center", justifyContent: "center",
              borderWidth: active ? 3 : 1.5,
              borderColor: active ? "#7B6CFF" : "rgba(255,255,255,0.12)",
            }]}>
            {active && <Ionicons name="checkmark" size={large ? 18 : 14} color={textColor} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── StyleChips ────────────────────────────────────────────────────────────────

function StyleChips<T extends string>({
  labels, selected, onSelect,
}: { labels: Record<T, string>; selected: T; onSelect: (v: T) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {(Object.entries(labels) as [T, string][]).map(([val, label]) => {
        const active = selected === val;
        return (
          <Pressable key={val} onPress={() => onSelect(val)}
            style={[st.chip, active && st.chipActive]}>
            <Text style={[st.chipTxt, active && st.chipTxtActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AvatarBuilderModal() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { c }    = useTheme();
  const profile  = useAuthStore(s => s.profile);

  const [cat,     setCat]    = useState<Cat>("skin");
  const [config,  setConfig] = useState<Avatar3DConfig | null>(null);
  const [loading, setLoading]= useState(true);
  const [saving,  setSaving] = useState(false);

  const pulseA = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let alive = true;
    getMyAvatar3DConfig(profile)
      .then(cfg => { if (alive) { setConfig(cfg); setLoading(false); } })
      .catch(() => { if (alive) { setConfig(createDefaultAvatar3DConfig()); setLoading(false); } });
    return () => { alive = false; };
  }, [profile]);

  // Pulse the preview on every config change
  useEffect(() => {
    if (!config) return;
    Animated.sequence([
      Animated.timing(pulseA, { toValue: 0.9, duration: 70, useNativeDriver: true }),
      Animated.spring(pulseA, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [config]);

  const set = (patch: Partial<Avatar3DConfig>) =>
    setConfig(p => p ? { ...p, ...patch } : p);

  const handleSave = async () => {
    if (!config || saving) return;
    setSaving(true);
    try {
      const next = await saveMyAvatar3DConfig(config);
      useAuthStore.setState(s => ({ ...s, profile: next ?? s.profile }));
      Alert.alert("Avatar mis à jour", "Ton avatar 3D est maintenant actif !");
      router.back();
    } catch (err: any) {
      Alert.alert("Erreur", err?.message ?? "Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ActivityIndicator size="large" color="#7B6CFF" />
        <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: "600" }}>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>

      {/* ── Header ── */}
      <LinearGradient colors={["#1A0A3B", "#0A0A1A"]}
        style={{ paddingTop: insets.top + 10, paddingBottom: 14, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} style={st.iconBtn}>
            <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.3 }}>
              Mon avatar 3D
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 1 }}>
              Personnalise ton style
            </Text>
          </View>
          <Pressable onPress={() => setConfig(randomize(config))}
            style={[st.iconBtn, { backgroundColor: "rgba(123,108,255,0.22)", borderColor: "rgba(123,108,255,0.5)" }]}>
            <Text style={{ fontSize: 18 }}>🎲</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

        {/* ── 3D Preview ── */}
        <LinearGradient colors={[config.bgColor + "EE", config.bgColor + "55"]}
          style={st.previewCard}>
          {/* Glow ring */}
          <View style={[st.glowRing, { borderColor: "rgba(123,108,255,0.45)", shadowColor: "#7B6CFF" }]}>
            <Animated.View style={{ transform: [{ scale: pulseA }] }}>
              <Avatar3D config={config} size={210} variant="full" />
            </Animated.View>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "600", marginTop: 6 }}>
            Aperçu en temps réel · 🎲 look aléatoire
          </Text>
        </LinearGradient>

        {/* ── Category tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}>
          {CATS.map(({ key, emoji, label }) => {
            const active = cat === key;
            return (
              <Pressable key={key} onPress={() => setCat(key)}
                style={[st.catChip, {
                  borderColor: active ? "#7B6CFF" : c.border,
                  backgroundColor: active ? "rgba(123,108,255,0.22)" : c.card,
                }]}>
                <Text style={{ fontSize: 15 }}>{emoji}</Text>
                <Text style={{ color: active ? "#CFC8FF" : c.textSecondary, fontWeight: "700", fontSize: 11 }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Options panel ── */}
        <View style={[st.panel, { borderColor: c.border, backgroundColor: c.card }]}>

          {cat === "skin" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Couleur de peau</Text>
              <ColorRow colors={SKIN_TONES} selected={config.skinColor} large
                onSelect={v => set({ skinColor: v })} />
            </>
          )}

          {cat === "hair" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Style de coupe</Text>
              <StyleChips labels={HAIR_STYLE_LABELS} selected={config.hairStyle}
                onSelect={v => set({ hairStyle: v })} />
            </>
          )}

          {cat === "haircolor" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Couleur des cheveux</Text>
              <ColorRow colors={HAIR_COLORS} selected={config.hairColor}
                onSelect={v => set({ hairColor: v })} />
            </>
          )}

          {cat === "eyes" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Forme des yeux</Text>
              <StyleChips labels={EYE_STYLE_LABELS} selected={config.eyeStyle}
                onSelect={v => set({ eyeStyle: v })} />
            </>
          )}

          {cat === "eyecolor" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Couleur des iris</Text>
              <ColorRow colors={EYE_COLORS} selected={config.eyeColor}
                onSelect={v => set({ eyeColor: v })} />
            </>
          )}

          {cat === "brows" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Style des sourcils</Text>
              <StyleChips labels={EYEBROW_LABELS} selected={config.eyebrowStyle}
                onSelect={v => set({ eyebrowStyle: v })} />
            </>
          )}

          {cat === "mouth" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Expression</Text>
              <StyleChips labels={MOUTH_LABELS} selected={config.mouthStyle}
                onSelect={v => set({ mouthStyle: v })} />
            </>
          )}

          {cat === "beard" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Pilosité faciale</Text>
              <StyleChips labels={FACIAL_HAIR_LABELS} selected={config.facialHair}
                onSelect={v => set({ facialHair: v })} />
            </>
          )}

          {cat === "accessory" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Accessoire</Text>
              <StyleChips labels={ACCESSORY_LABELS} selected={config.accessory}
                onSelect={v => set({ accessory: v })} />
            </>
          )}

          {cat === "clothing" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Style vestimentaire</Text>
              <StyleChips labels={CLOTHING_LABELS} selected={config.clothingStyle}
                onSelect={v => set({ clothingStyle: v })} />
            </>
          )}

          {cat === "clothcolor" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Couleur de la tenue</Text>
              <ColorRow colors={CLOTHING_COLORS} selected={config.clothingColor}
                onSelect={v => set({ clothingColor: v })} />
            </>
          )}

          {cat === "bg" && (
            <>
              <Text style={[st.sectionLabel, { color: c.textSecondary }]}>Fond de l'avatar</Text>
              <ColorRow colors={BG_COLORS} selected={config.bgColor}
                onSelect={v => set({ bgColor: v })} />
            </>
          )}
        </View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[st.footer, { borderTopColor: c.border, backgroundColor: c.background }]}>
        <AppButton loading={saving} onPress={handleSave} style={{ width: "100%", minHeight: 50 }}>
          Enregistrer mon avatar 3D
        </AppButton>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  previewCard: {
    marginHorizontal: 16, marginTop: 14, borderRadius: 28,
    alignItems: "center", paddingVertical: 28, paddingBottom: 18, gap: 4,
    overflow: "hidden",
  },
  glowRing: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(123,108,255,0.1)",
    borderWidth: 2, alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 24, elevation: 12,
    overflow: "hidden",
  },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 11, paddingVertical: 7,
  },
  panel: {
    marginHorizontal: 16, borderRadius: 20, borderWidth: 1,
    padding: 18, marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", textTransform: "uppercase",
    letterSpacing: 0.7, marginBottom: 12,
  },
  chip: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 13, paddingVertical: 10,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  chipActive: {
    borderColor: "#7B6CFF",
    backgroundColor: "rgba(123,108,255,0.22)",
  },
  chipTxt:       { color: "rgba(255,255,255,0.5)", fontWeight: "600", fontSize: 13 },
  chipTxtActive: { color: "#E9E4FF", fontWeight: "700" },
  footer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1,
  },
});
