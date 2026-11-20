import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { handleApiError } from "~/lib/utils/error-handler";
import AccountService from "./api";

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
