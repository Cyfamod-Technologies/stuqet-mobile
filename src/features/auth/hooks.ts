import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { isVendorApp } from "~/lib/config/features";
import { deleteToken } from "~/lib/secure-storage";
import { notifySuccess } from "~/lib/utils/toast";
import { useAuthStore } from "~/hooks/use-auth-store";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import AuthService from "./api";
import { suppressSessionExpiry } from "./session-expiry-state";

// Shared auth hooks. The vendor login / reset flow lives in vendor-hooks.ts and
// the customer + rider one in customer-hooks.ts.

export function useGetProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.users.me,
    queryFn: AuthService.getProfile,
    retry: false,
  });
}

export function useLogout() {
  const { clearAuthToken, token } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      // An intentional logout must not trip the vendor "Session expired" screen
      // when an in-flight request answers 401.
      if (isVendorApp) suppressSessionExpiry();
      return token
        ? AuthService.logout({ token: token.access })
        : Promise.resolve();
    },
    onSuccess: async () => {
      clearAuthToken();
      await deleteToken();
      notifySuccess({ message: "Logged out successfully" });
      router.replace("/(auth)/login");
    },
    onError: async () => {
      // Force logout even on error
      clearAuthToken();
      await deleteToken();
      router.replace("/(auth)/login");
    },
  });
}
