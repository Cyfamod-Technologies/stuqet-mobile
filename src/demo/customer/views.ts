import type {
  Dish,
  DishSummary,
  VendorSummary,
} from "~/features/customer-food/types";
import type { Cart, CartGroup } from "~/features/customer-cart/types";
import type {
  OrderDetail,
  OrderStatus,
  OrderSummary,
  TrackStep,
  Tracking,
} from "~/features/customer-orders/types";
import { agoShort, money } from "./format";
import { customerImage } from "./images";
import { COUPONS } from "./data/places";
import { AUTO_SCHEDULE, TRACK_ROUTE, pointOnRoute } from "./data/track";
import { dishById, vendorById } from "./data/vendors";
import type { DemoCustomerDb } from "./db";
import { priceLine } from "./pricing";
import type {
  DemoDish,
  DemoNotification,
  DemoOrder,
  DemoVendor,
} from "./types";

const img = (key: Parameters<typeof customerImage>[0] | null) =>
  key ? customerImage(key) : null;

export function vendorView(db: DemoCustomerDb, v: DemoVendor): VendorSummary {
  return {
    id: v.id,
    name: v.name,
    logo: img(v.logo),
    cover: img(v.cover),
    rating: v.rating,
    reviewCount: v.reviewCount,
    etaMinutes: v.etaMinutes,
    prepMinutes: v.prepMinutes,
    deliveryFee: v.deliveryFee,
    isOpen: v.isOpen,
    opensLabel: v.opensLabel,
    school: db.school,
    modes: v.modes,
    categories: v.categories,
    isFavourite: db.favouriteVendors.has(v.id),
  };
}

export function dishSummary(db: DemoCustomerDb, d: DemoDish): DishSummary {
  const vendor = vendorById(d.vendorId);
  return {
    id: d.id,
    vendorId: d.vendorId,
    vendorName: vendor?.name ?? "",
    vendorLogo: img(vendor?.logo ?? null),
    name: d.name,
    description: d.description,
    price: d.sizes[0]?.price ?? d.price,
    image: img(d.image),
    section: d.section,
    prepMinutes: d.prepMinutes,
    status:
      vendor && !vendor.isOpen && d.status === "available"
        ? "available"
        : d.status,
    availableWindow: d.availableWindow,
    isFavourite: db.favouriteDishes.has(d.id),
  };
}

export function dishView(db: DemoCustomerDb, d: DemoDish): Dish {
  return {
    ...dishSummary(db, d),
    modes: d.modes,
    sizes: d.sizes,
    addOns: d.addOns,
  };
}

// --- Cart ------------------------------------------------------------------

export function discountFor(code: string | undefined, subtotal: number) {
  const coupon = COUPONS.find((c) => c.code === code);
  if (!coupon) return null;
  const amount = Math.min(
    coupon.cap,
    Math.round((subtotal * coupon.percent) / 100),
  );
  return {
    code: coupon.code,
    amount,
    message: `${coupon.percent}% off food, up to ${money(coupon.cap)}. You save ${money(amount)} on this order.`,
  };
}

