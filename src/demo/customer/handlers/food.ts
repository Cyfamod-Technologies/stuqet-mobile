import type { FulfilmentMode } from "~/features/customer-food/types";
import { COUPONS, FOOD_CATEGORIES, TRENDING_SEARCHES } from "../data/places";
import { DISHES, VENDORS, dishById, vendorById } from "../data/vendors";
import { getCustomerDb } from "../db";
import { money, ymd } from "../format";
import {
  asNumber,
  asString,
  fail,
  ok,
  on,
  refuse,
  type DemoRequest,
} from "../router";
import type { DemoOrder, DemoPersona } from "../types";
import {
  buildCart,
  discountFor,
  dishSummary,
  dishView,
  orderSummary,
  vendorView,
} from "../views";

const me = (request: DemoRequest) =>
  getCustomerDb(request.persona as DemoPersona);

// TODO(backend): every /food/* route below is proposed; the public API only has
// the product storefront. See each feature's api.ts for the matching call.

on("GET", /^\/food\/home$/, (request) => {
  const db = me(request);
  const open = [...VENDORS].sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
  return ok({
    school: db.school,
    categories: FOOD_CATEGORIES,
    popular: DISHES.filter((d) => d.popular).map((d) => dishSummary(db, d)),
    vendors: open.map((v) => vendorView(db, v)),
    favourites: VENDORS.filter((v) => db.favouriteVendors.has(v.id)).map((v) =>
      vendorView(db, v),
    ),
    cartCount: buildCart(db).count,
    unreadNotifications: db.notifications.filter((n) => n.unread).length,
  });
});

on("GET", /^\/food\/categories$/, () => ok({ data: FOOD_CATEGORIES }));

on("GET", /^\/food\/vendors\/(\d+)\/menu$/, (request, [id]) => {
  const db = me(request);
  const vendor = vendorById(Number(id));
  if (!vendor) return fail(404, "Vendor not found");
  const sections: {
    id: string;
    name: string;
    dishes: ReturnType<typeof dishSummary>[];
  }[] = [];
  for (const dish of DISHES.filter((d) => d.vendorId === vendor.id)) {
    let section = sections.find((s) => s.name === dish.section);
    if (!section) {
      section = {
        id: dish.section.toLowerCase(),
        name: dish.section,
        dishes: [],
      };
      sections.push(section);
    }
    section.dishes.push(dishSummary(db, dish));
  }
  return ok({ vendor: vendorView(db, vendor), sections });
});

on("GET", /^\/food\/dishes\/(\d+)$/, (request, [id]) => {
  const dish = dishById(Number(id));
  if (!dish) return fail(404, "Dish not found");
  return ok(dishView(me(request), dish));
});

on("GET", /^\/food\/search\/trending$/, () => ok({ data: TRENDING_SEARCHES }));

on("GET", /^\/food\/search$/, (request) => {
  const db = me(request);
  const { query } = request;
  const q = asString(query.q).trim().toLowerCase();
  const mode = asString(query.mode) as FulfilmentMode | "";
  const maxPrice = asNumber(query.maxPrice);
  const category = FOOD_CATEGORIES.find(
    (c) => c.id === asNumber(query.category),
  )?.name;
  const vendorOk = (v: (typeof VENDORS)[number]) =>
    (!mode || v.modes.includes(mode)) &&
    (!category || v.categories.includes(category));
  const dishes = DISHES.filter((d) => {
    const vendor = vendorById(d.vendorId);
    if (!vendor || !vendorOk(vendor)) return false;
    if (maxPrice && (d.sizes[0]?.price ?? d.price) > maxPrice) return false;
    return (
      !q ||
      d.name.toLowerCase().includes(q) ||
      vendor.name.toLowerCase().includes(q)
    );
  });
  const vendors = VENDORS.filter(
    (v) =>
      vendorOk(v) &&
      (!q ||
        v.name.toLowerCase().includes(q) ||
        v.categories.some((c) => c.toLowerCase().includes(q))),
  );
  return ok({
    dishes: dishes.map((d) => dishSummary(db, d)),
    vendors: vendors.map((v) => vendorView(db, v)),
  });
});

on("POST", /^\/food\/favourites\/vendors\/(\d+)\/toggle$/, (request, [id]) => {
  const set = me(request).favouriteVendors;
  const now = !set.has(Number(id));
  if (now) set.add(Number(id));
  else set.delete(Number(id));
  return ok({ isFavourite: now });
});

on("POST", /^\/food\/favourites\/dishes\/(\d+)\/toggle$/, (request, [id]) => {
  const set = me(request).favouriteDishes;
  const now = !set.has(Number(id));
  if (now) set.add(Number(id));
  else set.delete(Number(id));
  return ok({ isFavourite: now });
});

// --- Cart ----------------------------------------------------------------------

on("GET", /^\/food\/cart$/, (request) => ok(buildCart(me(request))));

on("POST", /^\/food\/cart\/items$/, (request) => {
  const db = me(request);
  const { body } = request;
  const dish = dishById(asNumber(body.dishId));
  if (!dish) return fail(404, "Dish not found");
  if (dish.status === "sold_out") return refuse("That dish is sold out");
  if (!vendorById(dish.vendorId)?.isOpen)
    return refuse("This vendor is closed right now");
  const other = db.cart.find(
    (l) => dishById(l.dishId)?.vendorId !== dish.vendorId,
  );
  if (other && !body.replace) {
    const vendor = vendorById(dishById(other.dishId)?.vendorId ?? 0);
    return fail(
      409,
      `Your cart has items from ${vendor?.name ?? "another vendor"}`,
      {
        code: "different_vendor",
        vendorName: vendor?.name,
      },
    );
  }
  if (body.replace) {
    db.cart = [];
    db.coupons.clear();
  }
  const addOnIds = Array.isArray(body.addOnIds)
    ? body.addOnIds.map(String)
    : [];
  const sizeId = body.sizeId ? asString(body.sizeId) : null;
  const same = db.cart.find(
    (l) =>
      l.dishId === dish.id &&
      l.sizeId === sizeId &&
      [...l.addOnIds].sort().join() === [...addOnIds].sort().join(),
  );
  const quantity = Math.max(1, asNumber(body.quantity) || 1);
  if (same) same.quantity += quantity;
  else {
    db.cart.push({
      id: db.next.cart++,
      dishId: dish.id,
      sizeId,
      addOnIds,
      quantity,
      note: asString(body.note) || null,
    });
  }
  return ok(buildCart(db));
});

