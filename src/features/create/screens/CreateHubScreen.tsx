import React, { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../../core/ui/Screen";
import { AppHeader } from "../../../core/ui/AppHeader";
import { AppText } from "../../../core/ui/AppText";
import Card from "../../../core/ui/Card";

const actions = [
  { title: "Importer fichier", subtitle: "PDF / DOC", route: "/create/import", icon: "??" },
  { title: "Import audio", subtitle: "Memo vocal", route: "/create/audio", icon: "??" },
  { title: "Creer QCM", subtitle: "Questions + corrections", route: "/create/qcm", icon: "??" },
  { title: "Creer Flashcards", subtitle: "Memo active", route: "/create/flashcards", icon: "??" },
];

export default function CreateHubScreen() {
  const router = useRouter();
  const [recent] = useState([
    { id: "1", title: "QCM Reseaux", date: "Aujourd'hui" },
    { id: "2", title: "Fiche BDD", date: "Hier" },
  ]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Creer" subtitle="Zero friction, generation rapide" />

        <View style={{ gap: 10 }}>
          {actions.map((a) => (
            <Pressable key={a.title} onPress={() => router.push(a.route as any)}>
              <Card>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <AppText style={{ fontSize: 28 }}>{a.icon}</AppText>
                  <View style={{ flex: 1 }}>
                    <AppText style={{ fontWeight: "800" }}>{a.title}</AppText>
                    <AppText muted variant="caption" style={{ marginTop: 4 }}>{a.subtitle}</AppText>
                  </View>
                  <AppText>{">"}</AppText>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <View>
          <AppText variant="subtitle" style={{ marginBottom: 8 }}>Recents</AppText>
          <View style={{ gap: 8 }}>
            {recent.map((r) => (
              <Card key={r.id}>
                <AppText>{r.title}</AppText>
                <AppText muted variant="caption" style={{ marginTop: 4 }}>{r.date}</AppText>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
