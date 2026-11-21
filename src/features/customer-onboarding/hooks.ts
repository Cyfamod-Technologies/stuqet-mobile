import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { axiosPrivate } from "~/lib/config/axios";
import { useAuthStore } from "~/hooks/use-auth-store";
import { saveToken } from "~/lib/secure-storage";
import AuthService from "~/features/auth/api";
import { getApiMessage } from "~/features/auth/errors";
import { handleApiError } from "~/lib/utils/error-handler";
import { notifyError, notifyInfo } from "~/lib/utils/toast";
import { useRoleStore } from "~/lib/stores/role-store";
import OnboardingService, { type SignupInput } from "./api";
import type { IdentifierMethod } from "~/features/auth/types";

export function useSendContactCode() {
  return useMutation({
    mutationFn: ({
      method,
      contact,
    }: {
      method: IdentifierMethod;
      contact: string;
    }) => OnboardingService.sendCode(method, contact),
    onError: (error) =>
      notifyError({
        message: getApiMessage(error) ?? "We could not send the code.",
      }),
    meta: { suppressGlobalError: true },
  });
}

export function useConfirmContactCode() {
  return useMutation({
    mutationFn: (input: {
      method: IdentifierMethod;
      contact: string;
      code: string;
    }) =>
      OnboardingService.confirmCode(input.method, input.contact, input.code),
    meta: { suppressGlobalError: true },
  });
}

/** Creates the account, signs in with it and moves on to the role picker. */
export function useSignup() {
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      await OnboardingService.signup(input);
      return AuthService.login({
        email: input.contact,
        password: input.password,
        method: input.method,
        userType: "customer",
      });
    },
    onSuccess: async (token) => {
      // The role picker (next) decides the side of the app, so start the
      // session without opening Home.
      useAuthStore.getState().setAuthToken({ access: token.access });
      axiosPrivate.defaults.headers.common["Authorization"] =
        `Bearer ${token.access}`;
      await saveToken(token.access);
      useRoleStore.getState().setRole("customer");
      router.replace("/(auth)/role");
    },
    onError: (error) => {
      const text = getApiMessage(error);
      if (text) notifyInfo({ message: text });
      else handleApiError(error);
    },
    meta: { suppressGlobalError: true },
  });
}
