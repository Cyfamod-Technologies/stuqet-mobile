import type { DeliveryOption, FoodDay, ListingType } from "./types";

/** Stock at or below this shows the amber "N left" badge (client rule: the list
 * payload has no low-stock threshold). */
export const LOW_STOCK_THRESHOLD = 5;

export const LISTING_LABELS: Record<
  ListingType,
  { tab: string; singular: string; plural: string; search: string }
> = {
  product: {
    tab: "Products",
    singular: "product",
    plural: "products",
    search: "Search products",
  },
  food: {
    tab: "Food",
    singular: "food item",
    plural: "food items",
    search: "Search food",
  },
};

export const DELIVERY_OPTIONS: { value: DeliveryOption; label: string }[] = [
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Pickup" },
  { value: "dine_in", label: "Dine in" },
];

export const DAYS: { value: FoodDay; short: string; long: string }[] = [
  { value: "monday", short: "Mon", long: "Monday" },
  { value: "tuesday", short: "Tue", long: "Tuesday" },
  { value: "wednesday", short: "Wed", long: "Wednesday" },
  { value: "thursday", short: "Thu", long: "Thursday" },
  { value: "friday", short: "Fri", long: "Friday" },
  { value: "saturday", short: "Sat", long: "Saturday" },
  { value: "sunday", short: "Sun", long: "Sunday" },
];

/** Days a new scheduled item starts with (design preselects Mon to Fri). */
export const DEFAULT_SCHEDULE_DAYS: FoodDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const NAME_MAX = 200;
export const SHORT_DESCRIPTION_MAX = 255;
export const UNIT_MAX = 20;
export const MAX_CATEGORY_DEPTH = 6;

/** Backend message when the seller's package expired or hit its upload limit. */
export const PACKAGE_LIMIT_PATTERN = /upgrade your package/i;
