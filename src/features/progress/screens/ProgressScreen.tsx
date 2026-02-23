import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Screen from "../../../core/ui/Screen";
import { AppHeader } from "../../../core/ui/AppHeader";
import { AppText } from "../../../core/ui/AppText";
import { StatTile } from "../../../core/ui/StatTile";
import { ProgressRing } from "../components/ProgressRing";
import { MissionCard } from "../components/MissionCard";
import { getProgressState, ProgressState } from "../services/progressService";

export default function ProgressScreen() {
  const [state, setState] = useState<ProgressState | null>(null);

  useEffect(() => {
    getProgressState().then(setState);
  }, []);

  if (!state) {
    return (
      <Screen>
        <AppText>Chargement...</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Progression" subtitle="Missions quotidiennes et badges" />

        <View style={{ alignItems: "center" }}>
          <ProgressRing value={Math.min(100, Math.round((state.xp % 1000) / 10))} />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatTile label="Streak" value={`${state.streak}j`} icon="??" />
          <StatTile label="XP" value={state.xp} icon="?" />
          <StatTile label="Niveau" value={state.level} icon="??" />
        </View>

        <View>
          <AppText variant="subtitle" style={{ marginBottom: 8 }}>Missions</AppText>
          <View style={{ gap: 8 }}>
            {state.missions.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </View>
        </View>

        <View>
          <AppText variant="subtitle" style={{ marginBottom: 8 }}>Badges</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {state.badges.map((b) => (
              <StatTile key={b} label={b} value="Unlock" />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
