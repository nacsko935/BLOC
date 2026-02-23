export const tokens = {
  colors: {
    background: "#0a0a0d",
    backgroundSecondary: "#0f0f12",
    card: "#16161b",
    cardElevated: "#1c1c23",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.62)",
    accentBlue: "#3d8fff",
    accentOrange: "#f5a623",
    success: "#34c759",
    danger: "#ff3b30",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  typography: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 30,
    title: 32,
  },
} as const;

export type AppTokens = typeof tokens;
