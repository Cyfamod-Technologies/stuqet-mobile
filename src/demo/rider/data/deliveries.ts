import type { AppNotification } from "~/features/customer-orders/types";
import type { RiderProfile } from "~/features/rider-account/types";
import { customerImage } from "../../customer/images";
import type { DemoPersona } from "../../customer/types";
import type { RiderDb, RiderDelivery, RiderHistoryRow } from "../db";

const DROPOFFS = [
  {
    name: "Ada O.",
    address: "12 Hostel Road, Room 4, Akoka, Lagos",
    phone: "0803 123 4567",
  },
  {
    name: "Chidi E.",
    address: "Block B, Room 12, Riverside University",
    phone: "0805 234 5678",
  },
  {
    name: "Grace N.",
    address: "Library Road, Akoka, Lagos",
    phone: "0806 345 6789",
  },
  {
    name: "Femi A.",
    address: "Main campus, Riverside University",
    phone: "0807 456 7890",
  },
];

const minutesAgo = (now: Date, minutes: number) =>
  new Date(now.getTime() - minutes * 60_000);

function ymd(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}`;
}

export function makeDelivery(
  now: Date,
  id: number,
  fields: Partial<RiderDelivery> &
    Pick<RiderDelivery, "vendorId" | "status" | "amount" | "cash">,
): RiderDelivery {
  const drop = DROPOFFS[id % DROPOFFS.length];
  return {
    id,
    code: `${ymd(now)}-${48120000 + id}`,
    placedAt: minutesAgo(now, 15),
    completedAt: null,
    cancelRequested: false,
    dropoffName: drop.name,
    dropoffAddress: drop.address,
    dropoffPhone: drop.phone,
    ...fields,
  };
}

function riderProfile(
  persona: DemoPersona,
  status: RiderProfile["status"],
): RiderProfile {
  const tunde = persona === "rider";
  const docState = status === "approved" ? "approved" : "pending";
  return {
    id: tunde ? 6001 : 6002,
    name: tunde ? "Tunde Adeyemi" : "Sade Bello",
    phone: tunde ? "0801 111 2222" : "0807 456 7890",
    avatar: customerImage(tunde ? "people/tunde" : "people/fatima"),
    school: "Riverside University",
    area: "Hostels and campus",
    vehicle: "motorbike",
    plate: "ABC 123 XY",
    status,
    documents: [
      {
        key: "government_id",
        label: "Government ID",
        state: docState,
        fileName: "national-id.jpg",
      },
      {
        key: "drivers_licence",
        label: "Driver's licence",
        state: docState,
        fileName: "drivers-licence.jpg",
      },
      {
        key: "id_photo",
        label: "Photo with ID",
        state: docState,
        fileName: "id-selfie.jpg",
      },
    ],
    payout: {
      bankCode: "044",
      bankName: "Access Bank",
      accountNumber: "0123456789",
      accountName: tunde ? "Tunde Adeyemi" : "Sade Bello",
    },
  };
}

export function buildRiderSeed(
  persona: DemoPersona,
  now: Date,
): Pick<
  RiderDb,
  "profile" | "deliveries" | "history" | "baseEarning" | "notifications"
> {
  if (persona === "riderReview") {
    return {
      profile: riderProfile(persona, "pending"),
      deliveries: [],
      history: [],
      baseEarning: 0,
      notifications: [],
    };
  }
  if (persona !== "rider") {
    // A customer who applies gets a profile from the application form.
    return {
      profile: null,
      deliveries: [],
      history: [],
      baseEarning: 0,
      notifications: [],
    };
  }

  const deliveries: RiderDelivery[] = [
    makeDelivery(now, 31, {
      vendorId: 1,
      status: "pending",
      amount: 4500,
      cash: true,
      placedAt: minutesAgo(now, 2),
    }),
    makeDelivery(now, 87, {
      vendorId: 2,
      status: "pending",
      amount: 3200,
      cash: false,
      placedAt: minutesAgo(now, 60),
    }),
    makeDelivery(now, 45, {
      vendorId: 5,
      status: "pending",
      amount: 2500,
      cash: true,
      placedAt: minutesAgo(now, 90),
    }),
    makeDelivery(now, 12, {
      vendorId: 3,
      status: "picked_up",
      amount: 8250,
      cash: true,
      placedAt: minutesAgo(now, 35),
    }),
    makeDelivery(now, 1, {
      vendorId: 6,
      status: "on_the_way",
      amount: 2800,
      cash: false,
      placedAt: minutesAgo(now, 28),
    }),
    makeDelivery(now, 2, {
      vendorId: 3,
      status: "cancelled",
      amount: 2200,
      cash: false,
      placedAt: minutesAgo(now, 60 * 30),
      completedAt: minutesAgo(now, 60 * 29),
    }),
  ];

  // 18 finished deliveries: 8 today, 6 yesterday, 4 earlier.
  const sinceMidnight = Math.max(60, now.getHours() * 60 + now.getMinutes());
  const gap = Math.max(5, Math.min(35, Math.floor((sinceMidnight - 10) / 9)));
  const history: RiderHistoryRow[] = [];
  const rows: {
    minutes: number;
    earning: number;
    amount: number;
    cash: boolean;
    vendorId: number;
  }[] = [];
  const todayAmounts = [4250, 8250, 3000, 2600, 3200, 2800, 3500, 2200];
  todayAmounts.forEach((amount, i) =>
    rows.push({
      minutes: 10 + i * gap,
      earning: 800,
      amount,
      cash: i < 2,
      vendorId: (i % 6) + 1,
    }),
  );
  [1000, 1000, 900, 900, 700, 700].forEach((earning, i) =>
    rows.push({
      minutes: sinceMidnight + 120 + i * 50,
      earning,
      amount: 2400 + i * 300,
      cash: i % 3 === 0,
      vendorId: ((i + 2) % 6) + 1,
    }),
  );
  [800, 800, 800, 800].forEach((earning, i) =>
    rows.push({
      minutes: sinceMidnight + 60 * 24 * (2 + i) + 90,
      earning,
      amount: 3000 + i * 600,
      cash: i % 2 === 0,
      vendorId: (i % 6) + 1,
    }),
  );
  rows.forEach((row, i) => {
    const id = 200 + i;
    const when = minutesAgo(now, row.minutes);
    const delivery = makeDelivery(now, id, {
      vendorId: row.vendorId,
      status: "delivered",
      amount: row.amount,
      cash: row.cash,
      placedAt: minutesAgo(now, row.minutes + 40),
      completedAt: when,
    });
    delivery.code = `${ymd(when)}-${48010000 + id}`;
    deliveries.push(delivery);
    history.push({
      id: 500 + i,
      orderId: id,
      code: delivery.code,
      earning: row.earning,
      collection: row.cash ? row.amount : 0,
      cash: row.cash,
      date: when,
    });
  });

  const note = (
    id: number,
    title: string,
    body: string,
    minutes: number,
    unread: boolean,
    kind: AppNotification["kind"],
    orderId: number | null,
  ) => ({
    id,
    title,
    body,
    createdAt: minutesAgo(now, minutes),
    unread,
    kind,
    orderId,
  });
  const codeOf = (id: number) =>
    deliveries.find((d) => d.id === id)?.code ?? "";

  return {
    profile: riderProfile(persona, "approved"),
    deliveries,
    history,
    // Lifetime earnings shown on Home: ₦184,000 once the rows above are added.
    baseEarning: 184000 - history.reduce((sum, h) => sum + h.earning, 0),
    notifications: [
      note(
        1,
        "New delivery assigned",
        `Order #${codeOf(31)}, ₦4,500 cash`,
        2,
        true,
        "assigned",
        31,
      ),
      note(
        2,
        "New delivery assigned",
        `Order #${codeOf(87)}, paid online`,
        60,
        true,
        "assigned",
        87,
      ),
      note(
        3,
        "Cancellation reviewed",
        `Order #${codeOf(2)} was cancelled`,
        60 * 24,
        false,
        "cancelled",
        2,
      ),
      note(
        4,
        "Application approved",
        "You can take deliveries now",
        60 * 24 * 3,
        false,
        "approved",
        null,
      ),
    ],
  };
}
