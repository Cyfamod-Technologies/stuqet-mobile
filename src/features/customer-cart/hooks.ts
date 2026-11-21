import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getApiMessage } from "~/features/auth/errors";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { notifyInfo } from "~/lib/utils/toast";
import CartService from "./api";
import type { Cart, CheckoutPreview } from "./types";
import type { FulfilmentMode } from "~/features/customer-food/types";

/** Thrown by `useAddToCart` when the cart holds another vendor's dishes. */
export function isDifferentVendor(error: unknown): string | null {
  if (isAxiosError(error) && error.response?.status === 409) {
    const data = error.response.data as { code?: string; vendorName?: string };
    if (data.code === "different_vendor")
      return data.vendorName ?? "another vendor";
  }
  return null;
}

export function useCart() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.cart,
    queryFn: CartService.cart,
  });
}

/** Cart responses are the new cart: write them straight into the cache. */
function useCartMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<Cart>,
  onError?: (error: unknown) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(QUERY_KEYS.customer.cart, cart);
      // The Home cart badge and checkout totals follow the cart.
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.home,
      });
      void queryClient.invalidateQueries({
        queryKey: ["customer", "checkout"],
      });
    },
    onError: onError ?? ((error) => handleApiError(error)),
    meta: { suppressGlobalError: true },
  });
}

export const useAddToCart = () =>
  useCartMutation(CartService.addItem, (error) => {
    // 409 is handled by the screen (it asks to start a new cart).
    if (isDifferentVendor(error)) return;
    const text = getApiMessage(error);
    if (text) notifyInfo({ message: text });
    else handleApiError(error);
  });

export const useRemoveCartItem = () => useCartMutation(CartService.removeItem);
export const useRemoveVendorGroup = () =>
  useCartMutation(CartService.removeVendor);
export const useRemoveCoupon = () => useCartMutation(CartService.removeCoupon);

/** Wrong codes are shown inline under the field, so no toast here. */
export const useApplyCoupon = () =>
  useCartMutation(
    ({ vendorId, code }: { vendorId: number; code: string }) =>
      CartService.applyCoupon(vendorId, code),
    () => {},
  );

/** Quantity and note changes feel instant (docs/optimistic-updates.md). */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.customer.cart;

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: number;
      quantity?: number;
      note?: string | null;
    }) => CartService.updateItem(id, input),
    meta: { suppressGlobalError: true },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Cart>(key);
      if (previous && quantity !== undefined) {
        queryClient.setQueryData<Cart>(key, {
          ...previous,
          groups: previous.groups.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              item.id === id
                ? { ...item, quantity, lineTotal: item.unitPrice * quantity }
                : item,
            ),
          })),
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      handleApiError(error);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({
        queryKey: ["customer", "checkout"],
      });
    },
  });
}

export function useCheckout(params: {
  vendorId: number;
  mode: FulfilmentMode;
  addressId: number | null;
}) {
  return useQuery<CheckoutPreview>({
    queryKey: QUERY_KEYS.customer.checkout(params),
    queryFn: () => CartService.checkout(params),
    enabled: Number.isFinite(params.vendorId),
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CartService.placeOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.cart,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.orders.all,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.home,
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
