/** `listing_type` values the vendor catalogue handles. */
export type ListingType = "product" | "food";

/** Every `listing_type` the list endpoint accepts. */
export type AnyListingType = ListingType | "service";

export type FoodDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DeliveryOption = "delivery" | "pickup" | "dine_in";
export type PrepTimeUnit = "minutes" | "hours";
export type StockMode = "unlimited" | "limited";
export type AvailabilityMode = "always" | "scheduled";
export type ManualOverride = "auto" | "available" | "sold_out";

export interface TimeSlot {
  /** "HH:mm". */
  start: string;
  end: string;
}

/** `food_meta` as the backend stores and returns it (normalizeFoodMeta). */
export interface FoodMeta {
  short_description?: string;
  availability_mode?: AvailabilityMode;
  available_days?: FoodDay[];
  time_slots?: TimeSlot[];
  stock_mode?: StockMode;
  delivery_options?: DeliveryOption[];
  prep_time_value?: number | null;
  prep_time_unit?: PrepTimeUnit;
  auto_time_based?: boolean | number;
  auto_stock_based?: boolean | number;
  manual_override?: ManualOverride;
}

export type FoodAvailabilityStatus =
  "available" | "sold_out" | "unpublished" | "outside_schedule";

export interface FoodAvailabilityInfo {
  is_available: boolean;
  status: FoodAvailabilityStatus;
  timezone: string;
}

export type ServiceType =
  | "one_time"
  | "recurring"
  | "consultation"
  | "installation"
  | "repair_maintenance"
  | "training_coaching"
  | "custom"
  | "on_site"
  | "remote_virtual"
  | "package"
  | "subscription"
  | "emergency";

export type ServicePricingType =
  | "fixed_price"
  | "hourly_rate"
  | "daily_rate"
  | "weekly_rate"
  | "monthly_subscription"
  | "custom_quote"
  | "free_consultation";

export type ServiceSlotMode = "unlimited" | "limited";

/** `service_meta` as ProductService::normalizeServiceMeta stores it. */
export interface ServiceMeta {
  service_type?: ServiceType;
  pricing_type?: ServicePricingType;
  location?: string;
  service_area?: string;
  slot_mode?: ServiceSlotMode;
}

/** One row of GET /seller/products/all (Seller\ProductCollection). */
export interface SellerProduct {
  id: number;
  name: string;
  /** Null on legacy rows created before listing types existed. */
  listing_type: ListingType | "service" | null;
  /** Empty array / null for non-food rows. */
  food_meta: FoodMeta | [] | null;
  /**
   * TODO(backend): Seller\ProductCollection does not return `service_meta`
   * yet, so this is undefined today. Service rows then fall back to the plain
   * price and the category name until the field is added.
   */
  service_meta?: ServiceMeta | [] | null;
  food_availability: FoodAvailabilityInfo | null;
  /** Absolute URL (the server returns a placeholder when there is no photo). */
  thumbnail_img: string;
  /** Formatted money string, e.g. "₦3,000.00". Display as given. */
  price: string;
  current_stock: number;
  /** Published switch. */
  status: boolean;
  /** Main category name. */
  category: string;
  featured: boolean;
  /**
   * Admin approval. NOT returned by the list endpoint yet (backend audit B5),
   * so this is undefined today and the "Awaiting approval" badge stays hidden
   * until the field is added.
   */
  approved?: boolean;
}

/** Laravel paginator meta (the list uses `paginate(10)`). */
export interface ListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SellerProductsPage {
  data: SellerProduct[];
  meta?: ListMeta;
}

export interface ListProductsParams {
  listing_type: AnyListingType;
  search?: string;
  page: number;
}

/** Node of GET /seller/products/categories (children nest under `child`). */
export interface CategoryNode {
  id: number;
  parent_id: number;
  level: number;
  name: string;
  child: CategoryNode[];
}

export interface CategoryOption {
  id: number;
  /** Name indented by depth, for the picker. */
  label: string;
  name: string;
  depth: number;
}

/** food_meta sent on create. */
export interface FoodMetaPayload {
  short_description: string;
  delivery_options: DeliveryOption[];
  prep_time_value: number;
  prep_time_unit: PrepTimeUnit;
  stock_mode: StockMode;
  availability_mode: AvailabilityMode;
  available_days?: FoodDay[];
  time_slots?: TimeSlot[];
  /** True when scheduled so the schedule actually hides the item. */
  auto_time_based: boolean;
  /** True when stock is limited so zero quantity marks it sold out. */
  auto_stock_based: boolean;
  manual_override: ManualOverride;
}

/** service_meta sent on create (ProductRequest `service_meta.*` rules). */
export interface ServiceMetaPayload {
  service_type: ServiceType;
  pricing_type: ServicePricingType;
  location?: string;
  service_area?: string;
  slot_mode: ServiceSlotMode;
}

/** Body of POST /seller/products/add. */
export interface CreateProductPayload {
  listing_type: AnyListingType;
  name: string;
  category_ids: number[];
  category_id: number;
  unit_price: number;
  /** Products and food only (the web service form has no unit). */
  unit?: string;
  current_stock?: number;
  /** Comma-separated upload ids. */
  photos?: string;
  thumbnail_img?: string;
  /** Hidden field: the product path throws without it ("[]" = Tagify JSON). */
  tags: string[];
  /** Hidden field: publish | unpublish | draft. */
  button: "publish" | "unpublish" | "draft";
  cash_on_delivery?: 0 | 1;
  food_meta?: FoodMetaPayload;
  /** Services: required by the API, "Minimum Booking Qty" on the web form. */
  min_qty?: number;
  description?: string;
  service_meta?: ServiceMetaPayload;
}

export interface ChangeStatusInput {
  id: number;
  status: boolean;
}

/** HTTP 422 body for failed validation. */
export interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}
