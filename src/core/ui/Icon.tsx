import { Text } from "react-native";

const glyphs: Record<string, string> = {
  heart: "♥",
  comment: "✎",
  bookmark: "▢",
  share: "↗",
  attachment: "⧉",
  bolt: "⚡",
  home: "⌂",
  search: "⌕",
  flame: "▲",
  book: "▭",
};

export default function Icon({
  name,
  color,
  size = 16,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return <Text style={{ color, fontWeight: "800", fontSize: size }}>{glyphs[name] ?? "•"}</Text>;
}
