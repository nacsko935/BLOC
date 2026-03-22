import { Pressable, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../core/theme/ThemeProvider";
import { SearchResult } from "../services/searchService";

const TYPE_META: Record<SearchResult["type"], { emoji: string; label: string }> = {
  user:   { emoji: "",   label: "Personne" },
  course: { emoji: "📚", label: "Cours" },
  post:   { emoji: "📝", label: "Post" },
  note:   { emoji: "🗒️", label: "Note" },
};

type Props = {
  item: SearchResult;
  onPress: (item: SearchResult) => void;
};

export function SearchResultItem({ item, onPress }: Props) {
  const { c } = useTheme();
  const meta = TYPE_META[item.type];
  const isUser = item.type === "user";

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.card, borderColor: c.border },
        pressed && { opacity: 0.75 },
      ]}
    >
      {/* Avatar / Icon */}
      <View style={[styles.icon, { backgroundColor: c.accentPurple + "22" }]}>
        {isUser ? (
          <Text style={[styles.initial, { color: c.accentPurple }]}>
            {item.title.charAt(0).toUpperCase()}
          </Text>
        ) : (
          <Text style={styles.emoji}>{meta.emoji}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
        {item.progress != null ? (
          <Text style={[styles.subtitle, { color: c.accentPurple }]}>
            {item.progress}% complété
          </Text>
        ) : null}
      </View>

      {/* Badge */}
      <View style={[styles.badge, { backgroundColor: c.cardAlt }]}>
        <Text style={[styles.badgeText, { color: c.textSecondary }]}>{meta.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initial: { fontWeight: "900", fontSize: 17 },
  emoji: { fontSize: 18 },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: "700" },
  subtitle: { fontSize: 12 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
