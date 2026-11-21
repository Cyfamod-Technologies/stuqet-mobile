import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { handleApiError } from "~/lib/utils/error-handler";
import AccountService from "./api";
import { ACCOUNT_NUMBER_LENGTH, isAccountResolveEnabled } from "./constants";

export function useUpdateShopProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AccountService.updateShopProfile,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop }),
    onError: (error) => handleApiError(error),
  });
}

export function useUpdatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AccountService.updatePayout,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop }),
    onError: (error) => handleApiError(error),
  });
}

/** Uploads a picked image and resolves to its upload id. */
export function useUploadImage() {
  return useMutation({
    mutationFn: AccountService.uploadImage,
    onError: (error) => handleApiError(error),
  });
}

/** The admin-configured verification fields. */
export function useVerificationForm(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.verification,
    queryFn: AccountService.getVerificationForm,
    enabled,
    meta: { suppressGlobalError: true },
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AccountService.submitVerification,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop }),
    onError: (error) => handleApiError(error),
  });
}

export function useUpdateBanners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AccountService.updateBanners,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop }),
    onError: (error) => handleApiError(error),
  });
}

export type ResolveStatus =
  | "off" // the flag is off: the name is typed by hand
  | "idle" // no bank or fewer than 10 digits yet
  | "checking"
  | "confirmed"
  | "not_found"
  | "unavailable"; // the check itself failed (offline, server error)

/**
 * Asks the backend for the account name once a bank and a full 10-digit
 * number are entered. Does nothing (and never calls the network) while
 * `isAccountResolveEnabled` is false.
 */
export function useResolveBankAccount(
  bankCode: string | null,
  accountNumber: string,
) {
  const ready =
    isAccountResolveEnabled &&
    bankCode !== null &&
    accountNumber.length === ACCOUNT_NUMBER_LENGTH &&
    /^\d+$/.test(accountNumber);

  const query = useQuery({
    queryKey: QUERY_KEYS.seller.account.resolve(bankCode ?? "", accountNumber),
    queryFn: () =>
      AccountService.resolveBankAccount({
        bankCode: bankCode ?? "",
        accountNumber,
      }),
    enabled: ready,
    retry: false,
    staleTime: 10 * 60 * 1000,
    meta: { suppressGlobalError: true },
  });

  let status: ResolveStatus = "idle";
  if (!isAccountResolveEnabled) status = "off";
  else if (!ready) status = "idle";
  else if (query.isSuccess) status = "confirmed";
  else if (query.isError) {
    // No response (offline, timeout) or a 5xx means the check itself failed;
    // anything else (4xx, `result: false`, no name) means "not found".
    const httpStatus = isAxiosError(query.error)
      ? (query.error.response?.status ?? 0)
      : 200;
    status =
      httpStatus === 0 || httpStatus >= 500 ? "unavailable" : "not_found";
  } else status = "checking";

  return {
    status,
    accountName: ready && query.isSuccess ? query.data.accountName : "",
    retry: () => {
      void query.refetch();
    },
  };
}
