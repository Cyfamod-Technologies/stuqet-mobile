import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { handleApiError } from "~/lib/utils/error-handler";
import FoodService from "./api";
import type { SearchParams } from "./types";

export function useHome() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.home,
    queryFn: FoodService.home,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.categories,
    queryFn: FoodService.categories,
    staleTime: 10 * 60_000,
  });
}

export function useMenu(vendorId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.menu(vendorId),
    queryFn: () => FoodService.menu(vendorId),
    enabled: Number.isFinite(vendorId),
  });
}

export function useDish(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.dish(id),
    queryFn: () => FoodService.dish(id),
    enabled: Number.isFinite(id),
  });
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.search(params),
    queryFn: () => FoodService.search(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.trending,
    queryFn: FoodService.trending,
    staleTime: 10 * 60_000,
  });
}

/** Heart toggles: refetch what shows hearts (Home, menus, dish) afterwards. */
function useFavouriteToggle(call: (id: number) => Promise<boolean>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: call,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customer", "menu"] });
      void queryClient.invalidateQueries({ queryKey: ["customer", "dish"] });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.home,
      });
      void queryClient.invalidateQueries({ queryKey: ["customer", "search"] });
    },
    onError: (error) => handleApiError(error),
  });
}

export const useToggleVendorFavourite = () =>
  useFavouriteToggle(FoodService.toggleVendorFavourite);
export const useToggleDishFavourite = () =>
  useFavouriteToggle(FoodService.toggleDishFavourite);
