import { showToast } from "~/lib/stores/toast-store";

/**
 * Non-blocking in-app notifications (toasts). Safe to call from anywhere: React
 * components, mutation callbacks, axios interceptors. They are rendered by the
 * `ToastHost` mounted in each root layout (src/components/ui/toast.tsx).
 *
 * Use a toast for the outcome of something the user just did ("Payout details
 * saved") or a passing problem ("No connection"). A choice that must be made
 * (log out, reset data) stays a native `Alert.alert` with buttons, and a field
 * problem is an inline error under the field. See docs/DESIGN.md.
 */

type Params = {
  /** The short headline, one line where possible. */
  message: string;
  /** Optional second line of detail (clamped to two lines). */
  description?: string;
};

export const notifySuccess = (params: Params) => showToast("success", params);

export const notifyError = (params: Params) => showToast("error", params);

export const notifyInfo = (params: Params) => showToast("info", params);

export const notifyWarning = (params: Params) => showToast("warning", params);
