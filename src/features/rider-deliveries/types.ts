// Rider (delivery boy) DTOs. Field names follow the real endpoints in
// routes/api.php (`v2/delivery-boy/*`, DeliveryBoyController); fields marked
// "extension" are not sent by the backend yet (see TODO(backend) in api.ts).

export type DeliveryTab =
  "assigned" | "picked_up" | "on_the_way" | "completed" | "cancelled";

/** `delivery_status` of an order. A new assignment is `pending`. */
export type DeliveryStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

/** GET /delivery-boy/dashboard-summary/{id} (+ extensions). */
export interface DashboardSummary {
  completed_delivery: number;
  pending_delivery: number;
  total_collection: string;
  total_earning: string;
  cancelled: number;
  on_the_way: number;
  picked: number;
  assigned: number;
  /** extension: earnings of today, "₦6,400". */
  today_earning: string;
  /** extension: cash collected today, "₦12,500". */
  today_collection: string;
  /** extension: yesterday's earnings. */
  yesterday_earning: string;
}

export interface DeliveryItem {
  id: number;
  code: string;
  payment_type: string;
  payment_status: "paid" | "unpaid";
  delivery_status: DeliveryStatus;
  delivery_status_string: string;
  grand_total: string;
  date: string;
  cancel_request: boolean;
  /** extension */
  amount: number;
  pickup_name: string;
  pickup_logo: string | null;
  dropoff_area: string;
  /** "Placed 02 Jan 2026" or "02 Jan 2026". */
  date_label: string;
}

export interface DeliveryStop {
  name: string;
  address: string;
  phone: string;
  /** Vendor logo for the pickup stop. */
  logo?: string | null;
}

/** GET /delivery-boy/purchase-history-details/{id} (+ extensions). */
export interface DeliveryDetail extends DeliveryItem {
  pickup: DeliveryStop;
  dropoff: DeliveryStop;
  /** Whether the rider collects cash for this order. */
  cash: boolean;
}

export type DeliveryStatusChange = "picked_up" | "on_the_way" | "delivered";

/** GET /delivery-boy/earning-summary/{id}. */
export interface EarningSummary {
  today_date: string;
  today_earning: string;
  yesterday_date: string;
  yesterday_earning: string;
}

export interface HistoryRow {
  id: number;
  order_id: number;
  order_code: string;
  delivery_status: string;
  earning: string;
  collection: string;
  payment_type: string;
  date: string;
  /** extension: numbers, so the screens can format "₦800". */
  earning_amount: number;
  collection_amount: number;
}
