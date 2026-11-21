import type { FulfilmentMode } from "~/features/customer-food/types";

export interface CartItem {
  id: number;
  dishId: number;
  name: string;
  image: string | null;
  /** "Large · Extra chicken, Fried plantain" or a size such as "500 ml". */
  variation: string | null;
  quantity: number;
  /** Price of one unit with the size and add-ons. */
  unitPrice: number;
  lineTotal: number;
  note: string | null;
}

export interface CartCoupon {
  code: string;
  /** "10% off food, up to ₦500. You save ₦430 on this order." */
  message: string;
  amount: number;
}

export interface CartGroup {
  vendor: {
    id: number;
    name: string;
    logo: string | null;
    prepMinutes: number;
    arriveMinutes: number;
  };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon: CartCoupon | null;
}

export interface Cart {
  groups: CartGroup[];
  count: number;
}

export interface AddToCartInput {
  dishId: number;
  sizeId: string | null;
  addOnIds: string[];
  quantity: number;
  note?: string | null;
  /** Empty the cart first (the user chose to start a new one). */
  replace?: boolean;
}

export interface AddressView {
  id: number;
  label: string;
  address: string;
  phone: string;
  isDefault: boolean;
  stateId: number;
  cityId: number;
  areaId: number | null;
}

export interface AddressInput {
  label: string;
  address: string;
  stateId: number;
  cityId: number;
  areaId: number | null;
  phone: string;
  makeDefault?: boolean;
}

export type PaymentChoice = "online" | "cash";

export interface CheckoutPreview {
  vendor: CartGroup["vendor"];
  itemCount: number;
  modes: FulfilmentMode[];
  mode: FulfilmentMode;
  address: AddressView | null;
  phone: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface PlaceOrderInput {
  vendorId: number;
  mode: FulfilmentMode;
  addressId: number | null;
  phone: string;
  payment: PaymentChoice;
}

export interface Option {
  id: number;
  name: string;
}
