import { format, isSameDay, subDays } from "date-fns";
import type {
  NotificationCategory,
  RawNotification,
  RawNotificationList,
  SellerNotification,
} from "./types";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** Parses the API's "November 21 2026, 3:04 pm"; Hermes can't parse it natively. */
export function parseNotificationDate(raw: string): Date | null {
  const match = /^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(
    raw.trim(),
  );
  if (!match) return null;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  if (month === -1) return null;
  let hours = Number(match[4]) % 12;
  if (match[6].toLowerCase() === "pm") hours += 12;
  return new Date(
    Number(match[3]),
    month,
    Number(match[2]),
    hours,
    Number(match[5]),
  );
}

/** "now", "2m", "1h", "Yesterday", "3d", or "12 Nov". */
export function shortTimeAgo(date: Date | null, now = new Date()): string {
  if (!date) return "";
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (isSameDay(date, now)) return `${Math.floor(minutes / 60)}h`;
  if (isSameDay(date, subDays(now, 1))) return "Yesterday";
  const days = Math.floor(minutes / 1440);
  if (days < 7) return `${days}d`;
  return format(date, "d MMM");
}

export function unwrapNotifications(
  data: RawNotification[] | RawNotificationList | null | undefined,
): RawNotification[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.data ?? []);
}

function categoryOf(type: string): NotificationCategory {
  if (type.endsWith("OrderNotification")) return "orders";
  if (type.endsWith("ShopProductNotification")) return "products";
  if (type.endsWith("PayoutNotification")) return "payouts";
  return "shop";
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function humanise(status: string): string {
  return status.replace(/_/g, " ").trim();
}

export function toNotification(
  raw: RawNotification,
  unreadIds: Set<string>,
): SellerNotification {
  const category = categoryOf(raw.type);
  const data = raw.data ?? {};
  const status = humanise(text(data.status));
  const message = raw.notification_text?.trim() ?? "";
  const base = {
    id: raw.id,
    category,
    unread: unreadIds.has(raw.id),
    createdAt: parseNotificationDate(raw.date),
  };

  if (category === "orders") {
    const code = text(data.order_code);
    const orderId = Number(data.order_id);
    const isNew = status === "placed";
    const icon =
      status === "delivered"
        ? "checkmark-circle-outline"
        : status === "cancelled"
          ? "close-circle-outline"
          : "receipt-outline";
    return {
      ...base,
      title: isNew
        ? `New order${code ? ` #${code}` : ""}`
        : `Order ${status || "updated"}`,
      message:
        message ||
        (code ? `#${code}${status ? ` is ${status}` : ""}` : "Order update"),
      icon,
      orderId: Number.isFinite(orderId) && orderId > 0 ? orderId : null,
    };
  }

  if (category === "products") {
    const name = text(data.name);
    return {
      ...base,
      title: name || "Product update",
      message: message || (status ? `Status: ${status}` : "Product update"),
      icon: "cube-outline",
      orderId: null,
    };
  }

  if (category === "payouts") {
    return {
      ...base,
      title: "Payout update",
      message: message || (status ? `Your payout is ${status}` : "Payout update"),
      icon: "wallet-outline",
      orderId: null,
    };
  }

  return {
    ...base,
    title: "Shop verification",
    message:
      message || (status ? `Your verification is ${status}` : "Shop update"),
    icon: "shield-checkmark-outline",
    orderId: null,
  };
}