on("POST", /^\/food\/cart\/items\/(\d+)$/, (request, [id]) => {
  const db = me(request);
  const line = db.cart.find((l) => l.id === Number(id));
  if (!line) return fail(404, "Cart item not found");
  const { body } = request;
  if (body.quantity !== undefined) {
    const quantity = asNumber(body.quantity);
    if (quantity <= 0) db.cart = db.cart.filter((l) => l.id !== line.id);
    else line.quantity = Math.min(quantity, 20);
  }
  if (body.note !== undefined) line.note = asString(body.note) || null;
  return ok(buildCart(db));
});

on("DELETE", /^\/food\/cart\/items\/(\d+)$/, (request, [id]) => {
  const db = me(request);
  db.cart = db.cart.filter((l) => l.id !== Number(id));
  return ok(buildCart(db));
});

on("DELETE", /^\/food\/cart\/vendors\/(\d+)$/, (request, [id]) => {
  const db = me(request);
  db.cart = db.cart.filter((l) => dishById(l.dishId)?.vendorId !== Number(id));
  db.coupons.delete(Number(id));
  return ok(buildCart(db));
});

on("POST", /^\/food\/cart\/coupon$/, (request) => {
  const db = me(request);
  const vendorId = asNumber(request.body.vendorId);
  const code = asString(request.body.code).trim().toUpperCase();
  const group = buildCart(db).groups.find((g) => g.vendor.id === vendorId);
  if (!group) return fail(404, "Nothing in the cart for that vendor");
  if (
    !COUPONS.some((c) => c.code === code) ||
    !discountFor(code, group.subtotal)
  ) {
    return refuse(
      "That code is not valid or has expired. Check the spelling and try again.",
    );
  }
  db.coupons.set(vendorId, code);
  return ok(buildCart(db));
});

on("DELETE", /^\/food\/cart\/coupon\/(\d+)$/, (request, [id]) => {
  const db = me(request);
  db.coupons.delete(Number(id));
  return ok(buildCart(db));
});

// --- Checkout and placing the order ---------------------------------------------

on("GET", /^\/food\/checkout$/, (request) => {
  const db = me(request);
  const { query } = request;
  const group = buildCart(db).groups.find(
    (g) => g.vendor.id === asNumber(query.vendorId),
  );
  if (!group) return fail(404, "Nothing to check out");
  const vendor = vendorById(group.vendor.id);
  const modes = vendor?.modes ?? ["delivery"];
  const requested = asString(query.mode) as FulfilmentMode;
  const mode = modes.includes(requested) ? requested : "delivery";
  const chosen = db.addresses.find((a) => a.id === asNumber(query.addressId));
  const address =
    chosen ?? db.addresses.find((a) => a.isDefault) ?? db.addresses[0] ?? null;
  const deliveryFee = mode === "delivery" ? group.deliveryFee : 0;
  return ok({
    vendor: group.vendor,
    itemCount: group.items.length,
    modes,
    mode,
    address: address
      ? {
          id: address.id,
          label: address.label,
          address: address.address,
          phone: address.phone,
          isDefault: address.isDefault,
          stateId: address.stateId,
          cityId: address.cityId,
          areaId: address.areaId,
        }
      : null,
    phone: address?.phone ?? db.phone,
    subtotal: group.subtotal,
    deliveryFee,
    discount: group.discount,
    total: group.subtotal + deliveryFee - group.discount,
  });
});

// TODO(backend): `order/store` is the product order; the food order needs a
// vendor, a fulfilment mode and online (Paystack) or cash payment. In demo mode
// "Pay online" is treated as paid at once.
on("POST", /^\/food\/orders$/, (request) => {
  const db = me(request);
  const { body } = request;
  const vendorId = asNumber(body.vendorId);
  const group = buildCart(db).groups.find((g) => g.vendor.id === vendorId);
  if (!group) return fail(404, "Nothing to order");
  const mode = (asString(body.mode) || "delivery") as FulfilmentMode;
  const address = db.addresses.find((a) => a.id === asNumber(body.addressId));
  if (mode === "delivery" && !address)
    return refuse("Choose a delivery address first");
  const id = db.next.order++;
  const now = new Date();
  const order: DemoOrder = {
    id,
    code: `${ymd(now)}-${48120100 + id}`,
    vendorId,
    status: "pending",
    autoFrom: now,
    placedAt: now,
    lines: group.items.map((item) => ({
      name: item.name,
      variation: item.variation,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    deliveryFee: group.deliveryFee,
    discount: group.discount,
    paymentType: body.payment === "cash" ? "cash" : "online",
    mode,
    address: mode === "delivery" ? (address?.address ?? null) : null,
    rated: false,
    rider: null,
  };
  db.orders.unshift(order);
  db.cart = db.cart.filter((l) => dishById(l.dishId)?.vendorId !== vendorId);
  db.coupons.delete(vendorId);
  return ok({
    ...orderSummary(db, order),
    message: `Order placed. Total ${money(group.total)}`,
  });
});
