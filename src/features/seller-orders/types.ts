/** Delivery statuses the backend stores on an order (order_details too). */
export type DeliveryStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "paid" | "unpaid";

/** One row of GET /seller/orders (OrderCollection), normalised. */
export interface OrderSummary {
  id: number;
  code: string;
  /** Formatted money string, e.g. "₦4,500.00". */
  total: string;
  /** Raw `d-m-Y` string from the API. */
  date: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
}

export interface OrdersPage {
  orders: OrderSummary[];
  page: number;
  hasMore: boolean;
  /** Total matching orders (Laravel paginator meta), when the API sends it. */
  total: number | null;
}

export interface OrderFilters {
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus;
}

export interface OrderCustomer {
  name: string;
  phone: string | null;
  /** Address lines joined into one string. */
  address: string | null;
}

export interface OrderItem {
  name: string;
  quantity: string;
  variation: string | null;
  /** Formatted line price. */
  price: string;
}

/** `data[0]` of GET /seller/orders/details/{id} (OrderDetailResource). */
export interface OrderDetail {
  id: number;
  code: string;
  total: string;
  /** Raw `d-m-Y` string from the API (no time of day). */
  date: string;
  paymentStatus: PaymentStatus;
  /** Raw payment_type, e.g. "cash_on_delivery", "manual_payment_2". */
  paymentMethod: string;
  /** Human label, e.g. "Cash On Delivery". */
  paymentLabel: string;
  deliveryStatus: DeliveryStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: string;
  tax: string;
  shipping: string;
  couponDiscount: string;
}

// ---- Raw API shapes ------------------------------------------------------

export interface RawOrderSummary {
  id: number;
  order_code: string;
  total: string;
  order_date: string;
  payment_status: string;
  /** Underscores replaced by spaces, e.g. "picked up". */
  delivery_status: string;
}

export interface RawPaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export interface RawOrdersResponse {
  data: RawOrderSummary[];
  meta?: RawPaginationMeta;
}

export interface RawShippingAddress {
  name?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  phone?: string | null;
}

export interface RawOrderItem {
  name: string | null;
  /** "2" or "2 x Black". */
  description: string;
  delivery_status: string;
  price: string;
}

export interface RawOrderDetail {
  order_code: string;
  total: string;
  order_date: string;
  payment_status: string;
  payment_type: string;
  delivery_status: string;
  shipping_type: string | null;
  payment_method: string;
  shipping_address: RawShippingAddress | null;
  shipping_cost: string;
  subtotal: string;
  coupon_discount: string;
  tax: string;
  order_items: RawOrderItem[];
}

export interface UpdateDeliveryStatusInput {
  orderId: number;
  status: DeliveryStatus;
}