export function buildCart(db: DemoCustomerDb): Cart {
  const byVendor = new Map<number, typeof db.cart>();
  for (const line of db.cart) {
    const dish = dishById(line.dishId);
    if (!dish) continue;
    byVendor.set(dish.vendorId, [...(byVendor.get(dish.vendorId) ?? []), line]);
  }
  const groups: CartGroup[] = [];
  for (const [vendorId, lines] of byVendor) {
    const vendor = vendorById(vendorId);
    if (!vendor) continue;
    const items = lines.map((line) => {
      const dish = dishById(line.dishId) as DemoDish;
      const priced = priceLine(dish, line.sizeId, line.addOnIds);
      return {
        id: line.id,
        dishId: dish.id,
        name: dish.name,
        image: img(dish.image),
        variation: priced.variation,
        quantity: line.quantity,
        unitPrice: priced.unitPrice,
        lineTotal: priced.unitPrice * line.quantity,
        note: line.note,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const coupon = discountFor(db.coupons.get(vendorId), subtotal);
    const discount = coupon?.amount ?? 0;
    groups.push({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        logo: img(vendor.logo),
        prepMinutes: vendor.prepMinutes,
        arriveMinutes: vendor.etaMinutes,
      },
      items,
      subtotal,
      deliveryFee: vendor.deliveryFee,
      discount,
      total: subtotal + vendor.deliveryFee - discount,
      coupon: coupon
        ? { code: coupon.code, message: coupon.message, amount: coupon.amount }
        : null,
    });
  }
  return {
    groups,
    count: db.cart.reduce((sum, line) => sum + line.quantity, 0),
  };
}

// --- Orders ----------------------------------------------------------------

const RANK: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
  on_the_way: 5,
  delivered: 6,
  cancelled: -1,
};

export const orderSubtotal = (order: DemoOrder) =>
  order.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

export const orderTotal = (order: DemoOrder) =>
  orderSubtotal(order) +
  (order.mode === "delivery" ? order.deliveryFee : 0) -
  order.discount;

const STATUS_NOTE: Partial<
  Record<
    OrderStatus,
    {
      title: string;
      body: (d: DemoOrder, v: string) => string;
      kind: DemoNotification["kind"];
    }
  >
> = {
  confirmed: {
    title: "Order confirmed",
    body: (o, v) => `${v} accepted #${o.code}`,
    kind: "confirmed",
  },
  on_the_way: {
    title: "Your order is on the way",
    body: (o) => `#${o.code} · ${o.rider?.name ?? "A rider"} is bringing it`,
    kind: "on_the_way",
  },
  delivered: {
    title: "Order delivered",
    body: (o) => `#${o.code} was delivered`,
    kind: "delivered",
  },
};

function autoStatus(
  order: DemoOrder,
  now: Date,
): { status: OrderStatus; elapsed: number } {
  const elapsed = order.autoFrom
    ? (now.getTime() - order.autoFrom.getTime()) / 1000
    : 0;
  let status: OrderStatus = "pending";
  for (const [name, at] of AUTO_SCHEDULE) if (elapsed >= at) status = name;
  return { status, elapsed };
}

/** Moves an auto order along its schedule, adding the matching notifications. */
export function syncOrder(db: DemoCustomerDb, order: DemoOrder): OrderStatus {
  if (
    !order.autoFrom ||
    order.status === "delivered" ||
    order.status === "cancelled"
  ) {
    return order.status;
  }
  const { status } = autoStatus(order, new Date());
  if (status !== order.status) {
    // Walk through the statuses skipped since the last look, so each shows once.
    const vendorName = vendorById(order.vendorId)?.name ?? "The kitchen";
    for (const [name] of AUTO_SCHEDULE) {
      if (RANK[name] <= RANK[order.status] || RANK[name] > RANK[status])
        continue;
      const note = STATUS_NOTE[name];
      if (note) {
        db.notifications.unshift({
          id: db.next.notification++,
          title: note.title,
          body: note.body(order, vendorName),
          createdAt: new Date(),
          unread: true,
          kind: note.kind,
          orderId: order.id,
          vendorId: order.vendorId,
        });
      }
    }
    order.status = status;
    if (RANK[status] >= RANK.picked_up && !order.rider) {
      order.rider = {
        name: "Tunde",
        phone: "0801 111 2222",
        avatar: "people/tunde",
      };
    }
  }
  return order.status;
}

export function orderSummary(
  db: DemoCustomerDb,
  order: DemoOrder,
): OrderSummary {
  const status = syncOrder(db, order);
  const vendor = vendorById(order.vendorId);
  return {
    id: order.id,
    code: order.code,
    vendor: {
      id: order.vendorId,
      name: vendor?.name ?? "",
      logo: img(vendor?.logo ?? null),
    },
    status,
    itemCount: order.lines.length,
    total: orderTotal(order),
    placedAt: order.placedAt.toISOString(),
    canRate: status === "delivered" && !order.rated,
    paymentType: order.paymentType,
    etaMinutes: vendor?.etaMinutes ?? 35,
  };
}

export function orderDetail(db: DemoCustomerDb, order: DemoOrder): OrderDetail {
  const summary = orderSummary(db, order);
  return {
    ...summary,
    items: order.lines.map((l) => ({
      name: l.name,
      variation: l.variation,
      quantity: l.quantity,
      lineTotal: l.unitPrice * l.quantity,
    })),
    subtotal: orderSubtotal(order),
    deliveryFee: order.mode === "delivery" ? order.deliveryFee : 0,
    discount: order.discount,
    paymentStatus:
      order.paymentType === "online" || summary.status === "delivered"
        ? "paid"
        : "unpaid",
    mode: order.mode,
    address: order.address,
    rated: order.rated,
  };
}

export function tracking(db: DemoCustomerDb, order: DemoOrder): Tracking {
  const summary = orderSummary(db, order);
  const vendor = vendorById(order.vendorId);
  const vendorName = vendor?.name ?? "The kitchen";
  const status = summary.status;
  const rank = RANK[status];
  const rider = order.rider;
  const riderName = rider?.name ?? "Your rider";

  const { elapsed } = order.autoFrom
    ? autoStatus(order, new Date())
    : { elapsed: 0 };
  const onTheWayAt = AUTO_SCHEDULE.find(([n]) => n === "on_the_way")?.[1] ?? 46;
  const doneAt = AUTO_SCHEDULE.find(([n]) => n === "delivered")?.[1] ?? 130;
  let progress = 0;
  if (status === "on_the_way") {
    progress = order.autoFrom
      ? (elapsed - onTheWayAt) / (doneAt - onTheWayAt)
      : 0.55;
  } else if (status === "delivered") progress = 1;
  else if (status === "picked_up") progress = 0.02;
  progress = Math.min(1, Math.max(0, progress));
  const etaMinutes =
    status === "on_the_way"
      ? Math.max(1, Math.round(15 * (1 - progress)))
      : null;

  const confirmedNote =
    rank <= 0
      ? `Waiting for ${vendorName} to accept`
      : status === "preparing"
        ? `${vendorName} is preparing it`
        : status === "ready"
          ? "Ready for pickup"
          : `${vendorName} accepted it`;

  const step = (
    key: TrackStep["key"],
    title: string,
    subtitle: string | null,
    doneRank: number,
  ): TrackStep => ({
    key,
    title,
    subtitle,
    state: rank >= doneRank ? "done" : "todo",
  });

  const steps: TrackStep[] = [
    step("confirmed", "Confirmed", confirmedNote, 1),
    step(
      "picked_up",
      "Picked up",
      rank >= 4 ? `${riderName} collected your order` : null,
      4,
    ),
    step(
      "on_the_way",
      "On the way",
      status === "on_the_way"
        ? `Arriving in about ${etaMinutes} minutes`
        : null,
      6,
    ),
    step("delivered", "Delivered", null, 6),
  ];
  // The first step that is not done is the current one (unless cancelled).
  if (status !== "cancelled") {
    const current = steps.findIndex((s) => s.state === "todo");
    if (current >= 0) steps[current] = { ...steps[current], state: "current" };
    if (rank === 4)
      steps[2] = { ...steps[2], subtitle: `${riderName} is heading to you` };
  }

  return {
    order: summary,
    steps,
    rider: rider
      ? {
          name: rider.name,
          phone: rider.phone,
          avatar: customerImage(rider.avatar),
          vehicle: "Motorbike",
        }
      : null,
    etaMinutes,
    riderPosition:
      rank >= 4 && status !== "cancelled" ? pointOnRoute(progress) : null,
    vendorPosition: TRACK_ROUTE[0],
    homePosition: TRACK_ROUTE[TRACK_ROUTE.length - 1],
    route: TRACK_ROUTE,
    mapImage: customerImage("map/track"),
    finished: status === "delivered" || status === "cancelled",
    itemsLabel: `${summary.itemCount} ${summary.itemCount === 1 ? "item" : "items"} · ${money(summary.total)} · ${
      summary.paymentType === "online" ? "Pay online" : "Cash on delivery"
    }`,
  };
}

export const notificationAgo = (db: DemoCustomerDb, n: DemoNotification) =>
  agoShort(new Date(), n.createdAt);
