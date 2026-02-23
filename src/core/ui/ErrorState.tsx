import { View } from "react-native";
import { AppText } from "./AppText";
import { PrimaryButton } from "./Buttons";

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={{ paddingVertical: 36, alignItems: "center", gap: 8 }}>
      <AppText variant="h3">Une erreur est survenue</AppText>
      <AppText muted variant="body" style={{ textAlign: "center", maxWidth: 320 }}>
        {message ?? "Impossible de charger les donnees pour le moment."}
      </AppText>
      {onRetry ? <PrimaryButton onPress={onRetry}>Reessayer</PrimaryButton> : null}
    </View>
  );
}
