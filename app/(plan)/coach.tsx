import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../src/core/ui/AppButton";
import { PlanCard } from "../../src/features/plan/components/PlanCard";
import { PlanSectionHeader } from "../../src/features/plan/components/PlanSectionHeader";
import { usePlanStore } from "../../state/usePlanStore";

export default function PlanCoachScreen() {
  const { initialized, loadAll, coachTips, refreshCoach } = usePlanStore();

  useEffect(() => {
    if (!initialized) loadAll().catch(() => null);
  }, [initialized, loadAll]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Coach</Text>
        <Text style={styles.subtitle}>Conseils contextuels pour garder ton rythme</Text>

        <PlanCard>
          <PlanSectionHeader title="Suggestions" actionLabel="Rafraîchir" onPressAction={() => refreshCoach().catch(() => null)} />
          {coachTips.length === 0 ? (
            <Text style={styles.muted}>Pas de conseils pour le moment.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {coachTips.map((tip) => (
                <PlanCard key={tip.id} style={{ padding: 12 }}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipMessage}>{tip.message}</Text>
                  <View style={styles.actionsRow}>
                    {tip.actions.slice(0, 2).map((a) => (
                      <AppButton key={a.label} variant="secondary" style={styles.actionBtn} onPress={() => {}}>
                        {a.label}
                      </AppButton>
                    ))}
                  </View>
                </PlanCard>
              ))}
            </View>
          )}
        </PlanCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { paddingTop: 58, paddingHorizontal: 14, paddingBottom: 24, gap: 12 },
  title: { color: "#FFF", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#8F949D" },
  muted: { color: "#9CA4B1" },
  tipTitle: { color: "#FFF", fontWeight: "800" },
  tipMessage: { color: "#96A0AE", marginTop: 6 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  actionBtn: { flex: 1 },
});
