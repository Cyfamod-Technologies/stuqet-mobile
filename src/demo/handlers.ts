import type {
  FoodAvailabilityInfo,
  FoodMeta,
} from "~/features/seller-products/types";
import type { RawNotification } from "~/features/seller-notifications/types";
import type { RawMessage } from "~/features/seller-messages/types";
import type {
  RawOrderDetail,
  RawOrderSummary,
} from "~/features/seller-orders/types";
import { demoControl } from "./control";
import { DEMO_ACCOUNTS, DEMO_RESET_CODE, findAccount } from "./data/accounts";
import { CATEGORY_TREE, categoryName } from "./data/categories";
import { customerById } from "./data/customers";
import { AUTO_REPLIES } from "./data/messages";
import { COMMISSION_RATE, MINIMUM_WITHDRAWAL } from "./data/money";
import { PAYMENT_LABELS, orderSubtotal, orderTotal } from "./data/orders";
import { SUPPORT_REPLIES } from "./data/support";
import { VERIFICATION_FORM } from "./data/verification";
import { getDb, refreshShop } from "./db";
import {
  dmy,
  messageStamp,
  monthDay,
  naira,
  notificationDate,
  sqlDateTime,
} from "./format";
import { demoImage } from "./images";
import type {
  DemoAccount,
  DemoDataSet,
  DemoDb,
  DemoListing,
  DemoOrder,
} from "./types";

// ---------------------------------------------------------------------------
// Plumbing
// ---------------------------------------------------------------------------

/** What a handler returns; the adapter turns it into an axios response. */
export interface DemoResult {
  status?: number;
  data: unknown;
}

export interface DemoRequest {
  method: string;
  /** Path after /api/v2, without the query string. */
  path: string;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  /** Signed-in data set, or null without a valid demo token. */
  set: DemoDataSet | null;
}

type Handler = (request: DemoRequest, params: string[]) => DemoResult;

interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
  /** Public routes work without a session. */
  public: boolean;
}

const routes: Route[] = [];

function on(
  method: "GET" | "POST",
  pattern: RegExp,
  handler: Handler,
  isPublic = false,
) {
  routes.push({ method, pattern, handler, public: isPublic });
}

const ok = (data: unknown = {}): DemoResult => ({ data });
const message = (text: string): DemoResult => ({
  data: { result: true, message: text },
});
/** HTTP 200 `{ result: false }`, which axios.ts turns into a rejection. */
const refuse = (text: string): DemoResult => ({
  data: { result: false, message: text },
});
const fail = (
  status: number,
  text: string,
  extra: object = {},
): DemoResult => ({
  status,
  data: { result: false, message: text, ...extra },
});

const SESSION_PREFIX = "demo-token:";

export function tokenFor(set: DemoDataSet): string {
  return `${SESSION_PREFIX}${set}`;
}

export function dataSetFromToken(token: string | null): DemoDataSet | null {
  if (!token?.startsWith(SESSION_PREFIX)) return null;
  const set = token.slice(SESSION_PREFIX.length);
  return set === "product" ||
    set === "food" ||
    set === "service" ||
    set === "fresh"
    ? set
    : null;
}

const asString = (value: unknown): string =>
  typeof value === "string" ? value : value == null ? "" : String(value);

const asNumber = (value: unknown): number => Number(value) || 0;

function paginate<T>(rows: T[], query: DemoRequest["query"], perPage = 10) {
  const page = Math.max(1, asNumber(query.page) || 1);
  const lastPage = Math.max(1, Math.ceil(rows.length / perPage));
  return {
    data: rows.slice((page - 1) * perPage, page * perPage),
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total: rows.length,
    },
    links: { next: page < lastPage ? `?page=${page + 1}` : null },
  };
}

const newestFirst = <T extends { id: number }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => b.id - a.id);

