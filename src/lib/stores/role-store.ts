import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

/** Which side of the customer app is open: ordering food or delivering it. */
export type AppRole = "customer" | "rider";

const STORAGE_KEY = "app_role";

interface RoleState {
  role: AppRole;
  hydrated: boolean;
  setRole: (role: AppRole) => void;
  hydrate: () => Promise<void>;
}

// One app, two roles: the tab bar and the Home screen follow this. It is set
// from the account type at sign-in and by "Switch to ordering food" / "Become
// a rider". The choice is persisted so a restart opens the same side.
export const useRoleStore = create<RoleState>((set, get) => ({
  role: "customer",
  hydrated: false,

  setRole: (role) => {
    set({ role });
    AsyncStorage.setItem(STORAGE_KEY, role).catch(() => {});
  },

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === "customer" || saved === "rider") set({ role: saved });
    } catch {
      // Keep the default role.
    }
    set({ hydrated: true });
  },
}));
