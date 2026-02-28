import {
  PropsWithChildren, createContext, useContext,
  useState, useMemo, useCallback, useEffect,
} from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildTokens, ColorTokens, AppTokens } from "./tokens";

const THEME_KEY = "bloc_theme_isDark";

type ThemeContextValue = {
  tokens:      AppTokens;
  isDark:      boolean;
  toggleTheme: () => void;
  c:           ColorTokens;
};

const ThemeContext = createContext<ThemeContextValue>({
  tokens:      buildTokens(true),
  isDark:      true,
  toggleTheme: () => {},
  c:           buildTokens(true).colors,
});

export function ThemeProvider({ children }: PropsWithChildren) {
  // Lire la préférence système comme valeur initiale
  const systemDark = Appearance.getColorScheme() === "dark";
  const [isDark, setIsDark] = useState<boolean>(systemDark);
  const [loaded, setLoaded] = useState(false);

  // Charger la préférence sauvegardée au démarrage
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val !== null) setIsDark(val === "dark");
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light").catch(() => null);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const tokens = buildTokens(isDark);
    return { tokens, isDark, toggleTheme, c: tokens.colors };
  }, [isDark, toggleTheme]);

  // Ne pas afficher tant que le thème n'est pas chargé (évite le flash)
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
