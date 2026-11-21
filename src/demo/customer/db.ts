import { customerImage } from "./images";
import { ACCOUNT_PROFILES, buildAddresses } from "./data/profiles";
import { buildOrders } from "./data/orders";
import { buildMessages } from "./data/chat";
import { buildNotifications } from "./data/notifications";
import { buildCartLines } from "./data/cart";
import type {
  DemoAddress,
  DemoCartLine,
  DemoMessage,
  DemoNotification,
  DemoOrder,
  DemoPersona,
} from "./types";

export interface DemoCustomerDb {
  persona: DemoPersona;
  now: Date;
  name: string;
  email: string;
  phone: string;
  school: string;
  avatar: string | null;
  interests: number[];
  riderStatus: "none" | "pending" | "approved";
  favouriteVendors: Set<number>;
  favouriteDishes: Set<number>;
  cart: DemoCartLine[];
  /** Coupon applied per vendor id. */
  coupons: Map<number, string>;
  addresses: DemoAddress[];
  orders: DemoOrder[];
  /** Chat per order id. */
  messages: Map<number, DemoMessage[]>;
  notifications: DemoNotification[];
  next: {
    cart: number;
    order: number;
    address: number;
    message: number;
    notification: number;
  };
}

const databases = new Map<DemoPersona, DemoCustomerDb>();

function createDb(persona: DemoPersona): DemoCustomerDb {
  const now = new Date();
  const profile = ACCOUNT_PROFILES[persona];
  const orders = buildOrders(persona, now);
  const messages = buildMessages(persona, now, orders);
  return {
    persona,
    now,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    school: profile.school,
    avatar: profile.avatar ? customerImage(profile.avatar) : null,
    interests: profile.interests,
    riderStatus: profile.riderStatus,
    favouriteVendors: new Set(profile.favouriteVendors),
    favouriteDishes: new Set(profile.favouriteDishes),
    cart: buildCartLines(persona),
    coupons: new Map(),
    addresses: buildAddresses(persona),
    orders,
    messages,
    notifications: buildNotifications(persona, now, orders),
    next: {
      cart: 900,
      order: 7000,
      address: 80,
      message: 500,
      notification: 300,
    },
  };
}

export function getCustomerDb(persona: DemoPersona): DemoCustomerDb {
  let db = databases.get(persona);
  if (!db) {
    db = createDb(persona);
    databases.set(persona, db);
  }
  return db;
}

/** Throws every change away; the next request rebuilds the sample data. */
export function resetCustomerDemoData(): void {
  databases.clear();
}
