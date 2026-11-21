import { minutesAgo } from "../format";
import type { DemoNotification, DemoOrder } from "../types";
import { customerById } from "./customers";
import { orderTotal } from "./orders";
import { naira } from "../format";

/** Notifications derived from the shop's newest orders plus fixed payout,
 * product and verification updates. */
export function buildNotifications(
  now: Date,
  orders: DemoOrder[],
): DemoNotification[] {
  const newest = [...orders].sort((a, b) => b.id - a.id);
  const list: DemoNotification[] = [];
  let n = 1;
  const push = (entry: Omit<DemoNotification, "id">) =>
    list.push({ ...entry, id: `demo-notification-${n++}` });

  const placed = newest.filter(
    (o) => o.deliveryStatus === "pending" || o.deliveryStatus === "confirmed",
  );
  placed.slice(0, 2).forEach((order, index) => {
    const customer = customerById(order.customerId);
    const count = order.items.reduce((sum, i) => sum + i.quantity, 0);
    push({
      kind: "Order",
      data: {
        order_id: order.id,
        order_code: order.code,
        status: "placed",
      },
      text: `${customer.name} ordered ${count} item${count === 1 ? "" : "s"}, ${naira(orderTotal(order)).replace(".00", "")}`,
      at: minutesAgo(now, index === 0 ? 2 : 60),
      unread: true,
    });
  });

  push({
    kind: "Payout",
    data: { status: "pending" },
    text: "Your payout request is being processed",
    at: minutesAgo(now, 240),
    unread: true,
  });

  const delivered = newest.find((o) => o.deliveryStatus === "delivered");
  if (delivered) {
    push({
      kind: "Order",
      data: {
        order_id: delivered.id,
        order_code: delivered.code,
        status: "delivered",
      },
      text: `${delivered.code} was marked delivered`,
      at: minutesAgo(now, 60 * 26),
      unread: false,
    });
  }

  const cancelled = newest.find((o) => o.deliveryStatus === "cancelled");
  if (cancelled) {
    push({
      kind: "Order",
      data: {
        order_id: cancelled.id,
        order_code: cancelled.code,
        status: "cancelled",
      },
      text: `${cancelled.code} was cancelled by the buyer`,
      at: minutesAgo(now, 60 * 48),
      unread: false,
    });
  }

  push({
    kind: "ShopProduct",
    data: { name: "Bluetooth speaker", status: "pending approval" },
    text: "Your listing is waiting for approval",
    at: minutesAgo(now, 60 * 30),
    unread: false,
  });
  push({
    kind: "ShopProduct",
    data: { name: "Stuqet hoodie", status: "approved" },
    text: "Your listing is now live",
    at: minutesAgo(now, 60 * 72),
    unread: false,
  });
  push({
    kind: "Payout",
    data: { status: "paid" },
    text: "Your payout of ₦25,500 was sent to your bank",
    at: minutesAgo(now, 60 * 24 * 5),
    unread: false,
  });
  push({
    kind: "ShopVerification",
    data: { status: "pending" },
    text: "Verify your shop to get the verified badge",
    at: minutesAgo(now, 60 * 24 * 6),
    unread: false,
  });

  return list;
}
