import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import DashboardService from "./api";

export function useSalesStat() {
  return useQuery({
    queryKey: [...QUERY_KEYS.seller.dashboard, "sales-stat"] as const,
    queryFn: DashboardService.getSalesStat,
    meta: { suppressGlobalError: true },
  });
}
