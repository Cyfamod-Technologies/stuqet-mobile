import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { axiosPrivate } from "~/lib/config/axios";
import { useAuthStore } from "~/hooks/use-auth-store";
import {
  saveToken,
  setRememberMe,
  wasBiometricPrompted,
} from "~/lib/secure-storage";
import { handleApiError } from "~/lib/utils/error-handler";
import { notifyInfo } from "~/lib/utils/toast";
import AuthService from "./api";
import { isBiometricAvailable } from "./biometrics";
import { classifyLoginError } from "./errors";
import { pendingLogin } from "./pending-login";
import { resetSessionExpiry } from "./session-expiry";
import type { ForgotPasswordDTO, LoginDTO } from "./types";

// Vendor-app auth hooks. Route changes live here (not in hooks.ts) because the
// screens they navigate to exist only in the vendor route tree.

/** Stores the session and routes on: fingerprint offer once, else the app. */
export async function startVendorSession(
  access: string,
  remember: boolean,
): Promise<void> {
  useAuthStore.getState().setAuthToken({ access });
  axiosPrivate.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  await saveToken(access);
  await setRememberMe(remember);
  pendingLogin.clear();
  resetSessionExpiry();

  const offerFingerprint =
    (await isBiometricAvailable()) && !(await wasBiometricPrompted());
  router.replace(offerFingerprint ? "/(auth)/enable-fingerprint" : "/(tabs)");
}

export function useVendorLogin() {
  return useMutation({
    mutationFn: (data: LoginDTO) => AuthService.login(data),
    onSuccess: (token, variables) =>
      startVendorSession(token.access, variables.remember ?? true),
    onError: (error, variables) => {
      // Suspended / under review have their own screens; everything else is
      // shown inline by the login screen from `mutation.error`.
      switch (classifyLoginError(error)) {
        case "suspended":
          router.replace("/(auth)/suspended");
          break;
        case "under-review":
          pendingLogin.set(variables);
          router.push("/(auth)/under-review");
          break;
        default:
          break;
      }
    },
  });
}

export function useVendorForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordDTO) => AuthService.forgotPassword(data),
    onSuccess: (_data, variables) => {
      router.push({
        pathname: "/(auth)/check-inbox",
        params: { identifier: variables.identifier, method: variables.method },
      });
    },
    onError: (error, variables) => {
      handleApiError(error, {
        404: () =>
          notifyInfo({
            message:
              variables.method === "phone"
                ? "No seller account uses that phone number."
                : "No seller account uses that email address.",
          }),
      });
    },
  });
}

export function useVendorResendResetCode() {
  return useMutation({
    mutationFn: (data: ForgotPasswordDTO) => AuthService.resendResetCode(data),
    onSuccess: (_data, variables) => {
      notifyInfo({
        message: "Code sent again",
        description: `Check your ${variables.method === "phone" ? "messages" : "inbox"}.`,
      });
    },
    onError: (error) => handleApiError(error),
  });
}

export function useVendorResetPassword() {
  return useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: () => {
      router.replace("/(auth)/reset-success");
    },
    onError: (error) => {
      handleApiError(error, {
        400: () =>
          notifyInfo({
            message: "That code is wrong or has expired.",
            description: "Check the code, or tap Resend code for a new one.",
          }),
      });
    },
  });
}