function dbOf(request: DemoRequest): DemoDb {
  // The adapter already rejected requests without a session.
  return getDb(request.set as DemoDataSet);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Under-review logins answer "still pending" once, then approve the account. */
const reviewAttempts = new Map<string, number>();

/** Passwords changed through the forgot-password flow. */
const changedPasswords = new Map<string, string>();

/** The account a forgot-password flow is resetting. */
let resettingAccount: DemoAccount | null = null;

function sessionFor(account: DemoAccount): DemoDataSet {
  return account.kind === "review" ? "fresh" : (account.kind as DemoDataSet);
}

on(
  "POST",
  /^\/auth\/login$/,
  ({ body }) => {
    const account = findAccount(asString(body.email));
    if (!account) return fail(401, "User not found");

    const password = changedPasswords.get(account.email) ?? account.password;
    if (asString(body.password) !== password) return fail(401, "Unauthorized");
    if (account.kind === "suspended") return fail(401, "User is banned");

    if (account.kind === "review") {
      const attempts = (reviewAttempts.get(account.email) ?? 0) + 1;
      reviewAttempts.set(account.email, attempts);
      if (attempts < 2) {
        return fail(
          401,
          "Your seller account is under review. We will notify you once approved.",
        );
      }
    }

    // A fresh login clears the "expire my session" demo tool.
    demoControl.sessionExpired = false;
    return {
      data: {
        result: true,
        message: "Successfully logged in",
        access_token: tokenFor(sessionFor(account)),
        user: {
          id: account.userId,
          type: "seller",
          name: account.name,
          email: account.email,
          avatar: null,
          phone: account.phone,
          email_verified: true,
        },
      },
    };
  },
  true,
);

on("GET", /^\/auth\/logout$/, () => message("Successfully logged out"));

on("GET", /^\/auth\/user$/, (request) => {
  const db = dbOf(request);
  const account = DEMO_ACCOUNTS.find((a) => a.userId === db.shop.user_id);
  return ok({
    id: db.shop.user_id,
    name: account?.name ?? "Demo seller",
    email: db.shop.email,
    phone: db.shop.phone,
  });
});

on(
  "POST",
  /^\/auth\/password\/(forget_request|resend_code)$/,
  ({ body }) => {
    const account = findAccount(asString(body.email_or_phone));
    if (!account) return fail(404, "User is not found");
    resettingAccount = account;
    return message(
      `A verification code has been sent. Demo code: ${DEMO_RESET_CODE}`,
    );
  },
  true,
);

on(
  "POST",
  /^\/auth\/password\/confirm_reset$/,
  ({ body }) => {
    if (
      asString(body.verification_code) !== DEMO_RESET_CODE ||
      !resettingAccount
    ) {
      return refuse("No user is found");
    }
    changedPasswords.set(resettingAccount.email, asString(body.password));
    resettingAccount = null;
    return message("Your password has been reset");
  },
  true,
);

// Minimum required version: low enough that the demo never forces an update.
on("GET", /^\/get-app-version$/, () => ok({ version: "0.0.1" }), true);

// ---------------------------------------------------------------------------
// Shop, uploads, verification
// ---------------------------------------------------------------------------

on("GET", /^\/seller\/shop\/info$/, (request) =>
  ok({ data: refreshShop(dbOf(request)) }),
);

/** Resolves a comma-separated list of upload ids to image URIs. */
function urisFor(db: DemoDb, ids: unknown): string[] {
  return asString(ids)
    .split(",")
    .map((id) => db.uploads.get(Number(id.trim())))
    .filter((uri): uri is string => Boolean(uri));
}

on("POST", /^\/seller\/shop-update$/, (request) => {
  const db = dbOf(request);
  const { body } = request;
  const shop = db.shop;

  // Payout group.
  if ("bank_acc_no" in body || "cash_on_delivery_status" in body) {
    shop.cash_on_delivery_status = asNumber(body.cash_on_delivery_status);
    shop.bank_payment_status = asNumber(body.bank_payment_status);
    shop.bank_name = asString(body.bank_name) || null;
    shop.bank_acc_name = asString(body.bank_acc_name) || null;
    shop.bank_acc_no = asString(body.bank_acc_no) || null;
    shop.bank_routing_no = asString(body.bank_routing_no) || null;
    return message("Payment info updated successfully");
  }

  // Shop profile group.
  if ("name" in body) {
    const name = asString(body.name).trim();
    if (!name) {
      return fail(422, "The name field is required.", {
        errors: { name: ["The name field is required."] },
      });
    }
    shop.name = name;
    shop.address = asString(body.address) || null;
    shop.phone = asString(body.phone) || null;
    const logo = db.uploads.get(Number(body.logo));
    if (logo) {
      shop.logo = logo;
      shop.upload_id = asString(body.logo);
    }
    return message("Shop info updated successfully");
  }

  // Banners group.
  const ids = asString(body.sliders);
  shop.sliders = urisFor(db, ids);
  shop.sliders_id = ids || null;
  return message("Shop banners updated successfully");
});

on("POST", /^\/file\/image-upload$/, (request) => {
  const db = dbOf(request);
  const image = asString(request.body.image);
  if (!image) return refuse("Image is required");

  // The demo picker sends "demo:<image key>" instead of real image data.
  const uri = image.startsWith("demo:")
    ? demoImage(image.slice(5) as Parameters<typeof demoImage>[0])
    : `data:image/jpeg;base64,${image}`;
  const id = db.next.upload++;
  db.uploads.set(id, uri);
  return {
    data: {
      result: true,
      message: "Image has been uploaded successfully",
      path: uri,
      upload_id: id,
    },
  };
});

on("GET", /^\/seller\/shop-verify-form$/, () => ok(VERIFICATION_FORM));

on("POST", /^\/seller\/shop-verify-info-store$/, (request) => {
  const db = dbOf(request);
  db.verification.submitted = true;
  db.shop.is_submitted_form = true;
  db.shop.verify_text = "Pending review";
  pushNotification(db, {
    kind: "ShopVerification",
    data: { status: "pending" },
    text: "We received your documents and will review them within 48 hours",
  });
  return message("Your shop verification request has been submitted.");
});

const RESOLVED_NAMES = [
  "ADEBAYO OLUWASEUN T",
  "CHIOMA NNAMDI OKAFOR",
  "IBRAHIM MUSA YAKUBU",
  "FUNMILAYO ADE BELLO",
  "EMEKA PAUL IGWE",
];

on("POST", /^\/seller\/bank\/resolve$/, (request) => {
  const number = asString(request.body.account_number);
  if (!/^\d{10}$/.test(number) || /^0+$/.test(number)) {
    return refuse("Could not resolve account name. Check the account number.");
  }
  const db = dbOf(request);
  const name =
    number === db.shop.bank_acc_no && db.shop.bank_acc_name
      ? db.shop.bank_acc_name
      : RESOLVED_NAMES[
          number.split("").reduce((sum, digit) => sum + Number(digit), 0) %
            RESOLVED_NAMES.length
        ];
  return ok({ result: true, data: { account_name: name } });
});

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

on("GET", /^\/seller\/dashboard\/sales-stat$/, (request) => {
  const db = dbOf(request);
  const out: Record<string, { date: string; total: number }> = {};
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(db.now);
    day.setDate(day.getDate() - offset);
    const total = db.orders
      .filter(
        (o) =>
          o.deliveryStatus === "delivered" &&
          o.createdAt.toDateString() === day.toDateString(),
      )
      .reduce((sum, o) => sum + orderTotal(o), 0);
    out[String(offset + 1)] = { date: monthDay(day), total };
  }
  return ok(out);
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

function summary(order: DemoOrder): RawOrderSummary {
  return {
    id: order.id,
    order_code: order.code,
    total: naira(orderTotal(order)),
    order_date: dmy(order.createdAt),
    payment_status: order.paymentStatus,
    delivery_status: order.deliveryStatus.replace(/_/g, " "),
  };
}

function detail(order: DemoOrder): RawOrderDetail {
  const customer = customerById(order.customerId);
  const street = customer.address.replace(/, Lagos, Nigeria$/, "");
  return {
    order_code: order.code,
    total: naira(orderTotal(order)),
    order_date: dmy(order.createdAt),
    payment_status: order.paymentStatus,
    // The mapper reads the raw type from payment_method and the label from
    // payment_type, so the demo does the same.
    payment_type: PAYMENT_LABELS[order.paymentType] ?? order.paymentType,
    payment_method: order.paymentType,
    delivery_status: order.deliveryStatus,
    shipping_type: "home_delivery",
    shipping_address: {
      name: customer.name,
      email: `${customer.name.split(" ")[0].toLowerCase()}@mail.com`,
      address: street,
      city: "Lagos",
      state: null,
      country: "Nigeria",
      postal_code: "101245",
      phone: customer.phone,
    },
    shipping_cost: naira(order.shipping),
    subtotal: naira(orderSubtotal(order)),
    coupon_discount: naira(order.coupon),
    tax: naira(order.tax),
    order_items: order.items.map((item) => ({
      name: item.name,
      description: item.variation
        ? `${item.quantity} x ${item.variation}`
        : String(item.quantity),
      delivery_status: order.deliveryStatus,
      price: naira(item.unitPrice * item.quantity),
    })),
  };
}

on("GET", /^\/seller\/orders$/, (request) => {
  const { query } = request;
  const delivery = asString(query.delivery_status);
  const payment = asString(query.payment_status);
  const rows = newestFirst(dbOf(request).orders).filter(
    (o) =>
      (!delivery || o.deliveryStatus === delivery) &&
      (!payment || o.paymentStatus === payment),
  );
  const page = paginate(rows, query);
  return ok({ data: page.data.map(summary), meta: page.meta });
});

on("GET", /^\/seller\/orders\/details\/(\d+)$/, (request, [id]) => {
  const order = dbOf(request).orders.find((o) => o.id === Number(id));
  return order ? ok({ data: [detail(order)] }) : ok({ data: [] });
});

function pushNotification(
  db: DemoDb,
  entry: Omit<DemoDb["notifications"][number], "id" | "at" | "unread">,
) {
  db.notifications.unshift({
    ...entry,
    id: `demo-notification-${Date.now()}-${db.notifications.length}`,
    at: new Date(),
    unread: true,
  });
}

on("POST", /^\/seller\/orders\/update-delivery-status$/, (request) => {
  const db = dbOf(request);
  const order = db.orders.find((o) => o.id === asNumber(request.body.order_id));
  const status = asString(request.body.status) as DemoOrder["deliveryStatus"];
  if (!order) return refuse("Order not found");
  if (
    order.deliveryStatus === "delivered" ||
    order.deliveryStatus === "cancelled"
  ) {
    return refuse("This order can no longer be changed.");
  }

  order.deliveryStatus = status;
  if (status === "delivered") {
    const total = orderTotal(order);
    const commission = Math.round((total * COMMISSION_RATE) / 100);
    db.commissions.unshift({
      id: 4000 + db.commissions.length + 100,
      orderCode: order.code,
      commission,
      earning: total - commission,
      at: new Date(),
    });
    if (order.paymentStatus === "paid") db.balance += total - commission;
  }
  pushNotification(db, {
    kind: "Order",
    data: { order_id: order.id, order_code: order.code, status },
    text: `${order.code} is now ${status.replace(/_/g, " ")}`,
  });
  return message("Delivery status has been updated");
});

on("POST", /^\/seller\/orders\/update-payment-status$/, (request) => {
  const order = dbOf(request).orders.find(
    (o) => o.id === asNumber(request.body.order_id),
  );
  if (!order) return refuse("Order not found");
  order.paymentStatus = "paid";
  return message("Payment status has been updated");
});

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function availabilityOf(
  listing: DemoListing,
  now: Date,
): FoodAvailabilityInfo | null {
  if (listing.listingType !== "food") return null;
  const meta = listing.foodMeta ?? {};
  const info = (
    status: FoodAvailabilityInfo["status"],
  ): FoodAvailabilityInfo => ({
    is_available: status === "available",
    status,
    timezone: "Africa/Lagos",
  });

  if (!listing.published) return info("unpublished");
  if (
    meta.manual_override === "sold_out" ||
    (meta.stock_mode === "limited" && listing.stock <= 0)
  ) {
    return info("sold_out");
  }
  if (meta.availability_mode === "scheduled") {
    const today = DAY_NAMES[now.getDay()];
    const minutes = now.getHours() * 60 + now.getMinutes();
    const inSlot = (meta.time_slots ?? []).some((slot) => {
      const [sh, sm] = slot.start.split(":").map(Number);
      const [eh, em] = slot.end.split(":").map(Number);
      return minutes >= sh * 60 + sm && minutes <= eh * 60 + em;
    });
    if (!(meta.available_days ?? []).includes(today) || !inSlot) {
      return info("outside_schedule");
    }
  }
  return info("available");
}

function listingRow(listing: DemoListing, now: Date) {
  return {
    id: listing.id,
    name: listing.name,
    listing_type: listing.listingType,
    food_meta: listing.foodMeta ?? [],
    service_meta: listing.serviceMeta ?? [],
    food_availability: availabilityOf(listing, now),
    thumbnail_img: listing.thumbnail,
    price: naira(listing.unitPrice),
    current_stock: listing.stock,
    status: listing.published,
    category: categoryName(listing.categoryIds[0]),
    featured: listing.featured,
    approved: listing.approved,
  };
}

on("GET", /^\/seller\/products\/all$/, (request) => {
  const db = dbOf(request);
  const type = asString(request.query.listing_type);
  const search = asString(request.query.search).trim().toLowerCase();
  const rows = newestFirst(db.listings).filter(
    (l) =>
      (!type || l.listingType === type) &&
      (!search || l.name.toLowerCase().includes(search)),
  );
  const page = paginate(rows, request.query);
  return ok({
    data: page.data.map((l) => listingRow(l, new Date())),
    meta: page.meta,
  });
});

on("GET", /^\/seller\/products\/categories$/, () =>
  ok({ data: CATEGORY_TREE }),
);

on("POST", /^\/seller\/products\/add$/, (request) => {
  const db = dbOf(request);
  const { body } = request;
  const type = asString(body.listing_type) as DemoListing["listingType"];
  const name = asString(body.name).trim();

  const errors: Record<string, string[]> = {};
  if (!name) errors.name = ["The name field is required."];
  if (body.unit_price === "" || body.unit_price == null) {
    errors.unit_price = ["The unit price field is required."];
  }
  if (Object.keys(errors).length > 0) {
    return fail(422, "The given data was invalid.", { errors });
  }

  const limit = db.shop.product_upload_limit;
  if (limit !== null && db.listings.length >= limit) {
    return refuse(
      "Upload limit has been reached. Please upgrade your package.",
    );
  }

  const firstPhoto = urisFor(db, body.thumbnail_img || body.photos)[0];
  const categoryIds = Array.isArray(body.category_ids)
    ? (body.category_ids as unknown[]).map(Number)
    : [asNumber(body.category_id)];

  db.listings.push({
    id: db.next.listing++,
    listingType: type,
    name,
    categoryIds,
    unitPrice: asNumber(body.unit_price),
    unit: asString(body.unit) || null,
    stock: asNumber(body.current_stock),
    thumbnail: firstPhoto ?? demoImage("shop/placeholder"),
    published: asString(body.button) === "publish",
    featured: false,
    approved: true,
    description: asString(body.description),
    foodMeta: (body.food_meta as FoodMeta | undefined) ?? null,
    serviceMeta:
      (body.service_meta as DemoListing["serviceMeta"] | undefined) ?? null,
  });

  const label =
    type === "food" ? "Food" : type === "service" ? "Service" : "Product";
  return message(`${label} has been inserted successfully`);
});

on("POST", /^\/seller\/product\/change-status$/, (request) => {
  const db = dbOf(request);
  const listing = db.listings.find((l) => l.id === asNumber(request.body.id));
  if (!listing) return refuse("Product not found");
  listing.published = asNumber(request.body.status) === 1;
  return message("Product status has been updated");
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

on("GET", /^\/seller\/conversations$/, (request) => {
  const db = dbOf(request);
  const latest = (c: DemoDb["conversations"][number]) =>
    Math.max(...c.messages.map((m) => m.at.getTime()), 0);
  const rows = [...db.conversations].sort((a, b) => latest(b) - latest(a));
  return ok({
    data: rows.map((c) => {
      const customer = customerById(c.customerId);
      return {
        id: c.id,
        image: demoImage(customer.avatar),
        name: customer.name,
        title: c.title,
      };
    }),
  });
});

on("GET", /^\/seller\/conversations\/show\/(\d+)$/, (request, [id]) => {
  const db = dbOf(request);
  const conversation = db.conversations.find((c) => c.id === Number(id));
  if (!conversation) return ok({ data: [] });
  const now = Date.now();
  const rows = conversation.messages
    .filter((m) => m.visibleAt <= now)
    .sort((a, b) => b.id - a.id)
    .map((m): RawMessage => ({
      id: m.id,
      user_id: m.fromSeller ? db.shop.user_id : conversation.customerId,
      send_type: m.fromSeller ? "seller" : "customer",
      message: m.text,
      ...messageStamp(m.at),
    }));
  return ok({ data: rows });
});

on("POST", /^\/seller\/conversations\/message\/store$/, (request) => {
  const db = dbOf(request);
  const conversation = db.conversations.find(
    (c) => c.id === asNumber(request.body.conversation_id),
  );
  const text = asString(request.body.message).trim();
  if (!conversation || !text) return refuse("Message could not be sent");

  const now = new Date();
  conversation.messages.push({
    id: db.next.message++,
    fromSeller: true,
    text,
    at: now,
    visibleAt: 0,
  });

  // The customer answers a few seconds later, so polling shows a reply.
  const delay = 4000;
  conversation.messages.push({
    id: db.next.message++,
    fromSeller: false,
    text: AUTO_REPLIES[conversation.messages.length % AUTO_REPLIES.length],
    at: new Date(now.getTime() + delay),
    visibleAt: now.getTime() + delay,
  });
  return message("Message sent");
});

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

function rawNotification(
  entry: DemoDb["notifications"][number],
  unread: boolean,
): RawNotification {
  return {
    id: entry.id,
    isChecked: !unread,
    type: `App\\Notifications\\${entry.kind}Notification`,
    data: entry.data,
    notification_text: entry.text,
    image: null,
    date: notificationDate(entry.at),
  };
}

on("GET", /^\/unread-notifications$/, (request) => {
  const unread = dbOf(request).notifications.filter((n) => n.unread);
  return ok({
    count: unread.length,
    data: { data: unread.map((n) => rawNotification(n, true)) },
  });
});

on("GET", /^\/all-notification$/, (request) => {
  const db = dbOf(request);
  const rows = [...db.notifications]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .map((n) => rawNotification(n, n.unread));
  // The real endpoint marks everything as read as a side effect.
  db.notifications.forEach((n) => {
    n.unread = false;
  });
  return ok({ data: rows });
});

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

on("GET", /^\/seller\/payment-history$/, (request) => {
  const rows = [...dbOf(request).payments].sort(
    (a, b) => b.at.getTime() - a.at.getTime(),
  );
  const page = paginate(rows, request.query);
  return ok({
    ...page,
    data: page.data.map((p) => ({
      id: p.id,
      amount: naira(p.amount),
      payment_method: p.method,
      payment_date: dmy(p.at),
    })),
  });
});

on("GET", /^\/seller\/withdraw-request$/, (request) => {
  const rows = [...dbOf(request).withdrawals].sort(
    (a, b) => b.at.getTime() - a.at.getTime(),
  );
  const page = paginate(rows, request.query);
  return ok({
    ...page,
    data: page.data.map((w) => ({
      id: w.id,
      amount: naira(w.amount),
      status: w.status,
      created_at: dmy(w.at),
    })),
  });
});

on("GET", /^\/seller\/commission-list$/, (request) => {
  const rows = [...dbOf(request).commissions].sort(
    (a, b) => b.at.getTime() - a.at.getTime(),
  );
  const page = paginate(rows, request.query);
  return ok({
    ...page,
    data: page.data.map((c) => ({
      id: c.id,
      order_code: c.orderCode,
      admin_commission: c.commission,
      seller_earning: naira(c.earning),
      created_at: dmy(c.at),
    })),
  });
});

on("POST", /^\/seller\/withdraw-request\/store$/, (request) => {
  const db = dbOf(request);
  const amount = asNumber(request.body.amount);
  if (amount < MINIMUM_WITHDRAWAL) {
    return refuse(`Minimum withdrawal amount is ${naira(MINIMUM_WITHDRAWAL)}`);
  }
  if (amount > db.balance) {
    return refuse("You do not have enough balance to withdraw this amount");
  }
  db.balance -= amount;
  db.withdrawals.push({
    id: db.next.withdrawal++,
    amount,
    status: "Pending",
    at: new Date(),
  });
  pushNotification(db, {
    kind: "Payout",
    data: { status: "pending" },
    text: `Your withdrawal of ${naira(amount).replace(".00", "")} is being processed`,
  });
  return message("Request has been sent successfully");
});

on("POST", /^\/business-settings$/, () =>
  ok([
    {
      type: "minimum_seller_amount_withdraw",
      value: String(MINIMUM_WITHDRAWAL),
    },
    { type: "vendor_commission_activation", value: "1" },
    { type: "seller_commission_type", value: "fixed_rate" },
    { type: "vendor_commission", value: String(COMMISSION_RATE) },
  ]),
);

// ---------------------------------------------------------------------------
// Support tickets
// ---------------------------------------------------------------------------

function ticketSummary(ticket: DemoDb["tickets"][number]) {
  return {
    id: ticket.id,
    code: ticket.code,
    subject: ticket.subject,
    status: ticket.status,
    created_at: sqlDateTime(ticket.at),
  };
}

on("GET", /^\/seller\/support-tickets$/, (request) => {
  const rows = [...dbOf(request).tickets].sort(
    (a, b) => b.at.getTime() - a.at.getTime(),
  );
  const page = paginate(rows, request.query);
  return ok({ data: page.data.map(ticketSummary), meta: page.meta });
});

on("GET", /^\/seller\/support-tickets\/(\d+)$/, (request, [id]) => {
  const db = dbOf(request);
  const ticket = db.tickets.find((t) => t.id === Number(id));
  if (!ticket) return fail(404, "Ticket not found");
  const now = Date.now();
  return ok({
    data: {
      ...ticketSummary(ticket),
      messages: ticket.messages
        .filter((m) => m.visibleAt <= now)
        .sort((a, b) => a.at.getTime() - b.at.getTime())
        .map((m) => ({
          id: m.id,
          body: m.body,
          from_support: m.fromSupport,
          sender_name: m.senderName,
          attachments: m.attachments,
          created_at: sqlDateTime(m.at),
        })),
    },
  });
});

on("POST", /^\/seller\/support-tickets$/, (request) => {
  const db = dbOf(request);
  const subject = asString(request.body.subject).trim();
  const details = asString(request.body.details).trim();
  if (!subject || !details) {
    return fail(422, "The given data was invalid.", {
      errors: {
        ...(subject ? {} : { subject: ["The subject field is required."] }),
        ...(details ? {} : { details: ["The details field is required."] }),
      },
    });
  }
  const id = db.next.ticket++;
  const now = new Date();
  const code = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  db.tickets.push({
    id,
    code,
    subject,
    status: "pending",
    at: now,
    messages: [
      {
        id: db.next.ticketMessage++,
        body: details,
        fromSupport: false,
        senderName: null,
        attachments: urisFor(db, request.body.attachments),
        at: now,
        visibleAt: 0,
      },
    ],
  });
  return {
    data: { result: true, message: "Ticket created", data: { id, code } },
  };
});

on("POST", /^\/seller\/support-tickets\/(\d+)\/replies$/, (request, [id]) => {
  const db = dbOf(request);
  const ticket = db.tickets.find((t) => t.id === Number(id));
  const reply = asString(request.body.reply).trim();
  if (!ticket || !reply) return refuse("Reply could not be sent");

  const now = new Date();
  ticket.messages.push({
    id: db.next.ticketMessage++,
    body: reply,
    fromSupport: false,
    senderName: null,
    attachments: urisFor(db, request.body.attachments),
    at: now,
    visibleAt: 0,
  });
  ticket.status = "open";
  // Support answers a few seconds later.
  ticket.messages.push({
    id: db.next.ticketMessage++,
    body: SUPPORT_REPLIES[ticket.messages.length % SUPPORT_REPLIES.length],
    fromSupport: true,
    senderName: "Stuqet Support",
    attachments: [],
    at: new Date(now.getTime() + 6000),
    visibleAt: now.getTime() + 6000,
  });
  return message("Reply sent");
});

// ---------------------------------------------------------------------------

/** Finds the handler for a request, or null for an unknown endpoint. */
export function resolveRoute(
  method: string,
  path: string,
): { route: Route; params: string[] } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(path);
    if (match) return { route, params: match.slice(1) };
  }
  return null;
}
