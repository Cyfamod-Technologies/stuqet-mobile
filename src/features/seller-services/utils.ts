import { normaliseNumber } from "~/features/seller-products/schemas";
import type {
  CreateProductPayload,
  SellerProduct,
  ServiceMeta,
} from "~/features/seller-products/types";
import { formatListPrice } from "~/features/seller-products/utils";
import { PRICE_SUFFIX, PRICE_TYPES, SERVICE_TYPES } from "./constants";
import type { ServiceFormValues } from "./schemas";

export function serviceMetaOf(product: SellerProduct): ServiceMeta | null {
  const meta = product.service_meta;
  return meta && !Array.isArray(meta) ? meta : null;
}

export function serviceTypeLabel(
  value: string | undefined,
): string | undefined {
  return SERVICE_TYPES.find((type) => type.value === value)?.label;
}

export function priceTypeLabel(value: string | undefined): string | undefined {
  return PRICE_TYPES.find((type) => type.value === value)?.label;
}

/** "₦5,000 per hour" / "₦8,000 fixed". Without `service_meta` (the list does
 * not return it yet) it is just the price as given. */
export function servicePriceLine(product: SellerProduct): string {
  const price = formatListPrice(product.price);
  const pricingType = serviceMetaOf(product)?.pricing_type;
  if (!pricingType) return price;
  return pricingType === "free_consultation"
    ? "Free consultation"
    : `${price} ${PRICE_SUFFIX[pricingType]}`;
}

export type ServiceFilter = "all" | "published" | "unpublished";

// TODO(backend): client-side only (no `published` list param yet), so it
// filters the pages loaded so far.
export const SERVICE_FILTERS: { value: ServiceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
];

export function matchesServiceFilter(
  product: SellerProduct,
  filter: ServiceFilter,
): boolean {
  if (filter === "published") return product.status;
  if (filter === "unpublished") return !product.status;
  return true;
}

export function servicesSummary(total: number | undefined): string | undefined {
  if (total === undefined) return undefined;
  return `${total} ${total === 1 ? "service" : "services"}`;
}

/**
 * POST /seller/products/add for a service. ApiSellerProductRequest only
 * defaults the hidden fields for food, so a service must send `tags` and
 * `button` itself (the non-food path throws without them) plus `min_qty`
 * ("Minimum Booking Qty", 1 on the web form). `unit` is not sent: the web
 * service form has no such field and the rule is `sometimes`.
 */
export function buildServicePayload(
  values: ServiceFormValues,
  photoIds: number[],
): CreateProductPayload | null {
  const serviceType = SERVICE_TYPES.find(
    (type) => type.value === values.service_type,
  )?.value;
  if (!serviceType) return null;

  const categoryId = Number(values.category_id);
  const limited = values.slot_mode === "limited";
  const description = values.description.trim();
  const location = values.location.trim();
  const serviceArea = values.service_area.trim();

  return {
    listing_type: "service",
    name: values.name.trim(),
    category_ids: [categoryId],
    category_id: categoryId,
    unit_price: Number(normaliseNumber(values.unit_price)),
    // Unlimited: omit it, the server stores the 999999 sentinel.
    ...(limited ? { current_stock: Number(values.current_stock) } : {}),
    ...(photoIds.length > 0
      ? { photos: photoIds.join(","), thumbnail_img: String(photoIds[0]) }
      : {}),
    ...(description ? { description } : {}),
    tags: ["[]"],
    button: "publish",
    min_qty: 1,
    service_meta: {
      service_type: serviceType,
      pricing_type: values.pricing_type,
      slot_mode: values.slot_mode,
      ...(location ? { location } : {}),
      ...(serviceArea ? { service_area: serviceArea } : {}),
    },
  };
}
