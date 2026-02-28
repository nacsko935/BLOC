const shared = {
  spacing:    { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  radius:     { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 },
  typography: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 30, title: 32 },
};

export const darkColors = {
  background:          "#000000",
  backgroundSecondary: "#0D0D0D",
  card:                "#111111",
  cardAlt:             "#1A1A1A",
  border:              "rgba(255,255,255,0.10)",
  borderStrong:        "rgba(255,255,255,0.18)",
  textPrimary:         "#FFFFFF",
  textSecondary:       "rgba(255,255,255,0.50)",
  accentPurple:        "#7B6CFF",
  accentBlue:          "#4DA3FF",
  accentOrange:        "#FF8C00",
  success:             "#34C759",
  danger:              "#FF3B30",
};

export const lightColors = {
  background:          "#FFFFFF",
  backgroundSecondary: "#F7F7F7",
  card:                "#FFFFFF",
  cardAlt:             "#F0F0F0",
  border:              "rgba(0,0,0,0.10)",
  borderStrong:        "rgba(0,0,0,0.20)",
  textPrimary:         "#000000",
  textSecondary:       "rgba(0,0,0,0.50)",
  accentPurple:        "#5B4CFF",
  accentBlue:          "#1A6FE8",
  accentOrange:        "#E07A00",
  success:             "#1E9E3E",
  danger:              "#D92B22",
};

export type ColorTokens = typeof darkColors;
export function buildTokens(isDark: boolean) {
  return { colors: isDark ? darkColors : lightColors, ...shared };
}
export const tokens = { colors: darkColors, ...shared };
export type AppTokens = ReturnType<typeof buildTokens>;
