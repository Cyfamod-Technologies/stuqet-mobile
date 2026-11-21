import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AuthService from "~/features/auth/api";
import { getApiMessage } from "~/features/auth/errors";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { notifyInfo, notifySuccess } from "~/lib/utils/toast";
import RiderService from "./api";

/** The signed-in user's id, which the delivery-boy routes take in their path. */
export function useRiderId(): number | null {
  const me = useQuery({
    queryKey: QUERY_KEYS.users.me,
    queryFn: AuthService.getProfile,
    staleTime: Infinity,
    retry: false,
  });
  return me.data?.id ?? null;
}

export function useRiderProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.rider.profile,
    queryFn: RiderService.profile,
    retry: false,
    meta: { suppressGlobalError: true },
  });
}

/** Each check of a pending application; the demo approves it on the second. */
export function useApplicationStatus(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.rider.application,
    queryFn: RiderService.applicationStatus,
    enabled,
    staleTime: 0,
    meta: { suppressGlobalError: true },
  });
}

export function useApplyAsRider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RiderService.apply,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rider.profile,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.profile,
      });
    },
    onError: (error) => handleApiError(error),
    meta: { suppressGlobalError: true },
  });
}

export function useBanks() {
  return useQuery({
    queryKey: QUERY_KEYS.rider.banks,
    queryFn: RiderService.banks,
    staleTime: Infinity,
  });
}

/** Looks the account name up once a bank and a 10-digit number are chosen. */
export function useResolveAccount(bankCode: string, accountNumber: string) {
  const ready = bankCode.length > 0 && /^\d{10}$/.test(accountNumber);
  return useQuery({
    queryKey: ["rider", "resolve", bankCode, accountNumber],
    queryFn: () => RiderService.resolveAccount(bankCode, accountNumber),
    enabled: ready,
    retry: false,
    staleTime: 60_000,
    meta: { suppressGlobalError: true },
  });
}

export function useSavePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RiderService.savePayout,
    onSuccess: () => {
      notifySuccess({ message: "Payout details saved" });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rider.profile,
      });
    },
    onError: (error) => {
      const text = getApiMessage(error);
      if (text) notifyInfo({ message: text });
      else handleApiError(error);
    },
    meta: { suppressGlobalError: true },
  });
}

export function useRiderNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.rider.notifications,
    queryFn: RiderService.notifications,
    refetchInterval: 10_000,
  });
}
