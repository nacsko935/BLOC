const shared = {
  spacing:    { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  radius:     { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 },
  typography: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 30, title: 32 },
};

export const darkColors = {
  background:          "#07071A",   // deep midnight navy
  backgroundSecondary: "#0C0C22",
  card:                "#0F0F28",   // indigo-tinted card
  cardAlt:             "#181836",   // slightly lighter
  border:              "rgba(130,110,255,0.13)",
  borderStrong:        "rgba(130,110,255,0.26)",
  textPrimary:         "#EAE8FF",   // warm white with purple tint
  textSecondary:       "rgba(180,172,255,0.42)",
  accentPurple:        "#7B6CFF",
  accentBlue:          "#4DA3FF",
  accentOrange:        "#FF8C00",
  success:             "#2ED573",
  danger:              "#FF4757",
};

export const lightColors = {
  background:          "#F6F5FF",
  backgroundSecondary: "#EEEEFF",
  card:                "#FFFFFF",
  cardAlt:             "#F0EEFF",
  border:              "rgba(91,76,255,0.10)",
  borderStrong:        "rgba(91,76,255,0.22)",
  textPrimary:         "#0D0B2E",
  textSecondary:       "rgba(13,11,46,0.45)",
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
