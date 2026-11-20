import type { Ionicons } from "@expo/vector-icons";

export type NotificationCategory = "orders" | "products" | "payouts" | "shop";

export type NotificationFilter = "all" | "orders" | "products" | "payouts";

/** One entry of GET all-notification / unread-notifications (NotificationCollection). */
export interface RawNotification {
  id: string;
  isChecked: boolean;
  /** Laravel notification class, e.g. "App\\Notifications\\OrderNotification". */
  type: string;
  data: Record<string, unknown>;
  /** Admin-configured text for the notification type. */
  notification_text: string | null;
  image: string | null;
  /** "F j Y, g:i a", e.g. "November 21 2026, 3:04 pm". */
  date: string;
}

export interface RawNotificationList {
  data: RawNotification[];
}

export interface RawUnreadResponse {
  count: number;
  /** Serialised resource: `{ data: [...] }` (or a bare array, defensively). */
  data: RawNotification[] | RawNotificationList | null;
}

export interface SellerNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  /** Set for order notifications so a tap can open the order. */
  orderId: number | null;
  unread: boolean;
  createdAt: Date | null;
}
