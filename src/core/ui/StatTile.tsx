import { View } from "react-native";
import Card from "./Card";
import { AppText } from "./AppText";

type Props = {
  label: string;
  value: string | number;
  icon?: string;
};

export function StatTile({ label, value, icon }: Props) {
  return (
    <Card style={{ flex: 1, alignItems: "center", paddingVertical: 16 }}>
      {icon ? <AppText style={{ marginBottom: 6 }}>{icon}</AppText> : null}
      <AppText style={{ fontSize: 24, fontWeight: "800" }}>{value}</AppText>
      <AppText muted variant="caption">
        {label}
      </AppText>
    </Card>
  );
}
