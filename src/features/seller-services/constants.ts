import type {
  ServicePricingType,
  ServiceSlotMode,
  ServiceType,
} from "~/features/seller-products/types";

/** Values and order follow the ServiceTypeSheet board; the values are the
 * `service_meta.service_type` enum of ProductRequest. */
export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: "one_time", label: "One-Time Service" },
  { value: "recurring", label: "Recurring Service" },
  { value: "consultation", label: "Consultation" },
  { value: "installation", label: "Installation" },
  { value: "repair_maintenance", label: "Repair & Maintenance" },
  { value: "training_coaching", label: "Training / Coaching" },
  { value: "custom", label: "Custom Project" },
  { value: "on_site", label: "On-Site Service" },
  { value: "remote_virtual", label: "Remote / Virtual Service" },
  { value: "package", label: "Package / Bundle" },
  { value: "subscription", label: "Subscription" },
  { value: "emergency", label: "Emergency Service" },
];

/** PriceTypeSheet board; values are the `service_meta.pricing_type` enum. */
export const PRICE_TYPES: { value: ServicePricingType; label: string }[] = [
  { value: "fixed_price", label: "Fixed Price" },
  { value: "hourly_rate", label: "Hourly Rate" },
  { value: "daily_rate", label: "Daily Rate" },
  { value: "weekly_rate", label: "Weekly Rate" },
  { value: "monthly_subscription", label: "Monthly Subscription" },
  { value: "custom_quote", label: "Custom Quote" },
  { value: "free_consultation", label: "Free Consultation" },
];

export const SLOT_MODES: { value: ServiceSlotMode; label: string }[] = [
  { value: "unlimited", label: "Unlimited" },
  { value: "limited", label: "Limited slots" },
];

/** What follows the price on a list row ("₦5,000 per hour"). */
export const PRICE_SUFFIX: Record<ServicePricingType, string> = {
  fixed_price: "fixed",
  hourly_rate: "per hour",
  daily_rate: "per day",
  weekly_rate: "per week",
  monthly_subscription: "per month",
  custom_quote: "custom quote",
  free_consultation: "free consultation",
};

export const LOCATION_MAX = 255;
export const SERVICE_AREA_MAX = 255;
export const DESCRIPTION_MAX = 5000;
