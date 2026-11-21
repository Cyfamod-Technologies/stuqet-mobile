import type { DeliveryStatus } from "~/features/seller-orders/types";
import { daysAgo, ymd } from "../format";
import type {
  DemoListing,
  DemoOrder,
  DemoOrderItem,
  DemoShopKind,
} from "../types";

type Line = [name: string, quantity: number, variation?: string];

/** [customer index, days ago, hour, minute, lines, delivery, paid, payment type, shipping] */
type Seed = [
  customer: number,
  days: number,
  hour: number,
  minute: number,
  lines: Line[],
  delivery: DeliveryStatus,
  paid: boolean,
  paymentType: string,
  shipping?: number,
];

const CUSTOMER_IDS = [9001, 9002, 9003, 9004, 9005];

const COD = "cash_on_delivery";
const CARD = "paystack";
const BANK = "manual_payment_2";

const PRODUCT_ORDERS: Seed[] = [
  [
    0,
    0,
    9,
    41,
    [
      ["Wireless earbuds", 1, "Black"],
      ["Phone case, orange", 1, "Clear / iPhone 13"],
    ],
    "pending",
    false,
    COD,
  ],
  [1, 0, 8, 12, [["Campus backpack", 1]], "confirmed", true, CARD],
  [
    2,
    0,
    7,
    5,
    [
      ["Notebook set, 3 pack", 1],
      ["Phone case, clear", 1],
      ["Water bottle 750ml", 1],
    ],
    "pending",
    false,
    BANK,
    500,
  ],
  [3, 1, 17, 48, [["Stuqet hoodie", 1, "Orange / L"]], "confirmed", true, CARD],
  [
    4,
    1,
    15,
    20,
    [["Orange canvas sneakers", 1, "Size 42"]],
    "pending",
    false,
    COD,
    1000,
  ],
  [
    2,
    1,
    11,
    2,
    [
      ["Notebook set, 3 pack", 1],
      ["Phone case, clear", 1],
      ["Water bottle 750ml", 1],
    ],
    "on_the_way",
    true,
    CARD,
  ],
  [0, 1, 9, 30, [["Bluetooth speaker", 1]], "on_the_way", true, CARD],
  [1, 2, 18, 15, [["Wireless earbuds Pro", 1]], "picked_up", true, CARD],
  [3, 2, 14, 0, [["Mini backpack", 1]], "delivered", true, CARD],
  [
    4,
    2,
    10,
    40,
    [["Stuqet hoodie", 2, "Orange / M"]],
    "delivered",
    true,
    CARD,
    1500,
  ],
  [0, 3, 16, 22, [["Water bottle 750ml", 2]], "delivered", true, COD],
  [
    2,
    3,
    12,
    5,
    [
      ["Orange canvas sneakers", 1, "Size 40"],
      ["Phone case, orange", 1],
    ],
    "delivered",
    true,
    CARD,
    1000,
  ],
  [1, 4, 19, 10, [["Campus backpack", 1]], "on_the_way", true, CARD],
  [3, 4, 13, 35, [["Notebook set, 3 pack", 3]], "delivered", true, COD],
  [4, 5, 9, 18, [["Wireless earbuds", 2, "White"]], "delivered", true, CARD],
  [0, 5, 8, 0, [["Phone case, clear", 1]], "cancelled", false, COD],
  [
    2,
    6,
    17,
    30,
    [["Stuqet hoodie, grey", 1, "Grey / M"]],
    "delivered",
    true,
    CARD,
  ],
  [
    1,
    6,
    11,
    45,
    [
      ["Bluetooth speaker", 1],
      ["Water bottle 750ml", 1],
    ],
    "delivered",
    true,
    CARD,
    800,
  ],
  [3, 8, 15, 12, [["Power bank 20000mAh", 1]], "delivered", true, CARD],
  [4, 10, 10, 5, [["Campus backpack", 1]], "delivered", true, BANK],
  [0, 12, 14, 50, [["Wireless earbuds", 1, "Black"]], "delivered", true, CARD],
  [
    2,
    15,
    9,
    25,
    [["Orange canvas sneakers", 1, "Size 41"]],
    "cancelled",
    false,
    CARD,
  ],
  [1, 18, 16, 40, [["Notebook set, 3 pack", 2]], "delivered", true, COD],
  [
    3,
    23,
    12,
    10,
    [["Stuqet hoodie", 1, "Orange / XL"]],
    "delivered",
    true,
    CARD,
  ],
];

