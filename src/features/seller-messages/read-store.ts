import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

// The API has no "seen" flag for the seller (the show endpoint never marks the
// conversation as viewed), so unread state is tracked on this device: the id of
// the newest message the seller has seen per conversation.
const STORAGE_KEY = "seller_messages_last_read";

interface ReadState {
  hydrated: boolean;
  lastRead: Record<string, number>;
  hydrate: () => Promise<void>;
  markRead: (conversationId: number, messageId: number) => void;
}

export const useMessageReadStore = create<ReadState>((set, get) => ({
  hydrated: false,
  lastRead: {},

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const stored: unknown = raw ? JSON.parse(raw) : {};
      const lastRead =
        stored && typeof stored === "object"
          ? (stored as Record<string, number>)
          : {};
      set((state) => ({
        hydrated: true,
        lastRead: { ...lastRead, ...state.lastRead },
      }));
    } catch {
      set({ hydrated: true });
    }
  },

  markRead: (conversationId, messageId) => {
    const key = String(conversationId);
    if ((get().lastRead[key] ?? 0) >= messageId) return;
    set({ lastRead: { ...get().lastRead, [key]: messageId } });
    // Persist after hydration so the stored map is merged, not overwritten.
    get()
      .hydrate()
      .then(() =>
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().lastRead)),
      )
      .catch(() => undefined);
  },
}));
