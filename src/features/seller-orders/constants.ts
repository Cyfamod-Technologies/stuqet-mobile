import type { DeliveryStatus, PaymentStatus } from "./types";

export const ORDERS_PER_PAGE = 10;

export const DELIVERY_LABELS: Record<DeliveryStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  picked_up: "Picked up",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Order of the stepper on the detail screen (cancelled is shown separately). */
export const DELIVERY_STEPS: DeliveryStatus[] = [
  "pending",
  "confirmed",
  "picked_up",
  "on_the_way",
  "delivered",
];

/** Options of the status sheet (the last one cancels the order). */
export const STATUS_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "picked_up", label: "Picked up" },
  { value: "on_the_way", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancel order" },
];

/** Chips of the orders list. "" means no delivery_status filter. */
export const DELIVERY_FILTERS: { value: DeliveryStatus | ""; label: string }[] =
  [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "picked_up", label: "Picked up" },
    { value: "on_the_way", label: "On the way" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

export const PAYMENT_FILTERS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];
