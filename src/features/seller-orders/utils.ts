import { format } from "date-fns";
import type {
  DeliveryStatus,
  OrderDetail,
  OrderSummary,
  PaymentStatus,
  RawOrderDetail,
  RawOrderSummary,
} from "./types";

const DELIVERY_STATUSES: DeliveryStatus[] = [
  "pending",
  "confirmed",
  "picked_up",
  "on_the_way",
  "delivered",
  "cancelled",
];

/** The list endpoint sends "picked up"; the detail endpoint "picked_up". */
export function toDeliveryStatus(raw: string | null | undefined): DeliveryStatus {
  const normalised = (raw ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  return DELIVERY_STATUSES.find((s) => s === normalised) ?? "pending";
}

export function toPaymentStatus(raw: string | null | undefined): PaymentStatus {
  return raw === "paid" ? "paid" : "unpaid";
}

/** Delivered and cancelled orders cannot be changed again (UI rule). */
export function isOrderLocked(status: DeliveryStatus): boolean {
  return status === "delivered" || status === "cancelled";
}

/** Cash on delivery and offline (manual) payments are confirmed by the seller. */
export function canMarkAsPaid(
  paymentStatus: PaymentStatus,
  paymentMethod: string,
): boolean {
  if (paymentStatus === "paid") return false;
  return (
    paymentMethod === "cash_on_delivery" ||
    paymentMethod.startsWith("manual_payment") ||
    paymentMethod === "offline_payment"
  );
}

/** "21-11-2026" (d-m-Y from the API) to "21 Nov 2026". */
export function formatOrderDate(raw: string): string {
  const [day, month, year] = raw.split("-").map(Number);
  if (!day || !month || !year) return raw;
  return format(new Date(year, month - 1, day), "dd MMM yyyy");
}

export function mapOrderSummary(raw: RawOrderSummary): OrderSummary {
  return {
    id: raw.id,
    code: raw.order_code,
    total: raw.total,
    date: raw.order_date,
    paymentStatus: toPaymentStatus(raw.payment_status),
    deliveryStatus: toDeliveryStatus(raw.delivery_status),
  };
}

/** "2 x Black" -> { quantity: "2", variation: "Black" }. */
function parseDescription(description: string): {
  quantity: string;
  variation: string | null;
} {
  const index = description.indexOf(" x ");
  if (index === -1) return { quantity: description.trim(), variation: null };
  return {
    quantity: description.slice(0, index).trim(),
    variation: description.slice(index + 3).trim() || null,
  };
}

export function mapOrderDetail(id: number, raw: RawOrderDetail): OrderDetail {
  const address = raw.shipping_address;
  const addressLine = address
    ? [address.address, address.city, address.state, address.country]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(", ")
    : "";

  return {
    id,
    code: raw.order_code,
    total: raw.total,
    date: raw.order_date,
    paymentStatus: toPaymentStatus(raw.payment_status),
    paymentMethod: raw.payment_method ?? "",
    paymentLabel: raw.payment_type || "Not specified",
    deliveryStatus: toDeliveryStatus(raw.delivery_status),
    customer: {
      name: address?.name?.trim() || "Customer",
      phone: address?.phone?.trim() || null,
      address: addressLine || null,
    },
    items: raw.order_items.map((item) => ({
      name: item.name ?? "Item no longer available",
      ...parseDescription(item.description ?? ""),
      price: item.price,
    })),
    subtotal: raw.subtotal,
    tax: raw.tax,
    shipping: raw.shipping_cost,
    couponDiscount: raw.coupon_discount,
  };
}

/** True when a formatted money string such as "₦0.00" is above zero. */
export function isPositiveMoney(value: string): boolean {
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount > 0;
}
