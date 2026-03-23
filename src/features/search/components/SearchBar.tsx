import { useEffect, useRef } from "react";
import {
  View, TextInput, Pressable, Animated, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../core/theme/ThemeProvider";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onBack?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
};

export function SearchBar({ value, onChange, onBack, autoFocus = true, placeholder = "Rechercher…" }: Props) {
  const { c } = useTheme();

  const clearScale = useRef(new Animated.Value(0)).current;
  const clearOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = value.length > 0;
    Animated.parallel([
      Animated.spring(clearScale, { toValue: show ? 1 : 0, useNativeDriver: true, bounciness: 6 }),
      Animated.timing(clearOpacity, { toValue: show ? 1 : 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [value.length > 0]);

  return (
    <View style={[styles.row, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8} style={styles.icon}>
          <Ionicons name="arrow-back" size={20} color={c.textSecondary} />
        </Pressable>
      ) : (
        <View style={styles.icon}>
          <Ionicons name="search-outline" size={18} color={c.textSecondary} />
        </View>
      )}

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.textSecondary}
        style={[styles.input, { color: c.textPrimary }]}
        autoFocus={autoFocus}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <Animated.View style={{ transform: [{ scale: clearScale }], opacity: clearOpacity }}>
        <Pressable
          onPress={() => onChange("")}
          hitSlop={8}
          style={[styles.clearBtn, { backgroundColor: c.border }]}
        >
          <Ionicons name="close" size={13} color={c.textSecondary} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  icon: { width: 24, alignItems: "center" },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
