import { customerImage } from "../images";
import { VENDOR_REPLIES } from "../data/chat";
import { dishByName, vendorById } from "../data/vendors";
import { getCustomerDb } from "../db";
import {
  asNumber,
  asString,
  fail,
  message,
  ok,
  on,
  refuse,
  type DemoRequest,
} from "../router";
import type { DemoPersona } from "../types";
import {
  buildCart,
  orderDetail,
  orderSummary,
  syncOrder,
  tracking,
} from "../views";

const me = (request: DemoRequest) =>
  getCustomerDb(request.persona as DemoPersona);

const findOrder = (request: DemoRequest, id: string) =>
  me(request).orders.find((o) => o.id === Number(id));

// TODO(backend): proposed food order endpoints (the real `purchase-history`
// routes are product orders).
on("GET", /^\/food\/orders$/, (request) => {
  const db = me(request);
  const tab = asString(request.query.tab);
  const rows = db.orders
    .map((order) => orderSummary(db, order))
    .filter((o) => {
      const finished = o.status === "delivered" || o.status === "cancelled";
      return tab === "past" ? finished : tab === "active" ? !finished : true;
    });
  return ok({ data: rows });
});

on("GET", /^\/food\/orders\/(\d+)$/, (request, [id]) => {
  const order = findOrder(request, id);
  return order
    ? ok(orderDetail(me(request), order))
    : fail(404, "Order not found");
});

on("GET", /^\/food\/orders\/(\d+)\/tracking$/, (request, [id]) => {
  const order = findOrder(request, id);
  return order
    ? ok(tracking(me(request), order))
    : fail(404, "Order not found");
});

on("POST", /^\/food\/orders\/(\d+)\/review$/, (request, [id]) => {
  const order = findOrder(request, id);
  if (!order) return fail(404, "Order not found");
  if (syncOrder(me(request), order) !== "delivered") {
    return refuse("You can rate an order once it is delivered");
  }
  const rating = asNumber(request.body.rating);
  if (rating < 1 || rating > 5) return refuse("Pick between 1 and 5 stars");
  order.rated = true;
  return message("Thanks for your review");
});

on("POST", /^\/food\/orders\/(\d+)\/reorder$/, (request, [id]) => {
  const db = me(request);
  const order = findOrder(request, id);
  if (!order) return fail(404, "Order not found");
  const vendor = vendorById(order.vendorId);
  if (!vendor?.isOpen)
    return refuse(`${vendor?.name ?? "This vendor"} is closed right now`);
  db.cart = [];
  db.coupons.clear();
  let added = 0;
  for (const line of order.lines) {
    const dish = dishByName(order.vendorId, line.name);
    if (!dish || dish.status === "sold_out") continue;
    // Match the size and add-ons by label from the saved variation.
    const labels = (line.variation ?? "").split(" · ");
    const size = dish.sizes.find((s) => labels.includes(s.label));
    const addOnLabels = (labels[labels.length - 1] ?? "").split(", ");
    const addOnIds = dish.addOns
      .filter((a) => addOnLabels.includes(a.label))
      .map((a) => a.id);
    db.cart.push({
      id: db.next.cart++,
      dishId: dish.id,
      sizeId: size?.id ?? null,
      addOnIds,
      quantity: line.quantity,
      note: null,
    });
    added += 1;
  }
  if (added === 0) return refuse("Those dishes are not available right now");
  return ok({ ...buildCart(db), added });
});

// --- Chat with the vendor about an order ------------------------------------------

function thread(request: DemoRequest, id: string) {
  const db = me(request);
  const order = db.orders.find((o) => o.id === Number(id));
  if (!order) return null;
  const vendor = vendorById(order.vendorId);
  const messages = db.messages.get(order.id) ?? [];
  db.messages.set(order.id, messages);
  return { db, order, vendor, messages };
}

on("GET", /^\/food\/orders\/(\d+)\/messages$/, (request, [id]) => {
  const t = thread(request, id);
  if (!t) return fail(404, "Order not found");
  return ok({
    vendor: {
      id: t.order.vendorId,
      name: t.vendor?.name ?? "",
      logo: t.vendor?.logo ? customerImage(t.vendor.logo) : null,
    },
    orderCode: t.order.code,
    messages: t.messages.map((m) => ({
      id: m.id,
      mine: m.mine,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

on("POST", /^\/food\/orders\/(\d+)\/messages$/, (request, [id]) => {
  const t = thread(request, id);
  if (!t) return fail(404, "Order not found");
  const text = asString(request.body.text).trim();
  if (!text) return refuse("Type a message first");
  t.messages.push({
    id: t.db.next.message++,
    mine: true,
    text,
    createdAt: new Date(),
  });
  // The vendor answers a few seconds later, like the vendor demo does.
  const { db, order } = t;
  setTimeout(() => {
    const list = db.messages.get(order.id) ?? [];
    list.push({
      id: db.next.message++,
      mine: false,
      text: VENDOR_REPLIES[list.length % VENDOR_REPLIES.length],
      createdAt: new Date(),
    });
    db.messages.set(order.id, list);
  }, 4000);
  return message("Sent");
});
