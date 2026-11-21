import type { DemoAccount } from "../types";

/** Password of every demo account. */
export const DEMO_PASSWORD = "Demo@1234";

/** Code accepted by every verification and password reset step. */
export const DEMO_CODE = "123456";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    persona: "customer",
    label: "Customer",
    hint: "Ada Okafor: addresses, a cart with a coupon to try, orders in every status",
    email: "ada@student.edu",
    phone: "08031234567",
    password: DEMO_PASSWORD,
    userId: 5001,
    name: "Ada Okafor",
    type: "customer",
  },
  {
    persona: "newbie",
    label: "New customer",
    hint: "Chidi Eze: nothing yet, so the empty cart, orders and notifications show",
    email: "chidi@student.edu",
    phone: "08052345678",
    password: DEMO_PASSWORD,
    userId: 5002,
    name: "Chidi Eze",
    type: "customer",
  },
  {
    persona: "rider",
    label: "Rider",
    hint: "Tunde Adeyemi: approved rider with deliveries in every status and earnings",
    email: "tunde@rider.stuqet.com",
    phone: "08011112222",
    password: DEMO_PASSWORD,
    userId: 6001,
    name: "Tunde Adeyemi",
    type: "delivery_boy",
  },
  {
    persona: "riderReview",
    label: "Rider (review)",
    hint: "Sade Bello: application under review (approved on the 2nd check)",
    email: "sade@rider.stuqet.com",
    phone: "08074567890",
    password: DEMO_PASSWORD,
    userId: 6002,
    name: "Sade Bello",
    type: "delivery_boy",
  },
];

export function findAccount(identifier: string): DemoAccount | undefined {
  const value = identifier.trim().toLowerCase();
  const digits = value.replace(/[^\d]/g, "");
  return DEMO_ACCOUNTS.find(
    (account) =>
      account.email === value ||
      (digits.length >= 7 && account.phone.endsWith(digits.slice(-10))),
  );
}
