import { View } from "react-native";
import Card from "../../../core/ui/Card";
import { AppText } from "../../../core/ui/AppText";
import { ProgressBar } from "../../../core/ui/ProgressBar";
import { Mission } from "../services/progressService";

export function MissionCard({ mission }: { mission: Mission }) {
  const pct = (mission.progress / mission.target) * 100;
  return (
    <Card>
      <AppText>{mission.title}</AppText>
      <AppText muted variant="caption" style={{ marginTop: 4 }}>{mission.progress}/{mission.target}</AppText>
      <View style={{ marginTop: 8 }}>
        <ProgressBar value={pct} />
      </View>
    </Card>
  );
}
