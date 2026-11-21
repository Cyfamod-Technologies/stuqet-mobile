import { Badge } from "~/components/ui/badge";
import { DELIVERY_LABELS } from "../constants";
import type { DeliveryStatus, PaymentStatus } from "../types";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const DELIVERY_VARIANTS: Record<DeliveryStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "default",
  picked_up: "outline",
  on_the_way: "outline",
  delivered: "success",
  cancelled: "destructive",
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <Badge
      label={DELIVERY_LABELS[status]}
      variant={DELIVERY_VARIANTS[status]}
    />
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      label={status === "paid" ? "Paid" : "Unpaid"}
      variant={status === "paid" ? "success" : "destructive"}
    />
  );
}
