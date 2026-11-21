import { axiosPrivate } from "~/lib/config/axios";
import type {
  DashboardSummary,
  DeliveryDetail,
  DeliveryItem,
  DeliveryStatusChange,
  DeliveryTab,
  EarningSummary,
  HistoryRow,
} from "./types";

// Routes are the real ones in routes/api.php (`v2/delivery-boy/*`); `{id}` is
// the rider's user id. TODO(backend), extensions the screens rely on:
//  - dashboard-summary: `today_earning`, `today_collection`, `yesterday_earning`
//  - the delivery lists: `pickup_name`, `pickup_logo`, `dropoff_area`, `amount`,
//    `date_label` (vendor and drop-off are not in the product order resource)
//  - purchase-history-details/{id}: the `pickup` and `dropoff` stops
//  - earning/{id}, collection/{id}: numeric `earning_amount`, `collection_amount`
//  - change-delivery-status also takes `delivery_boy_id` (as it does today)

const DeliveriesService = {
  dashboard: async (riderId: number): Promise<DashboardSummary> =>
    (
      await axiosPrivate.get<DashboardSummary>(
        `/delivery-boy/dashboard-summary/${riderId}`,
      )
    ).data,

  list: async (riderId: number, tab: DeliveryTab): Promise<DeliveryItem[]> =>
    (
      await axiosPrivate.get<{ data: DeliveryItem[] }>(
        `/delivery-boy/deliveries/${tab}/${riderId}`,
      )
    ).data.data,

  detail: async (id: number): Promise<DeliveryDetail> => {
    const { data } = await axiosPrivate.get<{ data: DeliveryDetail[] }>(
      `/delivery-boy/purchase-history-details/${id}`,
    );
    return data.data[0];
  },

  changeStatus: async (input: {
    orderId: number;
    riderId: number;
    status: DeliveryStatusChange;
  }): Promise<void> => {
    await axiosPrivate.post("/delivery-boy/change-delivery-status", {
      order_id: input.orderId,
      delivery_boy_id: input.riderId,
      status: input.status,
    });
  },

  // GET /delivery-boy/cancel-request/{orderId}: the team reviews it.
  requestCancellation: async (orderId: number): Promise<void> => {
    await axiosPrivate.get(`/delivery-boy/cancel-request/${orderId}`);
  },

  earningSummary: async (riderId: number): Promise<EarningSummary> =>
    (
      await axiosPrivate.get<EarningSummary>(
        `/delivery-boy/earning-summary/${riderId}`,
      )
    ).data,

  earnings: async (riderId: number): Promise<HistoryRow[]> =>
    (
      await axiosPrivate.get<{ data: HistoryRow[] }>(
        `/delivery-boy/earning/${riderId}`,
      )
    ).data.data,

  collections: async (riderId: number): Promise<HistoryRow[]> =>
    (
      await axiosPrivate.get<{ data: HistoryRow[] }>(
        `/delivery-boy/collection/${riderId}`,
      )
    ).data.data,
};

export default DeliveriesService;
