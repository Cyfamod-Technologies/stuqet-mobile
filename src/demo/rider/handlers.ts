import type {
  DashboardSummary,
  DeliveryDetail,
  DeliveryItem,
  DeliveryTab,
  EarningSummary,
  HistoryRow,
} from "~/features/rider-deliveries/types";
import type {
  RiderApplication,
  RiderProfile,
} from "~/features/rider-account/types";
import { apiMoney, dayLabel, money } from "../customer/format";
import { customerImage } from "../customer/images";
import { BANKS } from "../customer/data/places";
import { vendorById } from "../customer/data/vendors";
import { getCustomerDb } from "../customer/db";
import {
  asString,
  fail,
  message,
  ok,
  on,
  refuse,
  type DemoRequest,
} from "../customer/router";
import type { DemoPersona } from "../customer/types";
import { getRiderDb, type RiderDb, type RiderDelivery } from "./db";
import { makeDelivery } from "./data/deliveries";

// Routes follow routes/api.php (`v2/delivery-boy/*`, DeliveryBoyController).
// Fields and routes marked TODO(backend) are proposals the backend lacks.

const me = (request: DemoRequest) => getRiderDb(request.persona as DemoPersona);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const STATUS_LABEL: Record<string, string> = {
  pending: "Assigned",
  confirmed: "Assigned",
  picked_up: "Picked up",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function item(delivery: RiderDelivery): DeliveryItem {
  const vendor = vendorById(delivery.vendorId);
  const finished =
    delivery.status === "delivered" || delivery.status === "cancelled";
  const date = dayLabel(delivery.completedAt ?? delivery.placedAt);
  return {
    id: delivery.id,
    code: delivery.code,
    payment_type: delivery.cash ? "Cash On Delivery" : "Paystack",
    payment_status:
      delivery.cash && delivery.status !== "delivered" ? "unpaid" : "paid",
    delivery_status: delivery.status,
    delivery_status_string: STATUS_LABEL[delivery.status] ?? delivery.status,
    grand_total: apiMoney(delivery.amount),
    date,
    cancel_request: delivery.cancelRequested,
    amount: delivery.amount,
    pickup_name: vendor?.name ?? "",
    pickup_logo: vendor?.logo ? customerImage(vendor.logo) : null,
    dropoff_area: "Riverside University",
    date_label: finished ? date : `Placed ${date}`,
  };
}

function detail(delivery: RiderDelivery): DeliveryDetail {
  const vendor = vendorById(delivery.vendorId);
  return {
    ...item(delivery),
    cash: delivery.cash,
    pickup: {
      name: vendor?.name ?? "",
      address: vendor?.address ?? "",
      phone: vendor?.phone ?? "",
      logo: vendor?.logo ? customerImage(vendor.logo) : null,
    },
    dropoff: {
      name: delivery.dropoffName,
      address: delivery.dropoffAddress,
      phone: delivery.dropoffPhone,
    },
  };
}

function summary(db: RiderDb): DashboardSummary {
  const now = new Date();
  const todayRows = db.history.filter((h) => sameDay(h.date, now));
  const yesterday = new Date(now.getTime() - 24 * 3_600_000);
  const count = (s: string) =>
    db.deliveries.filter((d) => d.status === s).length;
  const earnings = db.history.reduce(
    (sum, h) => sum + h.earning,
    db.baseEarning,
  );
  return {
    completed_delivery: count("delivered"),
    pending_delivery: db.deliveries.filter(
      (d) => d.status !== "delivered" && d.status !== "cancelled",
    ).length,
    total_collection: apiMoney(
      db.history.reduce((sum, h) => sum + h.collection, 0),
    ),
    total_earning: apiMoney(earnings),
    cancelled: count("cancelled"),
    on_the_way: count("on_the_way"),
    picked: count("picked_up"),
    assigned: db.deliveries.filter(
      (d) => d.status === "pending" || d.status === "confirmed",
    ).length,
    today_earning: money(todayRows.reduce((sum, h) => sum + h.earning, 0)),
    today_collection: money(
      todayRows.reduce((sum, h) => sum + h.collection, 0),
    ),
    yesterday_earning: money(
      db.history
        .filter((h) => sameDay(h.date, yesterday))
        .reduce((sum, h) => sum + h.earning, 0),
    ),
  };
}

on("GET", /^\/delivery-boy\/dashboard-summary\/\d+$/, (request) =>
  ok(summary(me(request))),
);

const TAB_STATUSES: Record<DeliveryTab, string[]> = {
  assigned: ["pending", "confirmed"],
  picked_up: ["picked_up"],
  on_the_way: ["on_the_way"],
  completed: ["delivered"],
  cancelled: ["cancelled"],
};

on(
  "GET",
  /^\/delivery-boy\/deliveries\/(assigned|picked_up|on_the_way|completed|cancelled)\/\d+$/,
  (request, [tab]) => {
    const db = me(request);
    const rows = db.deliveries
      .filter((d) => TAB_STATUSES[tab as DeliveryTab].includes(d.status))
      .sort(
        (a, b) =>
          (b.completedAt ?? b.placedAt).getTime() -
          (a.completedAt ?? a.placedAt).getTime(),
      );
    return ok({ data: rows.map(item), success: true, status: 200 });
  },
);

// TODO(backend): purchase-history-details/{id} is the product order; the rider
// needs the vendor pickup stop and the customer drop-off stop.
on(
  "GET",
  /^\/delivery-boy\/purchase-history-details\/(\d+)$/,
  (request, [id]) => {
    const delivery = me(request).deliveries.find((d) => d.id === Number(id));
    return delivery
      ? ok({ data: [detail(delivery)], success: true, status: 200 })
      : fail(404, "Delivery not found");
  },
);

const NEXT_STATUS: Record<string, string> = {
  pending: "picked_up",
  confirmed: "picked_up",
  picked_up: "on_the_way",
  on_the_way: "delivered",
};

on("POST", /^\/delivery-boy\/change-delivery-status$/, (request) => {
  const db = me(request);
  const { body } = request;
  const delivery = db.deliveries.find((d) => d.id === Number(body.order_id));
  if (!delivery) return fail(404, "Delivery not found");
  const status = asString(body.status);
  if (NEXT_STATUS[delivery.status] !== status)
    return refuse("That is not the next step of this delivery");
  delivery.status = status as RiderDelivery["status"];
  if (status === "delivered") {
    delivery.completedAt = new Date();
    db.history.unshift({
      id: db.next.history++,
      orderId: delivery.id,
      code: delivery.code,
      earning: 800,
      collection: delivery.cash ? delivery.amount : 0,
      cash: delivery.cash,
      date: new Date(),
    });
  }
  const label = STATUS_LABEL[status] ?? status;
  return message(`Delivery status changed to ${label}`);
});

on("GET", /^\/delivery-boy\/cancel-request\/(\d+)$/, (request, [id]) => {
  const delivery = me(request).deliveries.find((d) => d.id === Number(id));
  if (!delivery) return fail(404, "Delivery not found");
  delivery.cancelRequested = true;
  return message("Requested for cancellation");
});

function historyRows(db: RiderDb, cash: boolean): HistoryRow[] {
  return db.history
    .filter((h) => (cash ? h.cash : true))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((h) => ({
      id: h.id,
      order_id: h.orderId,
      order_code: h.code,
      delivery_status: "delivered",
      earning: apiMoney(h.earning),
      collection: apiMoney(h.collection),
      payment_type: h.cash ? "cash_on_delivery" : "online",
      date: dayLabel(h.date),
      earning_amount: h.earning,
      collection_amount: h.collection,
    }));
}

on("GET", /^\/delivery-boy\/earning\/\d+$/, (request) =>
  ok({ data: historyRows(me(request), false), success: true, status: 200 }),
);
on("GET", /^\/delivery-boy\/collection\/\d+$/, (request) =>
  ok({ data: historyRows(me(request), true), success: true, status: 200 }),
);

on("GET", /^\/delivery-boy\/earning-summary\/\d+$/, (request) => {
  const s = summary(me(request));
  const now = new Date();
  const summaryOut: EarningSummary = {
    today_date: dayLabel(now),
    today_earning: s.today_earning,
    yesterday_date: dayLabel(new Date(now.getTime() - 24 * 3_600_000)),
    yesterday_earning: s.yesterday_earning,
  };
  return ok(summaryOut);
});

on("GET", /^\/delivery-boy\/collection-summary\/\d+$/, (request) => {
  const db = me(request);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 3_600_000);
  const sum = (d: Date) =>
    db.history
      .filter((h) => sameDay(h.date, d))
      .reduce((s, h) => s + h.collection, 0);
  return ok({
    today_date: dayLabel(now),
    today_collection: money(sum(now)),
    yesterday_date: dayLabel(yesterday),
    yesterday_collection: money(sum(yesterday)),
  });
});

