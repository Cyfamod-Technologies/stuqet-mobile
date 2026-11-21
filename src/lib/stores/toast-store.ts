import { create } from "zustand";

/**
 * Toast store. Module-level on purpose: `notifySuccess` & co. are called from
 * axios interceptors, query caches and mutation callbacks that have no React
 * context, so they write straight to `useToastStore.getState()`. The
 * `ToastHost` (src/components/ui/toast.tsx) is the only subscriber that renders.
 * Timers, gestures and animation live in the host; this file is just data.
 */

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  description?: string;
  /** How long the toast stays up, in ms (before the user pauses it). */
  duration: number;
  /** Bumped when an identical toast is shown again, to restart its timer. */
  stamp: number;
}

export interface ToastInput {
  message: string;
  description?: string;
}

/** Newest toast + the two before it; anything older is dropped. */
export const MAX_VISIBLE_TOASTS = 3;

const BASE_DURATION: Record<ToastVariant, number> = {
  success: 3500,
  info: 3500,
  error: 5000,
  warning: 5000,
};
/** Extra reading time when the toast has a description. */
const DESCRIPTION_BONUS = 1500;

const MAX_MESSAGE_LENGTH = 140;
const MAX_DESCRIPTION_LENGTH = 280;

// Collapses whitespace/newlines and caps the length, so a stray server blob can
// never blow the card up. The card also clamps to two lines.
function tidy(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

let nextId = 0;

interface ToastState {
  /** Newest first. */
  toasts: ToastItem[];
  show: (variant: ToastVariant, input: ToastInput) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (variant, input) => {
    let message = tidy(input?.message, MAX_MESSAGE_LENGTH);
    let description: string | undefined =
      tidy(input?.description, MAX_DESCRIPTION_LENGTH) || undefined;
    // A description with no title reads as the title.
    if (!message && description) {
      message = description;
      description = undefined;
    }
    if (!message) return;

    const id = `toast-${(nextId += 1)}`;
    set((state) => {
      // The same toast already on screen (e.g. five queries failing at once):
      // refresh it in place instead of stacking a duplicate.
      const existing = state.toasts.find(
        (t) =>
          t.variant === variant &&
          t.message === message &&
          t.description === description,
      );
      if (existing) {
        return {
          toasts: state.toasts.map((t) =>
            t.id === existing.id ? { ...t, stamp: t.stamp + 1 } : t,
          ),
        };
      }
      const item: ToastItem = {
        id,
        variant,
        message,
        description,
        duration:
          BASE_DURATION[variant] + (description ? DESCRIPTION_BONUS : 0),
        stamp: 0,
      };
      return { toasts: [item, ...state.toasts].slice(0, MAX_VISIBLE_TOASTS) };
    });
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));

export const showToast = (variant: ToastVariant, input: ToastInput) =>
  useToastStore.getState().show(variant, input);
export const dismissToast = (id: string) =>
  useToastStore.getState().dismiss(id);
export const clearToasts = () => useToastStore.getState().clear();
