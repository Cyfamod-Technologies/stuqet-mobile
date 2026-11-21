import type { AppNotification } from "~/features/customer-orders/types";
import type { DeliveryStatus } from "~/features/rider-deliveries/types";
import type { RiderProfile } from "~/features/rider-account/types";
import { customerImage } from "../customer/images";
import type { DemoPersona } from "../customer/types";
import { buildRiderSeed } from "./data/deliveries";

export interface RiderDelivery {
  id: number;
  code: string;
  vendorId: number;
  status: DeliveryStatus;
  amount: number;
  cash: boolean;
  placedAt: Date;
  completedAt: Date | null;
  cancelRequested: boolean;
  dropoffName: string;
  dropoffAddress: string;
  dropoffPhone: string;
}

export interface RiderHistoryRow {
  id: number;
  orderId: number;
  code: string;
  earning: number;
  collection: number;
  cash: boolean;
  date: Date;
}

export interface RiderDb {
  persona: DemoPersona;
  now: Date;
  profile: RiderProfile | null;
  deliveries: RiderDelivery[];
  history: RiderHistoryRow[];
  /** Earnings before the rows above (lifetime total of the profile card). */
  baseEarning: number;
  notifications: (Omit<AppNotification, "ago" | "vendorLogo"> & {
    createdAt: Date;
  })[];
  /** Times the application status was checked (approved on the 2nd). */
  checks: number;
  next: { delivery: number; history: number; notification: number };
}

const databases = new Map<DemoPersona, RiderDb>();

function createDb(persona: DemoPersona): RiderDb {
  const now = new Date();
  const seed = buildRiderSeed(persona, now);
  return {
    persona,
    now,
    profile: seed.profile,
    deliveries: seed.deliveries,
    history: seed.history,
    baseEarning: seed.baseEarning,
    notifications: seed.notifications,
    checks: 0,
    next: { delivery: 9000, history: 9500, notification: 600 },
  };
}

export function getRiderDb(persona: DemoPersona): RiderDb {
  let db = databases.get(persona);
  if (!db) {
    db = createDb(persona);
    databases.set(persona, db);
  }
  return db;
}

export function resetRiderDemoData(): void {
  databases.clear();
}

export const riderAvatar = (persona: DemoPersona) =>
  customerImage(persona === "riderReview" ? "people/fatima" : "people/tunde");
