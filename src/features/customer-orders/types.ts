import type { FulfilmentMode } from "~/features/customer-food/types";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface OrderVendor {
  id: number;
  name: string;
  logo: string | null;
}

export interface OrderSummary {
  id: number;
  code: string;
  vendor: OrderVendor;
  status: OrderStatus;
  itemCount: number;
  total: number;
  placedAt: string;
  /** Delivered and not rated yet. */
  canRate: boolean;
  paymentType: "online" | "cash";
  /** Minutes from placing to the door (vendor estimate). */
  etaMinutes: number;
}

export interface OrderLine {
  name: string;
  variation: string | null;
  quantity: number;
  lineTotal: number;
}

export interface OrderDetail extends OrderSummary {
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  paymentStatus: "paid" | "unpaid";
  mode: FulfilmentMode;
  address: string | null;
  rated: boolean;
}

export type StepState = "done" | "current" | "todo";

export interface TrackStep {
  key: "confirmed" | "picked_up" | "on_the_way" | "delivered";
  title: string;
  subtitle: string | null;
  state: StepState;
}

export interface TrackRider {
  name: string;
  phone: string;
  avatar: string | null;
  vehicle: string;
}

/** Map positions are fractions (0 to 1) of the map illustration. */
export interface TrackPoint {
  x: number;
  y: number;
}

export interface Tracking {
  order: OrderSummary;
  steps: TrackStep[];
  rider: TrackRider | null;
  etaMinutes: number | null;
  riderPosition: TrackPoint | null;
  vendorPosition: TrackPoint;
  homePosition: TrackPoint;
  route: TrackPoint[];
  /** Map illustration (static in demo mode). TODO(backend): live map data. */
  mapImage: string | null;
  /** True once the order reached a final status. */
  finished: boolean;
  itemsLabel: string;
}

export interface ChatMessage {
  id: number;
  mine: boolean;
  text: string;
  createdAt: string;
}

export interface ChatThread {
  vendor: OrderVendor;
  orderCode: string;
  messages: ChatMessage[];
}

export interface ReviewInput {
  orderId: number;
  rating: number;
  comment: string;
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  /** "2m", "20m", "3d". */
  ago: string;
  unread: boolean;
  kind:
    | "on_the_way"
    | "confirmed"
    | "delivered"
    | "cancelled"
    | "message"
    | "assigned"
    | "approved"
    | "info";
  orderId: number | null;
  vendorLogo: string | null;
}
