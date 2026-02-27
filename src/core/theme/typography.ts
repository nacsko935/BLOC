export const typography = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  title: 32,
  titleLg: { fontSize: 30, fontWeight: "800" as const },
  titleMd: { fontSize: 22, fontWeight: "800" as const },
  titleSm: { fontSize: 18, fontWeight: "700" as const },
  body: { fontSize: 14, fontWeight: "500" as const },
  bodyStrong: { fontSize: 14, fontWeight: "700" as const },
  caption: { fontSize: 12, fontWeight: "600" as const },
  muted: { fontSize: 12, fontWeight: "500" as const },
} as const;

export type AppTypography = typeof typography;
