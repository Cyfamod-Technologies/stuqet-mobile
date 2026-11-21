import type {
  FoodMeta,
  ListingType,
  ServiceMeta,
} from "~/features/seller-products/types";
import type {
  DeliveryStatus,
  PaymentStatus,
} from "~/features/seller-orders/types";
import type { ShopInfo, ShopType } from "~/features/seller-shop/types";
import type { TicketStatus } from "~/features/seller-support/types";
import type { DemoImageKey } from "./images";

/** Shop kinds that have their own data set. */
export type DemoShopKind = ShopType;

/** Data sets: one per shop kind, plus an empty shop for the approved account. */
export type DemoDataSet = DemoShopKind | "fresh";

/** Every demo login. The last two only exist to show the status screens. */
export type DemoAccountKind = DemoShopKind | "review" | "suspended";

export interface DemoAccount {
  kind: DemoAccountKind;
  /** What the login helper chip says. */
  label: string;
  /** What this account demonstrates. */
  hint: string;
  email: string;
  phone: string;
  password: string;
  userId: number;
  name: string;
}

export interface DemoCustomer {
  id: number;
  name: string;
  phone: string;
  address: string;
  avatar: DemoImageKey;
}

/** One catalogue row (product, food or service). */
export interface DemoListing {
  id: number;
  listingType: ListingType | "service";
  name: string;
  categoryIds: number[];
  unitPrice: number;
  unit: string | null;
  stock: number;
  /** Bundled image or a data: URI of a photo added in demo mode. */
  thumbnail: string;
  published: boolean;
  featured: boolean;
  approved: boolean;
  description: string;
  foodMeta: FoodMeta | null;
  serviceMeta: ServiceMeta | null;
}

export interface DemoOrderItem {
  name: string;
  quantity: number;
  variation: string | null;
  unitPrice: number;
}

export interface DemoOrder {
  id: number;
  code: string;
  createdAt: Date;
  customerId: number;
  items: DemoOrderItem[];
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  /** `cash_on_delivery`, `paystack`, `manual_payment_2`... */
  paymentType: string;
  shipping: number;
  tax: number;
  coupon: number;
}

export interface DemoMessage {
  id: number;
  /** True when the seller wrote it. */
  fromSeller: boolean;
  text: string;
  at: Date;
  /** Not returned before this time, so a reply can arrive while chatting. */
  visibleAt: number;
}

export interface DemoConversation {
  id: number;
  customerId: number;
  title: string | null;
  messages: DemoMessage[];
}

export interface DemoNotification {
  id: string;
  /** Suffix of the Laravel class: Order, ShopProduct, Payout, ShopVerification. */
  kind: "Order" | "ShopProduct" | "Payout" | "ShopVerification";
  data: Record<string, string | number>;
  text: string;
  at: Date;
  unread: boolean;
}

export interface DemoPayment {
  id: number;
  amount: number;
  method: string;
  at: Date;
}

export interface DemoWithdrawal {
  id: number;
  amount: number;
  status: "Pending" | "Paid";
  at: Date;
}

export interface DemoCommission {
  id: number;
  orderCode: string;
  commission: number;
  earning: number;
  at: Date;
}

export interface DemoTicketMessage {
  id: number;
  body: string;
  fromSupport: boolean;
  senderName: string | null;
  attachments: string[];
  at: Date;
  visibleAt: number;
}

export interface DemoTicket {
  id: number;
  code: string;
  subject: string;
  status: TicketStatus;
  at: Date;
  messages: DemoTicketMessage[];
}

export interface DemoVerification {
  submitted: boolean;
  verified: boolean;
}

/** Everything the signed-in demo seller can read and change. */
export interface DemoDb {
  kind: DemoShopKind;
  now: Date;
  shop: ShopInfo;
  /** Shop-level numbers that move when orders or withdrawals change. */
  balance: number;
  listings: DemoListing[];
  orders: DemoOrder[];
  conversations: DemoConversation[];
  notifications: DemoNotification[];
  payments: DemoPayment[];
  withdrawals: DemoWithdrawal[];
  commissions: DemoCommission[];
  tickets: DemoTicket[];
  verification: DemoVerification;
  /** Uploaded images by id (data: URIs or bundled image URIs). */
  uploads: Map<number, string>;
  next: {
    listing: number;
    order: number;
    upload: number;
    message: number;
    ticket: number;
    ticketMessage: number;
    withdrawal: number;
  };
}
