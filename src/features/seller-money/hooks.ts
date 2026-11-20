import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { handleApiError } from "~/lib/utils/error-handler";
import MoneyService from "./api";
import { MONEY_SETTINGS_KEY } from "./constants";
import type { LaravelPage } from "./types";

function nextPageParam<T>(lastPage: LaravelPage<T>): number | undefined {
  const meta = lastPage.meta;
  if (!meta) return undefined;
  return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
}

interface ListOptions {
  /** Only fetch while the tab is visible. */
  enabled?: boolean;
}

export function usePayments({ enabled = true }: ListOptions = {}) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.seller.money.payments,
    queryFn: ({ pageParam }) => MoneyService.getPayments(pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
    meta: { suppressGlobalError: true },
  });
}

export function useWithdrawals({ enabled = true }: ListOptions = {}) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.seller.money.withdrawals,
    queryFn: ({ pageParam }) => MoneyService.getWithdrawals(pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
    meta: { suppressGlobalError: true },
  });
}

export function useCommissions({ enabled = true }: ListOptions = {}) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.seller.money.commissions,
    queryFn: ({ pageParam }) => MoneyService.getCommissions(pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
    meta: { suppressGlobalError: true },
  });
}

/** Minimum withdrawal and the fixed commission rate (both optional). */
export function useMoneySettings() {
  return useQuery({
    queryKey: MONEY_SETTINGS_KEY,
    queryFn: MoneyService.getSettings,
    staleTime: 60 * 60 * 1000,
    meta: { suppressGlobalError: true },
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: MoneyService.requestWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seller.money.withdrawals,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop });
    },
    onError: (error) => handleApiError(error),
  });
}
