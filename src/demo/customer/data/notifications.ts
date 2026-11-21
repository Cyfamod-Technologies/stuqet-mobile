import { minutesAgo, daysAgo } from "../format";
import type { DemoNotification, DemoOrder, DemoPersona } from "../types";

export function buildNotifications(
  persona: DemoPersona,
  now: Date,
  orders: DemoOrder[],
): DemoNotification[] {
  if (persona !== "customer") return [];
  const code = (id: number) => orders.find((o) => o.id === id)?.code ?? "";
  return [
    {
      id: 1,
      title: "Your order is on the way",
      body: `#${code(6001)} · Tunde is bringing it`,
      createdAt: minutesAgo(now, 2),
      unread: true,
      kind: "on_the_way",
      orderId: 6001,
      vendorId: 1,
    },
    {
      id: 2,
      title: "Order confirmed",
      body: `Mama T Kitchen accepted #${code(6001)}`,
      createdAt: minutesAgo(now, 20),
      unread: true,
      kind: "confirmed",
      orderId: 6001,
      vendorId: 1,
    },
    {
      id: 3,
      title: "Mama T Kitchen replied",
      body: "Sure, no problem. It is being packed now.",
      createdAt: minutesAgo(now, 34),
      unread: false,
      kind: "message",
      orderId: 6001,
      vendorId: 1,
    },
    {
      id: 4,
      title: "Order delivered",
      body: `#${code(6007)} was delivered`,
      createdAt: daysAgo(now, 3),
      unread: false,
      kind: "delivered",
      orderId: 6007,
      vendorId: 1,
    },
    {
      id: 5,
      title: "Order cancelled",
      body: `#${code(6010)} was cancelled by Suya Spot`,
      createdAt: daysAgo(now, 5),
      unread: false,
      kind: "cancelled",
      orderId: 6010,
      vendorId: 3,
    },
  ];
}
