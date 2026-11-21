import { Badge } from "~/components/ui/badge";
import type { OrderStatus } from "../types";

const LABELS: Record<OrderStatus, string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked up",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const VARIANTS: Record<
  OrderStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pending: "warning",
  confirmed: "default",
  preparing: "default",
  ready: "default",
  picked_up: "neutral",
  on_the_way: "neutral",
  delivered: "success",
  cancelled: "destructive",
};

export const statusLabel = (status: OrderStatus) => LABELS[status];

// Order status pill (boards: On the way, Confirmed, Delivered, Cancelled).
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge label={LABELS[status]} variant={VARIANTS[status]} />;
}
