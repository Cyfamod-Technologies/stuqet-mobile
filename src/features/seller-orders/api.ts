import { axiosPrivate } from "~/lib/config/axios";
import { ORDERS_PER_PAGE } from "./constants";
import type {
  OrderDetail,
  OrderFilters,
  OrdersPage,
  RawOrderDetail,
  RawOrdersResponse,
  UpdateDeliveryStatusInput,
} from "./types";
import { mapOrderDetail, mapOrderSummary } from "./utils";

const OrdersService = {
  /** GET /seller/orders — fixed 10 per page, filters are delivery/payment status. */
  list: async (
    page: number,
    filters: OrderFilters = {},
  ): Promise<OrdersPage> => {
    const { data } = await axiosPrivate.get<RawOrdersResponse>(
      "/seller/orders",
      {
        params: {
          page,
          delivery_status: filters.deliveryStatus,
          payment_status: filters.paymentStatus,
        },
      },
    );
    const rows = data.data ?? [];
    return {
      orders: rows.map(mapOrderSummary),
      page,
      hasMore: data.meta
        ? data.meta.current_page < data.meta.last_page
        : rows.length >= ORDERS_PER_PAGE,
      total: data.meta?.total ?? null,
    };
  },

  /**
   * GET /seller/orders/details/{id}. The resource already embeds the items
   * (name, quantity x variation, price), so orders/items/{id} is not needed.
   */
  getDetail: async (id: number): Promise<OrderDetail> => {
    const { data } = await axiosPrivate.get<{ data: RawOrderDetail[] }>(
      `/seller/orders/details/${id}`,
    );
    const raw = data.data?.[0];
    if (!raw) throw new Error("This order could not be found.");
    return mapOrderDetail(id, raw);
  },

  updateDeliveryStatus: async ({
    orderId,
    status,
  }: UpdateDeliveryStatusInput): Promise<void> => {
    await axiosPrivate.post("/seller/orders/update-delivery-status", {
      order_id: orderId,
      status,
    });
  },

  markAsPaid: async (orderId: number): Promise<void> => {
    await axiosPrivate.post("/seller/orders/update-payment-status", {
      order_id: orderId,
      status: "paid",
    });
  },
};

export default OrdersService;
