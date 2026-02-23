import { PropsWithChildren, createContext, useMemo } from "react";
import { tokens, type AppTokens } from "./tokens";

type ThemeContextValue = {
  tokens: AppTokens;
};

export const ThemeContext = createContext<ThemeContextValue>({
  tokens,
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const value = useMemo<ThemeContextValue>(() => ({ tokens }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
