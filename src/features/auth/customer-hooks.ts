import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import { axiosPrivate } from "~/lib/config/axios";
import { useAuthStore } from "~/hooks/use-auth-store";
import { saveToken, deleteToken } from "~/lib/secure-storage";
import { useRoleStore } from "~/lib/stores/role-store";
import { handleApiError } from "~/lib/utils/error-handler";
import { notifyInfo, notifySuccess } from "~/lib/utils/toast";
import { queryClient } from "~/providers/tanstack-query";
import AuthService from "./api";
import { classifyLoginError } from "./errors";
import { resetSessionExpiry } from "./session-expiry-state";
import type { ForgotPasswordDTO, LoginDTO, ResetPasswordDTO } from "./types";

// Customer-app auth hooks (customers and riders share the sign-in). Route
// changes live here because the screens exist only in the customer route tree.

/** Stores the session, picks the role from the account type and opens Home. */
export async function startCustomerSession(access: string, userType?: string) {
  useAuthStore.getState().setAuthToken({ access });
  axiosPrivate.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  await saveToken(access);
  resetSessionExpiry();
  queryClient.clear();
  useRoleStore
    .getState()
    .setRole(userType === "delivery_boy" ? "rider" : "customer");
  router.replace("/(tabs)/home");
}

/**
 * Riders and customers use one login screen. The API searches one account
 * table per `user_type`, so try customers first and riders when no customer
 * matches. TODO(backend): a single sign-in that answers with the account type.
 */
async function loginAnyRole(data: LoginDTO) {
  try {
    return await AuthService.login({ ...data, userType: "customer" });
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      classifyLoginError(error) === "invalid-credentials" &&
      /not found/i.test(String(error.response.data?.message ?? ""))
    ) {
      return AuthService.login({ ...data, userType: "delivery_boy" });
    }
    throw error;
  }
}

export function useCustomerLogin() {
  return useMutation({
    mutationFn: loginAnyRole,
    onSuccess: (token) => startCustomerSession(token.access, token.userType),
    meta: { suppressGlobalError: true },
  });
}

export function useCustomerLogout() {
  const clearAuthToken = useAuthStore((s) => s.clearAuthToken);

  return useMutation({
    mutationFn: () => AuthService.logout({ token: "" }).catch(() => undefined),
    onSettled: async () => {
      suppress();
      clearAuthToken();
      await deleteToken();
      queryClient.clear();
      useRoleStore.getState().setRole("customer");
      notifySuccess({ message: "Logged out" });
      router.replace("/(auth)/login");
    },
  });
}

function suppress() {
  delete axiosPrivate.defaults.headers.common["Authorization"];
}

export function useCustomerForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordDTO) => AuthService.forgotPassword(data),
    onSuccess: (_data, variables) => {
      router.push({
        pathname: "/(auth)/reset-password",
        params: { identifier: variables.identifier, method: variables.method },
      });
    },
    onError: (error, variables) => {
      handleApiError(error, {
        404: () =>
          notifyInfo({
            message:
              variables.method === "phone"
                ? "No account uses that phone number."
                : "No account uses that email address.",
          }),
      });
    },
  });
}

export function useCustomerResendCode() {
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

/** Resets the password, then signs in with it ("you're signed in automatically"). */
export function useCustomerResetPassword(
  identifier: string,
  method: ForgotPasswordDTO["method"],
) {
  return useMutation({
    mutationFn: async (data: ResetPasswordDTO) => {
      await AuthService.resetPassword(data);
      return loginAnyRole({
        email: identifier,
        method,
        password: data.password,
      });
    },
    onSuccess: (token) => {
      router.replace("/(auth)/reset-success");
      // Keep the session ready for "Continue" on the success screen.
      void startSilently(token.access, token.userType);
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
    meta: { suppressGlobalError: true },
  });
}

async function startSilently(access: string, userType?: string) {
  useAuthStore.getState().setAuthToken({ access });
  axiosPrivate.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  await saveToken(access);
  resetSessionExpiry();
  useRoleStore
    .getState()
    .setRole(userType === "delivery_boy" ? "rider" : "customer");
}
