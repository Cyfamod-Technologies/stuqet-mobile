import { axiosPrivate } from "~/lib/config/axios";
import type { Cart } from "~/features/customer-cart/types";
import type {
  AppNotification,
  ChatThread,
  OrderDetail,
  OrderSummary,
  ReviewInput,
  Tracking,
} from "./types";

// TODO(backend): proposed food order endpoints. The real `purchase-history`,
// `order/cancel`, `re-order`, `chat/*` and `reviews/submit` routes work on
// product orders and shop conversations:
//   GET  /food/orders?tab=active|past        -> { data: OrderSummary[] }
//   GET  /food/orders/{id}                   -> OrderDetail
//   GET  /food/orders/{id}/tracking          -> Tracking (status steps, rider, map position)
//   GET  /food/orders/{id}/messages          -> ChatThread
//   POST /food/orders/{id}/messages          -> { text }      (maps to chat/insert-message)
//   POST /food/orders/{id}/review            -> { rating, comment }
//   POST /food/orders/{id}/reorder           -> Cart          (fills the cart with the same dishes)
//   GET  /food/notifications                 -> { data: AppNotification[] }
//   POST /food/notifications/read

const OrdersService = {
  list: async (tab: "active" | "past"): Promise<OrderSummary[]> =>
    (
      await axiosPrivate.get<{ data: OrderSummary[] }>("/food/orders", {
        params: { tab },
      })
    ).data.data,

  detail: async (id: number): Promise<OrderDetail> =>
    (await axiosPrivate.get<OrderDetail>(`/food/orders/${id}`)).data,

  tracking: async (id: number): Promise<Tracking> =>
    (await axiosPrivate.get<Tracking>(`/food/orders/${id}/tracking`)).data,

  thread: async (id: number): Promise<ChatThread> =>
    (await axiosPrivate.get<ChatThread>(`/food/orders/${id}/messages`)).data,

  sendMessage: async (id: number, text: string): Promise<void> => {
    await axiosPrivate.post(`/food/orders/${id}/messages`, { text });
  },

  review: async (input: ReviewInput): Promise<void> => {
    await axiosPrivate.post(`/food/orders/${input.orderId}/review`, {
      rating: input.rating,
      comment: input.comment,
    });
  },

  reorder: async (id: number): Promise<Cart> =>
    (await axiosPrivate.post<Cart>(`/food/orders/${id}/reorder`)).data,

  notifications: async (): Promise<AppNotification[]> =>
    (await axiosPrivate.get<{ data: AppNotification[] }>("/food/notifications"))
      .data.data,

  markNotificationsRead: async (): Promise<void> => {
    await axiosPrivate.post("/food/notifications/read");
  },
};

export default OrdersService;
