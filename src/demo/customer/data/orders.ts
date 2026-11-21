import type { OrderStatus } from "~/features/customer-orders/types";
import { minutesAgo } from "../format";
import { priceLine } from "../pricing";
import type { DemoOrder, DemoOrderLine, DemoPersona } from "../types";
import { dishByName, vendorById } from "./vendors";

function line(
  vendorId: number,
  name: string,
  opts: { size?: string; addOns?: string[]; qty?: number } = {},
): DemoOrderLine {
  const dish = dishByName(vendorId, name);
  if (!dish) throw new Error(`Demo dish missing: ${name}`);
  const priced = priceLine(dish, opts.size ?? null, opts.addOns ?? []);
  return {
    name: dish.name,
    variation: priced.variation,
    quantity: opts.qty ?? 1,
    unitPrice: priced.unitPrice,
  };
}

const TUNDE = {
  name: "Tunde",
  phone: "0801 111 2222",
  avatar: "people/tunde",
} as const;
const CHIDI = {
  name: "Chidi",
  phone: "0802 222 3333",
  avatar: "people/chidi",
} as const;

interface Seed {
  id: number;
  code: string;
  vendorId: number;
  status: OrderStatus;
  ago: number;
  lines: DemoOrderLine[];
  /** Delivery fee; the vendor's usual fee when omitted. */
  fee?: number;
  paymentType: "online" | "cash";
  rated?: boolean;
  /** Seconds into the live status schedule at app start (auto orders). */
  autoAt?: number;
  rider?: boolean;
}

// Codes follow the boards (#20260102-48120031). Ada's orders cover every status.
const ADA_ORDERS: Seed[] = [
  {
    id: 6001,
    code: "20261121-48120031",
    vendorId: 1,
    status: "on_the_way",
    ago: 38,
    lines: [
      line(1, "Jollof rice and chicken", {
        size: "regular",
        addOns: ["chicken"],
      }),
      line(1, "Zobo drink", { qty: 2 }),
    ],
    paymentType: "online",
    autoAt: 52,
    rider: true,
  },
  {
    id: 6002,
    code: "20261121-48119987",
    vendorId: 2,
    status: "confirmed",
    ago: 8,
    lines: [line(2, "Classic beef burger")],
    fee: 0,
    paymentType: "cash",
  },
  {
    id: 6003,
    code: "20261121-48119990",
    vendorId: 5,
    status: "pending",
    ago: 1,
    lines: [line(5, "Amala and ewedu", { addOns: ["meat"] })],
    paymentType: "online",
  },
  {
    id: 6004,
    code: "20261121-48119951",
    vendorId: 6,
    status: "preparing",
    ago: 12,
    lines: [
      line(6, "Chocolate cake slice", { qty: 2 }),
      line(6, "Doughnuts (box of 3)"),
    ],
    paymentType: "online",
  },
  {
    id: 6005,
    code: "20261121-48119902",
    vendorId: 4,
    status: "ready",
    ago: 22,
    lines: [line(4, "Grilled chicken platter", { size: "half" })],
    paymentType: "cash",
  },
  {
    id: 6006,
    code: "20261121-48119811",
    vendorId: 7,
    status: "picked_up",
    ago: 30,
    lines: [line(7, "Garden salad bowl", { size: "large" })],
    paymentType: "online",
    rider: true,
  },
  {
    id: 6007,
    code: "20261118-48010002",
    vendorId: 1,
    status: "delivered",
    ago: 60 * 24 * 3,
    lines: [line(1, "Jollof rice and chicken", { size: "regular" })],
    fee: 500,
    paymentType: "online",
    rider: true,
  },
  {
    id: 6008,
    code: "20261117-47990310",
    vendorId: 2,
    status: "delivered",
    ago: 60 * 24 * 4,
    lines: [line(2, "Chicken shawarma"), line(2, "Meat pie", { qty: 2 })],
    paymentType: "cash",
    rated: true,
    rider: true,
  },
  {
    id: 6009,
    code: "20261110-47851220",
    vendorId: 3,
    status: "delivered",
    ago: 60 * 24 * 11,
    lines: [line(3, "Beef suya", { size: "medium" })],
    paymentType: "online",
    rated: true,
    rider: true,
  },
  {
    id: 6010,
    code: "20261116-47955120",
    vendorId: 3,
    status: "cancelled",
    ago: 60 * 24 * 5,
    lines: [line(3, "Beef suya", { size: "small" }), line(3, "Zobo drink")],
    fee: 200,
    paymentType: "online",
  },
];

export function buildOrders(persona: DemoPersona, now: Date): DemoOrder[] {
  if (persona !== "customer") return [];
  return ADA_ORDERS.map((seed): DemoOrder => {
    const vendor = vendorById(seed.vendorId);
    const placedAt =
      seed.autoAt !== undefined
        ? new Date(now.getTime() - seed.autoAt * 1000)
        : minutesAgo(now, seed.ago);
    const riderSeed = seed.rider ? (seed.id % 2 === 0 ? CHIDI : TUNDE) : null;
    return {
      id: seed.id,
      code: seed.code,
      vendorId: seed.vendorId,
      status: seed.status,
      autoFrom: seed.autoAt !== undefined ? placedAt : null,
      placedAt:
        seed.autoAt !== undefined ? minutesAgo(now, seed.ago) : placedAt,
      lines: seed.lines,
      deliveryFee: seed.fee ?? vendor?.deliveryFee ?? 400,
      discount: 0,
      paymentType: seed.paymentType,
      mode: "delivery",
      address: "12 Hostel Road, Akoka, Lagos",
      rated: seed.rated ?? false,
      rider: riderSeed ? { ...riderSeed } : null,
    };
  });
}
