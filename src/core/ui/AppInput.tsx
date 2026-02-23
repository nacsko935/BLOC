import { TextInput, View, TextInputProps } from "react-native";
import { AppText } from "./AppText";
import { theme } from "./theme";

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function AppInput({ label, error, style, ...props }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {label ? <AppText variant="caption">{label}</AppText> : null}
      <TextInput
        {...props}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            fontSize: theme.typography.md,
          },
          style,
        ]}
      />
      {error ? (
        <AppText variant="caption" style={{ color: theme.colors.danger }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
