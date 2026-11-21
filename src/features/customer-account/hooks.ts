import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import AccountService from "./api";

export function useSchools(search: string) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.schools(search),
    queryFn: () => AccountService.schools(search),
    staleTime: 5 * 60_000,
  });
}

export function useStates() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.states,
    queryFn: AccountService.states,
    staleTime: Infinity,
  });
}

export function useCities(stateId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.cities(stateId ?? 0),
    queryFn: () => AccountService.cities(stateId as number),
    enabled: stateId !== null,
    staleTime: Infinity,
  });
}

export function useAreas(cityId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.areas(cityId ?? 0),
    queryFn: () => AccountService.areas(cityId as number),
    enabled: cityId !== null,
    staleTime: Infinity,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.profile,
    queryFn: AccountService.profile,
    meta: { suppressGlobalError: true },
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AccountService.saveProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.profile,
      });
      // The school shows on Home and the menus.
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.home,
      });
    },
    onError: (error) => handleApiError(error),
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.addresses,
    queryFn: AccountService.addresses,
  });
}

export function useSaveAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AccountService.saveAddress,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.addresses,
      }),
    onError: (error) => handleApiError(error),
  });
}

export function useMakeDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AccountService.makeDefault,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.addresses,
      }),
    onError: (error) => handleApiError(error),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AccountService.deleteAddress,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.addresses,
      }),
    onError: (error) => handleApiError(error),
  });
}
