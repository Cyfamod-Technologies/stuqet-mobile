import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import ShopService from "./api";
import type { ShopType } from "./types";

/** The signed-in seller's shop (name, logo, balance, verification, bank…). */
export function useShopInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.shop,
    queryFn: ShopService.getInfo,
  });
}

/**
 * Which Home layout a shop gets. Shops can sell products and food, and the API
 * does not expose a business category yet, so this falls back to "product".
 */
export function useShopType(): ShopType {
  const { data } = useShopInfo();
  return data?.business_category ?? "product";
}
