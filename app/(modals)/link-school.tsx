import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import { AppHeader } from "../../src/core/ui/AppHeader";
import { AppInput } from "../../src/core/ui/AppInput";
import { AppButton } from "../../src/core/ui/AppButton";
import { AppText } from "../../src/core/ui/AppText";
import Card from "../../src/core/ui/Card";
import { joinSchool } from "../../src/features/auth/authRepo";

export default function LinkSchoolModal() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const clean = code.trim().toUpperCase();
    if (clean.length < 3) {
      setError("Code invalide.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const school = await joinSchool(clean);
      if (!school) {
        setError("Impossible de lier l'ecole.");
      } else {
        Alert.alert("Ecole liee", `${school.name} (${school.code})`, [{ text: "OK", onPress: () => router.back() }]);
      }
    } catch {
      setError("Erreur de validation du code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <AppHeader title="Lier une ecole" subtitle="Associe ton etablissement pour personnaliser le feed" />
        <AppInput label="Code etablissement" value={code} onChangeText={setCode} placeholder="Ex: ESGI" autoCapitalize="characters" error={error} />
        <Card>
          <AppText variant="caption" muted>
            Validation mock active: codes courts rejetes, codes 3+ caracteres acceptes.
          </AppText>
        </Card>
        <AppButton onPress={submit} disabled={loading}>{loading ? "Validation..." : "Lier mon ecole"}</AppButton>
      </ScrollView>
    </Screen>
  );
}
