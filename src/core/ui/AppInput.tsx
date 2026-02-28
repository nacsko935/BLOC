import { useTheme } from "../theme/ThemeProvider";
import { TextInput, View, TextInputProps } from "react-native";
import { AppText } from "./AppText";

type Props = TextInputProps & { label?: string; error?: string | null; };

export function AppInput({ label, error, style, ...props }: Props) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {label ? <AppText variant="caption">{label}</AppText> : null}
      <TextInput
        {...props}
        placeholderTextColor={c.textSecondary}
        style={[{ backgroundColor: c.cardAlt, borderRadius: 14, paddingHorizontal: 14,
          paddingVertical: 12, color: c.textPrimary, borderWidth: 1,
          borderColor: error ? c.danger : c.border, fontSize: 16 }, style]}
      />
      {error ? <AppText variant="caption" style={{ color: c.danger }}>{error}</AppText> : null}
    </View>
  );
}
