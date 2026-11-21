import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import OrdersService from "./api";
import type {
  DeliveryStatus,
  OrderDetail,
  OrderFilters,
  OrdersPage,
  UpdateDeliveryStatusInput,
} from "./types";

/** Paginated list for the Orders tab (infinite scroll, 10 per page). */
export function useOrders(filters: OrderFilters) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.seller.orders.list({ ...filters, infinite: true }),
    queryFn: ({ pageParam }) => OrdersService.list(pageParam, filters),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    meta: { suppressGlobalError: true },
  });
}

export interface OrderCount {
  count: number;
  /** Newest matching order, so a single order can be opened directly. */
  latestId: number | null;
}

/** Number of orders in a delivery status (uses the paginator's total). */
export function useOrderCount(deliveryStatus: DeliveryStatus) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.orders.list({ deliveryStatus, count: true }),
    queryFn: async (): Promise<OrderCount> => {
      const page = await OrdersService.list(1, { deliveryStatus });
      return {
        count: page.total ?? page.orders.length,
        latestId: page.orders[0]?.id ?? null,
      };
    },
    meta: { suppressGlobalError: true },
  });
}

/** The latest orders, for Home. */
export function useRecentOrders(limit = 3) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.orders.list({ recent: true }),
    queryFn: async () => (await OrdersService.list(1)).orders.slice(0, limit),
    meta: { suppressGlobalError: true },
  });
}

export function useOrderDetail(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.orders.detail(id),
    queryFn: () => OrdersService.getDetail(id),
    enabled: Number.isFinite(id),
    meta: { suppressGlobalError: true },
  });
}

type OrdersCache = InfiniteData<OrdersPage> | OrdersPage | OrderDetail;

function isInfinite(data: unknown): data is InfiniteData<OrdersPage> {
  return typeof data === "object" && data !== null && "pages" in data;
}

function isPage(data: unknown): data is OrdersPage {
  return typeof data === "object" && data !== null && "orders" in data;
}

function isDetail(data: unknown): data is OrderDetail {
  return typeof data === "object" && data !== null && "items" in data;
}

function patchPage(
  page: OrdersPage,
  orderId: number,
  status: DeliveryStatus,
): OrdersPage {
  return {
    ...page,
    orders: page.orders.map((order) =>
      order.id === orderId ? { ...order, deliveryStatus: status } : order,
    ),
  };
}

/** Apply a new delivery status to one cached orders query (list, page or detail). */
function patchCache(
  data: OrdersCache | undefined,
  orderId: number,
  status: DeliveryStatus,
): OrdersCache | undefined {
  if (!data) return data;
  if (isInfinite(data)) {
    return {
      ...data,
      pages: data.pages.map((page) => patchPage(page, orderId, status)),
    };
  }
  if (isPage(data)) return patchPage(data, orderId, status);
  if (isDetail(data) && data.id === orderId) {
    return { ...data, deliveryStatus: status };
  }
  return data;
}

/**
 * Change an order's delivery status. Optimistic (docs/optimistic-updates.md):
 * every cached orders query is patched at once and rolled back if the request
 * fails. Delivered/cancelled locks are enforced by the UI, not the backend.
 */
export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDeliveryStatusInput) =>
      OrdersService.updateDeliveryStatus(input),
    meta: { suppressGlobalError: true },

    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.seller.orders.all,
      });

      const snapshot: [QueryKey, OrdersCache | undefined][] =
        queryClient.getQueriesData<OrdersCache>({
          queryKey: QUERY_KEYS.seller.orders.all,
        });

      queryClient.setQueriesData<OrdersCache>(
        { queryKey: QUERY_KEYS.seller.orders.all },
        (old) => patchCache(old, orderId, status),
      );

      return { snapshot };
    },

    onError: (error, _input, context) => {
      context?.snapshot.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      handleApiError(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.orders.all });
      // Delivered orders and sales on the shop and Home change with status.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.dashboard });
    },
  });
}

/** Confirm cash/offline payment. Not optimistic: waits for the server. */
export function useMarkOrderPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => OrdersService.markAsPaid(orderId),
    meta: { suppressGlobalError: true },
    onError: (error) => handleApiError(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.shop });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.dashboard });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seller.money.payments,
      });
    },
  });
}