// --- Notifications -----------------------------------------------------------

on("GET", /^\/delivery-boy\/notifications$/, (request) => {
  const db = me(request);
  const now = Date.now();
  const ago = (d: Date) => {
    const minutes = Math.max(0, Math.round((now - d.getTime()) / 60_000));
    if (minutes < 60) return `${Math.max(1, minutes)}m`;
    if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h`;
    const days = Math.round(minutes / (60 * 24));
    return days === 1 ? "Yesterday" : `${days}d`;
  };
  return ok({
    data: db.notifications
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((n) => ({ ...n, ago: ago(n.createdAt), vendorLogo: null })),
  });
});

on("POST", /^\/delivery-boy\/notifications\/read$/, (request) => {
  me(request).notifications.forEach((n) => (n.unread = false));
  return message("Marked as read");
});

// --- Application, profile and payout (all proposed) -------------------------------

// TODO(backend): rider onboarding. `auth/signup` only creates customers.
on("POST", /^\/delivery-boy\/apply$/, (request) => {
  const persona = request.persona as DemoPersona;
  const db = me(request);
  const customer = getCustomerDb(persona);
  const input = request.body as unknown as RiderApplication;
  const docs = input.documents ?? {};
  const doc = (key: keyof typeof docs, label: string) => ({
    key,
    label,
    state: docs[key] ? ("pending" as const) : ("missing" as const),
    fileName: docs[key] ?? null,
  });
  const profile: RiderProfile = {
    id: persona === "customer" ? 6100 : 6101,
    name: customer.name,
    phone: input.phone,
    avatar: input.avatar ?? customer.avatar,
    school: input.school || customer.school,
    area: input.area,
    vehicle: input.vehicle,
    plate: input.plate ?? null,
    status: "pending",
    documents: [
      doc("government_id", "Government ID"),
      doc("drivers_licence", "Driver's licence"),
      doc("id_photo", "Photo with ID"),
    ],
    payout: input.payout,
  };
  db.profile = profile;
  db.checks = 0;
  customer.riderStatus = "pending";
  return message("Application submitted");
});

on("GET", /^\/delivery-boy\/application$/, (request) => {
  const db = me(request);
  if (!db.profile) return ok({ status: "none" });
  if (db.profile.status === "pending") {
    db.checks += 1;
    // The demo approves the application on the second check.
    if (db.checks >= 2) {
      db.profile.status = "approved";
      db.profile.documents = db.profile.documents.map((d) =>
        d.state === "pending" ? { ...d, state: "approved" } : d,
      );
      getCustomerDb(request.persona as DemoPersona).riderStatus = "approved";
      db.notifications.unshift({
        id: db.next.notification++,
        title: "Application approved",
        body: "You can take deliveries now",
        createdAt: new Date(),
        unread: true,
        kind: "approved",
        orderId: null,
      });
    }
  }
  return ok({ status: db.profile.status });
});

on("GET", /^\/delivery-boy\/profile$/, (request) => {
  const db = me(request);
  return db.profile ? ok(db.profile) : fail(404, "No rider profile");
});

on("GET", /^\/delivery-boy\/banks$/, () => ok({ data: BANKS }));

// TODO(backend): bank account lookup for riders (the vendor demo has the same
// route under /seller/bank/resolve).
on("POST", /^\/delivery-boy\/bank\/resolve$/, ({ body }) => {
  const number = asString(body.accountNumber);
  if (number === "0000000000") {
    return fail(
      404,
      "We could not find this account. Check the bank and the account number.",
    );
  }
  const names = ["Tunde Adeyemi", "Sade Bello", "Ada Okafor", "Chidi Eze"];
  const name =
    number === "0123456789"
      ? "Tunde Adeyemi"
      : names[Number(number.slice(-1)) % names.length];
  return ok({ accountName: name });
});

on("POST", /^\/delivery-boy\/payout$/, (request) => {
  const db = me(request);
  if (!db.profile) return fail(404, "No rider profile");
  const { body } = request;
  const bank = BANKS.find((b) => b.code === asString(body.bankCode));
  db.profile.payout = {
    bankCode: asString(body.bankCode),
    bankName: bank?.name ?? "",
    accountNumber: asString(body.accountNumber),
    accountName: asString(body.accountName),
  };
  return message("Payout details saved");
});

/** Demo tool: hands the signed-in rider a new delivery to accept. */
export function assignDemoDelivery(persona: DemoPersona): boolean {
  const db = getRiderDb(persona);
  if (db.profile?.status !== "approved") return false;
  const id = db.next.delivery++;
  const delivery = makeDelivery(new Date(), id, {
    vendorId: (id % 6) + 1,
    status: "pending",
    amount: 2500 + (id % 5) * 400,
    cash: id % 2 === 0,
  });
  db.deliveries.unshift(delivery);
  db.notifications.unshift({
    id: db.next.notification++,
    title: "New delivery assigned",
    body: delivery.cash
      ? `Order #${delivery.code}, ${money(delivery.amount)} cash`
      : `Order #${delivery.code}, paid online`,
    createdAt: new Date(),
    unread: true,
    kind: "assigned",
    orderId: delivery.id,
  });
  return true;
}
