import type {
  DishAddOn,
  DishSize,
  DishStatus,
  FulfilmentMode,
} from "~/features/customer-food/types";
import type { OrderStatus } from "~/features/customer-orders/types";
import type { CustomerImageKey } from "./images";

/** Every demo login. Passwords are all DEMO_PASSWORD. */
export type DemoPersona = "customer" | "newbie" | "rider" | "riderReview";

export interface DemoAccount {
  persona: DemoPersona;
  /** What the login helper chip says. */
  label: string;
  /** What this account demonstrates. */
  hint: string;
  email: string;
  phone: string;
  password: string;
  userId: number;
  name: string;
  /** "customer" or "delivery_boy" (the API's `user_type`). */
  type: "customer" | "delivery_boy";
}

export interface DemoVendor {
  id: number;
  name: string;
  logo: CustomerImageKey | null;
  cover: CustomerImageKey;
  rating: number;
  reviewCount: number;
  prepMinutes: number;
  etaMinutes: number;
  deliveryFee: number;
  isOpen: boolean;
  opensLabel: string | null;
  modes: FulfilmentMode[];
  categories: string[];
  phone: string;
  address: string;
}

export interface DemoDish {
  id: number;
  vendorId: number;
  name: string;
  description: string;
  image: CustomerImageKey | null;
  section: string;
  prepMinutes: number;
  status: DishStatus;
  availableWindow: string | null;
  modes: FulfilmentMode[];
  sizes: DishSize[];
  addOns: DishAddOn[];
  /** Price when there are no sizes. */
  price: number;
  /** "500 ml": shown as the variation when there are no sizes. */
  unit: string | null;
  /** Shown in "Popular near you". */
  popular: boolean;
}

export interface DemoCartLine {
  id: number;
  dishId: number;
  sizeId: string | null;
  addOnIds: string[];
  quantity: number;
  note: string | null;
}

export interface DemoOrderLine {
  name: string;
  variation: string | null;
  quantity: number;
  unitPrice: number;
}

export interface DemoOrder {
  id: number;
  code: string;
  vendorId: number;
  status: OrderStatus;
  /** Statuses advance with the clock from `autoFrom` (new orders). */
  autoFrom: Date | null;
  placedAt: Date;
  lines: DemoOrderLine[];
  deliveryFee: number;
  discount: number;
  paymentType: "online" | "cash";
  mode: FulfilmentMode;
  address: string | null;
  rated: boolean;
  rider: { name: string; phone: string; avatar: CustomerImageKey } | null;
}

export interface DemoMessage {
  id: number;
  mine: boolean;
  text: string;
  createdAt: Date;
}

export interface DemoNotification {
  id: number;
  title: string;
  body: string;
  createdAt: Date;
  unread: boolean;
  kind: import("~/features/customer-orders/types").AppNotification["kind"];
  orderId: number | null;
  vendorId: number | null;
}

export interface DemoAddress {
  id: number;
  label: string;
  address: string;
  phone: string;
  isDefault: boolean;
  stateId: number;
  cityId: number;
  areaId: number | null;
}

export interface DemoCoupon {
  code: string;
  percent: number;
  cap: number;
}
