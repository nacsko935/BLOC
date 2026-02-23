import { ScrollView, View } from "react-native";
import Card from "../../../core/ui/Card";
import { AppText } from "../../../core/ui/AppText";

const mockDeadlines = [
  { id: "d1", title: "QCM reseaux", due: "Demain" },
  { id: "d2", title: "Note de synthese", due: "Vendredi" },
  { id: "d3", title: "Projet BDD", due: "Lundi" },
];

export function DeadlineCarousel() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {mockDeadlines.map((d) => (
          <Card key={d.id} style={{ width: 170 }}>
            <AppText variant="caption" muted>
              Deadline
            </AppText>
            <AppText style={{ marginTop: 6, fontWeight: "800" }}>{d.title}</AppText>
            <AppText variant="caption" muted style={{ marginTop: 6 }}>
              {d.due}
            </AppText>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
