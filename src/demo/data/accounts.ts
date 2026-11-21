import type { DemoAccount } from "../types";

/** Password of every demo account. */
export const DEMO_PASSWORD = "Demo@1234";

/** Reset-code accepted by the demo "forgot password" flow. */
export const DEMO_RESET_CODE = "123456";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    kind: "product",
    label: "Products + food",
    hint: "Campus Mart: sells products and food, five tabs",
    email: "shop@campusmart.com",
    phone: "08031234567",
    password: DEMO_PASSWORD,
    userId: 4021,
    name: "Chinedu Okafor",
  },
  {
    kind: "food",
    label: "Food shop",
    hint: "Mama Ngozi's Kitchen: food only, kitchen home",
    email: "kitchen@mamangozi.com",
    phone: "08052345678",
    password: DEMO_PASSWORD,
    userId: 4022,
    name: "Ngozi Eze",
  },
  {
    kind: "service",
    label: "Service shop",
    hint: "Campus Fix-It: services, three tabs",
    email: "hello@campusfixit.com",
    phone: "08063456789",
    password: DEMO_PASSWORD,
    userId: 4023,
    name: "Bola Adeyemi",
  },
  {
    kind: "review",
    label: "Under review",
    hint: "Shows the under-review screen (approved on the 2nd check)",
    email: "review@stuqet.com",
    phone: "08074567890",
    password: DEMO_PASSWORD,
    userId: 4024,
    name: "Sade Bello",
  },
  {
    kind: "suspended",
    label: "Suspended",
    hint: "Shows the suspended screen",
    email: "suspended@stuqet.com",
    phone: "08085678901",
    password: DEMO_PASSWORD,
    userId: 4025,
    name: "Ifeanyi Obi",
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
