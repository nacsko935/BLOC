import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/core/theme/ThemeProvider";
import { createCourse } from "../../src/features/courses/coursesRepo";

const SEMESTERS = ["S1", "S2"] as const;
const ICONS     = ["📚","💻","🌐","🗄️","🧮","🌍","🤖","🎨","📊","🔬","⚡","🎯"];
const COLORS    = [
  "#3D8FFF","#F5A623","#B164FF","#34C759",
  "#FF3B30","#FF2D55","#5856D6","#00C7BE",
  "#FFCC00","#FF9500","#AF52DE","#32ADE6",
];

export default function CourseNewModal() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { c }   = useTheme();

  const [name,      setName]      = useState("");
  const [profName,  setProfName]  = useState("");
  const [profHandle,setProfHandle]= useState("");
  const [semester,  setSemester]  = useState<"S1"|"S2">("S1");
  const [icon,      setIcon]      = useState(ICONS[0]);
  const [color,     setColor]     = useState(COLORS[0]);

  const canSave = name.trim() && profName.trim() && profHandle.trim();

  const handleSave = async () => {
    try {
      await createCourse({ name, semester, professorName: profName, professorHandle: profHandle, color, icon });
      router.back();
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de créer le cours.");
    }
  };

  const input = {
    backgroundColor: c.cardAlt, borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 13, color: c.textPrimary, borderWidth: 1,
    borderColor: c.border, fontSize: 15,
  };

  const label = { color: c.textSecondary, fontSize: 13, fontWeight: "600" as const, marginBottom: 8 };
  const section = { gap: 8 as const };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* ── Header ── */}
      <View style={{
        paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: c.border,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }}>
        <Pressable onPress={() => router.back()}
          style={({ pressed }) => [{ padding: 8, borderRadius: 10,
            backgroundColor: c.cardAlt }, pressed && { opacity: 0.7 }]}>
          <Text style={{ color: c.textSecondary, fontWeight: "600", fontSize: 15 }}>Annuler</Text>
        </Pressable>
        <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "800" }}>Nouveau cours</Text>
        <Pressable onPress={handleSave} disabled={!canSave}
          style={({ pressed }) => [{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
            backgroundColor: canSave ? c.accentPurple : c.cardAlt }, pressed && { opacity: 0.8 }]}>
          <Text style={{ color: canSave ? "#fff" : c.textSecondary, fontWeight: "800", fontSize: 15 }}>Créer</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 24 }}>

        {/* Nom */}
        <View style={section}>
          <Text style={label}>Nom du cours</Text>
          <TextInput value={name} onChangeText={setName} autoFocus
            placeholder="Ex : Réseaux & Protocoles"
            placeholderTextColor={c.textSecondary} style={input} />
        </View>

        {/* Semestre */}
        <View style={section}>
          <Text style={label}>Semestre</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {SEMESTERS.map(s => (
              <Pressable key={s} onPress={() => setSemester(s)}
                style={{ flex: 1, height: 44, borderRadius: 12, alignItems: "center",
                  justifyContent: "center", borderWidth: 1.5,
                  borderColor: semester === s ? color : c.border,
                  backgroundColor: semester === s ? color + "22" : c.cardAlt }}>
                <Text style={{ color: semester === s ? color : c.textSecondary,
                  fontWeight: "700", fontSize: 15 }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Icône */}
        <View style={section}>
          <Text style={label}>Icône</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {ICONS.map(ic => (
              <Pressable key={ic} onPress={() => setIcon(ic)}
                style={{ width: 52, height: 52, borderRadius: 14, alignItems: "center",
                  justifyContent: "center", borderWidth: 2,
                  borderColor: icon === ic ? color : c.border,
                  backgroundColor: icon === ic ? color + "22" : c.cardAlt }}>
                <Text style={{ fontSize: 26 }}>{ic}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Couleur */}
        <View style={section}>
          <Text style={label}>Couleur accent</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {COLORS.map(col => (
              <Pressable key={col} onPress={() => setColor(col)}
                style={{ width: 44, height: 44, borderRadius: 22,
                  backgroundColor: col, alignItems: "center", justifyContent: "center",
                  borderWidth: 3, borderColor: color === col ? "#fff" : "transparent" }}>
                {color === col && <Ionicons name="checkmark" size={20} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Professeur */}
        <View style={section}>
          <Text style={label}>Professeur</Text>
          <TextInput value={profName} onChangeText={setProfName}
            placeholder="Nom complet"
            placeholderTextColor={c.textSecondary} style={input} />
          <TextInput value={profHandle} onChangeText={setProfHandle}
            placeholder="@pseudo"
            placeholderTextColor={c.textSecondary} style={[input, { marginTop: 10 }]}
            autoCapitalize="none" />
        </View>

        {/* Aperçu */}
        <View style={section}>
          <Text style={label}>Aperçu</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 20, padding: 16,
            borderWidth: 1, borderColor: c.border, borderLeftWidth: 4, borderLeftColor: color }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 52, height: 52, borderRadius: 14,
                backgroundColor: color + "22", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 26 }}>{icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textPrimary, fontWeight: "800", fontSize: 16 }}>
                  {name || "Nom du cours"}
                </Text>
                <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 2 }}>
                  {profName || "Professeur"} · {semester}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
                backgroundColor: color + "22", borderWidth: 1, borderColor: color }}>
                <Text style={{ color: color, fontWeight: "700", fontSize: 12 }}>{semester}</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
