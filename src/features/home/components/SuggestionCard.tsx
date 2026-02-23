import { Pressable } from "react-native";
import Card from "../../../core/ui/Card";
import { AppText } from "../../../core/ui/AppText";

export function SuggestionCard({ title, subtitle, onPress }: { title: string; subtitle: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <AppText style={{ fontWeight: "800" }}>{title}</AppText>
        <AppText muted variant="caption" style={{ marginTop: 4 }}>
          {subtitle}
        </AppText>
      </Card>
    </Pressable>
  );
}
