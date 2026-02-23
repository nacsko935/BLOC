import { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { AppText } from "../../src/core/ui/AppText";
import { AppInput } from "../../src/core/ui/AppInput";
import { AppButton } from "../../src/core/ui/AppButton";
import { Pill } from "../../src/core/ui/Pill";
import { saveOnboardingProfile } from "../../src/features/profile/services/onboardingService";

const schools = ["ESGI", "EPITA", "ECE", "ESIEA", "Autre"];
const tracks = ["BTS", "Licence", "Master", "Alternance"];
const goals = ["Reussir les exams", "Mieux s'organiser", "Augmenter ma moyenne", "Trouver un stage"];

export default function OnboardingScreen() {
  const router = useRouter();
  const [school, setSchool] = useState("ESGI");
  const [track, setTrack] = useState("Licence");
  const [level, setLevel] = useState("L3");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([goals[0]]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const submit = async () => {
    await saveOnboardingProfile({ school, track, level, goals: selectedGoals });
    router.replace("/(tabs)/home");
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
        <View>
          <AppText variant="title">Personnalise ton feed</AppText>
          <AppText muted style={{ marginTop: 6 }}>Ecole, filiere et objectifs pour adapter BLOC.</AppText>
        </View>

        <View style={{ gap: 10 }}>
          <AppText variant="caption">Ecole</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {schools.map((s) => (
              <Pressable key={s} onPress={() => setSchool(s)}>
                <Pill active={school === s}>{s}</Pill>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <AppText variant="caption">Filiere</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {tracks.map((t) => (
              <Pressable key={t} onPress={() => setTrack(t)}>
                <Pill active={track === t}>{t}</Pill>
              </Pressable>
            ))}
          </View>
        </View>

        <AppInput label="Niveau" value={level} onChangeText={setLevel} placeholder="Ex: L3" />

        <View style={{ gap: 10 }}>
          <AppText variant="caption">Objectifs</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {goals.map((g) => (
              <Pressable key={g} onPress={() => toggleGoal(g)}>
                <Pill active={selectedGoals.includes(g)}>{g}</Pill>
              </Pressable>
            ))}
          </View>
        </View>

        <AppButton onPress={submit}>Continuer</AppButton>
      </ScrollView>
    </Screen>
  );
}