const FOOD_ORDERS: Seed[] = [
  [
    0,
    0,
    12,
    10,
    [
      ["Jollof rice and chicken", 2],
      ["Strawberry smoothie", 1],
    ],
    "pending",
    false,
    COD,
    500,
  ],
  [1, 0, 11, 30, [["Chicken suya", 3]], "confirmed", true, CARD, 500],
  [2, 0, 9, 55, [["Chicken shawarma", 1]], "picked_up", true, CARD, 500],
  [
    3,
    1,
    19,
    20,
    [["Jollof rice, family tray", 1]],
    "on_the_way",
    true,
    CARD,
    1000,
  ],
  [4, 1, 13, 5, [["Pounded yam and egusi", 1]], "delivered", true, CARD, 500],
  [0, 2, 20, 15, [["Fried rice and plantain", 2]], "delivered", true, COD, 500],
  [
    2,
    3,
    12,
    40,
    [
      ["Meat pie", 4],
      ["Puff puff (10 pieces)", 1],
    ],
    "delivered",
    true,
    CARD,
    500,
  ],
  [1, 3, 18, 0, [["Beef suya, large", 1]], "cancelled", false, COD, 500],
  [3, 4, 14, 22, [["Chicken pie", 3]], "delivered", true, CARD, 500],
  [4, 5, 11, 11, [["Mango smoothie", 2]], "delivered", true, CARD, 500],
  [0, 6, 19, 45, [["Jollof rice and chicken", 1]], "delivered", true, COD, 500],
  [2, 9, 13, 30, [["Chicken shawarma", 2]], "delivered", true, CARD, 500],
];

const SERVICE_ORDERS: Seed[] = [
  [0, 0, 10, 0, [["Laptop repair and diagnosis", 1]], "pending", false, BANK],
  [1, 1, 15, 30, [["Maths and physics tutoring", 2]], "confirmed", true, CARD],
  [2, 2, 9, 15, [["Weekly laundry plan", 1]], "on_the_way", true, CARD],
  [3, 4, 16, 45, [["Tailoring and alterations", 1]], "delivered", true, CARD],
  [4, 6, 11, 20, [["Event photography", 1]], "delivered", true, CARD],
  [0, 9, 14, 5, [["Laptop repair and diagnosis", 1]], "cancelled", false, COD],
];

const SEEDS: Record<DemoShopKind, Seed[]> = {
  product: PRODUCT_ORDERS,
  food: FOOD_ORDERS,
  service: SERVICE_ORDERS,
};

/** Order total, shared by the list and detail endpoints. */
export function orderSubtotal(order: DemoOrder): number {
  return order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
}

export function orderTotal(order: DemoOrder): number {
  return orderSubtotal(order) + order.shipping + order.tax - order.coupon;
}

/** Orders for a shop kind, oldest first, priced from the shop's listings. */
export function buildOrders(
  kind: DemoShopKind,
  now: Date,
  listings: DemoListing[],
): DemoOrder[] {
  const seeds = [...SEEDS[kind]].reverse();
  return seeds.map(
    (
      [
        customer,
        days,
        hour,
        minute,
        lines,
        delivery,
        paid,
        paymentType,
        shipping,
      ],
      index,
    ) => {
      const id = 5000 + index + 1;
      const createdAt = daysAgo(now, days, hour, minute);
      const items = lines.map(([name, quantity, variation]): DemoOrderItem => ({
        name,
        quantity,
        variation: variation ?? null,
        unitPrice: listings.find((l) => l.name === name)?.unitPrice ?? 1000,
      }));
      return {
        id,
        code: `${ymd(createdAt)}-${String(12345000 + id * 37).padStart(8, "0")}`,
        createdAt,
        customerId: CUSTOMER_IDS[customer],
        items,
        deliveryStatus: delivery,
        paymentStatus: paid ? "paid" : "unpaid",
        paymentType,
        shipping: shipping ?? 0,
        tax: 0,
        coupon: 0,
      };
    },
  );
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Cash On Delivery",
  paystack: "Paystack",
  manual_payment_2: "Bank Transfer",
};
