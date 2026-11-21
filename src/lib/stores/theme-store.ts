import { create } from "zustand";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark";

/** What the person chose: a fixed theme, or "Match my phone". */
export type ThemePreference = Theme | "system";

const THEME_KEY = "app_theme";
const PREFERENCE_KEY = "app_theme_preference";

interface ThemeState {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (theme: Theme) => void;
  /** Light, dark, or follow the phone's own setting (Appearance screen). */
  setPreference: (preference: ThemePreference) => void;
  hydrate: () => Promise<void>;
}

const systemTheme = (): Theme =>
  Appearance.getColorScheme() === "dark" ? "dark" : "light";

let listening = false;

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  preference: "light",
  setTheme: (theme) => {
    set({ theme, preference: theme });
    Appearance.setColorScheme(theme);
    AsyncStorage.setItem(THEME_KEY, theme);
    AsyncStorage.setItem(PREFERENCE_KEY, theme);
  },
  setPreference: (preference) => {
    if (preference === "system") {
      Appearance.setColorScheme("unspecified");
      set({ preference, theme: systemTheme() });
      AsyncStorage.setItem(PREFERENCE_KEY, "system");
    } else {
      get().setTheme(preference);
    }
  },
  hydrate: async () => {
    const [stored, preference] = await Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(PREFERENCE_KEY),
    ]);
    if (preference === "system") {
      Appearance.setColorScheme("unspecified");
      set({ preference: "system", theme: systemTheme() });
    } else {
      const theme: Theme = stored === "dark" ? "dark" : "light";
      Appearance.setColorScheme(theme);
      set({ theme, preference: theme });
    }
    if (!listening) {
      listening = true;
      Appearance.addChangeListener(({ colorScheme }) => {
        if (get().preference === "system") {
          set({ theme: colorScheme === "dark" ? "dark" : "light" });
        }
      });
    }
  },
}));
