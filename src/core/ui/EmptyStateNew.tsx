import { View } from "react-native";
import { AppText } from "./AppText";
import { PrimaryButton } from "./Buttons";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ paddingVertical: 36, alignItems: "center", gap: 8 }}>
      <AppText variant="h3">{title}</AppText>
      <AppText muted variant="body" style={{ textAlign: "center", maxWidth: 300 }}>
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <PrimaryButton onPress={onAction} style={{ marginTop: 8 }}>
          {actionLabel}
        </PrimaryButton>
      ) : null}
    </View>
  );
}
