import { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import Card from "../../src/core/ui/Card";
import { completeQcm, getQcm } from "../../src/features/qcm/store";

export default function QcmDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [qcm, setQcm] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setQcm(getQcm(String(id)));
  }, [id]);

  if (!qcm) {
    return (
      <Screen>
        <Text style={{ color: "rgba(255,255,255,0.7)" }}>Chargement…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>{qcm.title}</Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
          {qcm.subject} · {qcm.questions} questions
        </Text>

        <View style={{ marginTop: 12, gap: 10 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)" }}>
            Question 1/ {qcm.questions} — Exemple : Quel est le rôle du protocole TCP ?
          </Text>
          <View style={{ gap: 8 }}>
            {["Transport fiable", "Routage", "Chiffrement"].map((a) => (
              <Pressable
                key={a}
                style={{
                  backgroundColor: "#14151a",
                  borderRadius: 12,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ color: "white" }}>{a}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Pressable
            onPress={() => {
              const score = Math.floor(60 + Math.random() * 40);
              completeQcm(qcm.id, score);
              router.replace("/(tabs)/library");
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "white" }}
          >
            <Text style={{ fontWeight: "900" }}>Terminer</Text>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}
