export const colors = {
  background: "#000000",
  surface: "#111111",
  surfaceAlt: "#1A1A1A",
  border: "#222222",
  text: "#FFFFFF",
  textMuted: "#9A9A9A",
  accent: "#6E5CFF",
  accentSoft: "rgba(110,92,255,0.22)",
  danger: "#FF5C7A",
  success: "#22C55E",
} as const;

export type AppColors = typeof colors;

