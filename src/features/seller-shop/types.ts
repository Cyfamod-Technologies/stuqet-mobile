/** Business category of a shop. The API does not return it yet (see the vendor
 * API audit), so `ShopInfo.business_category` is optional. */
export type ShopType = "product" | "food" | "service";

/** `data` of GET /seller/shop/info (ShopDetailsCollection). */
export interface ShopInfo {
  id: number;
  user_id: number;
  name: string;
  title: string | null;
  description: string | null;
  logo: string;
  /** Upload id of the logo (what shop-update expects). */
  upload_id: string | null;
  sliders: string[];
  sliders_id: string | null;
  address: string | null;
  phone: string | null;
  email: string;
  rating: number;
  verified: boolean;
  /** True once the verification form has been submitted. */
  is_submitted_form: boolean;
  verify_text: string;
  package_invalid_at: string;
  product_upload_limit: number | null;
  seller_package: string;
  /** Formatted money string, e.g. "₦86,400.00". */
  admin_to_pay: string;
  cash_on_delivery_status: number;
  bank_payment_status: number;
  bank_name: string | null;
  bank_acc_name: string | null;
  bank_acc_no: string | null;
  bank_routing_no: string | null;
  /** Number of products (all types). */
  products: number;
  /** Delivered orders. */
  orders: number;
  /** Formatted money string of paid sales. */
  sales: string;
  /** Not returned yet — needs a backend change. */
  business_category?: ShopType;
}
