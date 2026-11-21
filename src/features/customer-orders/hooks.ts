import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiMessage } from "~/features/auth/errors";
import type { ChatMessage, ChatThread } from "./types";
import { handleApiError } from "~/lib/utils/error-handler";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { notifyInfo, notifySuccess } from "~/lib/utils/toast";
import OrdersService from "./api";

/** The Orders list refreshes while it is open, so statuses move on their own. */
const LIST_POLL_MS = 8_000;
/** Tracking polls faster: the rider dot and the steps follow the order. */
const TRACKING_POLL_MS = 3_000;
const CHAT_POLL_MS = 3_000;

export function useOrders(tab: "active" | "past") {
  return useQuery({
    queryKey: QUERY_KEYS.customer.orders.list(tab),
    queryFn: () => OrdersService.list(tab),
    refetchInterval: tab === "active" ? LIST_POLL_MS : false,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.orders.detail(id),
    queryFn: () => OrdersService.detail(id),
    enabled: Number.isFinite(id),
  });
}

export function useTracking(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.orders.tracking(id),
    queryFn: () => OrdersService.tracking(id),
    enabled: Number.isFinite(id),
    // Stop polling once the order reached a final status.
    refetchInterval: (query) =>
      query.state.data?.finished ? false : TRACKING_POLL_MS,
  });
}

export function useChat(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.orders.chat(id),
    queryFn: () => OrdersService.thread(id),
    enabled: Number.isFinite(id),
    refetchInterval: CHAT_POLL_MS,
    meta: { suppressGlobalError: true },
  });
}

/** Optimistic send: the bubble shows at once and is rolled back on error. */
export function useSendMessage(orderId: number) {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.customer.orders.chat(orderId);

  return useMutation({
    mutationFn: (text: string) => OrdersService.sendMessage(orderId, text),
    meta: { suppressGlobalError: true },
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChatThread>(key);
      if (previous) {
        const pending: ChatMessage = {
          id: Date.now(),
          mine: true,
          text,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<ChatThread>(key, {
          ...previous,
          messages: [...previous.messages, pending],
        });
      }
      return { previous };
    },
    onError: (error, _text, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      notifyInfo({
        message: getApiMessage(error) ?? "Message not sent. Try again.",
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: OrdersService.review,
    onSuccess: () => {
      notifySuccess({ message: "Thanks for your review" });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.orders.all,
      });
    },
    onError: (error) => handleApiError(error),
    meta: { suppressGlobalError: true },
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: OrdersService.reorder,
    onSuccess: (cart) => {
      queryClient.setQueryData(QUERY_KEYS.customer.cart, cart);
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

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.customer.notifications,
    queryFn: OrdersService.notifications,
    refetchInterval: LIST_POLL_MS,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: OrdersService.markNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.notifications,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customer.home,
      });
    },
    meta: { suppressGlobalError: true },
  });
}
