import { DAYS, LOW_STOCK_THRESHOLD } from "./constants";
import { normaliseNumber } from "./schemas";
import type { FoodFormValues, ProductFormValues } from "./schemas";
import type {
  CategoryNode,
  CategoryOption,
  CreateProductPayload,
  FoodMeta,
  SellerProduct,
} from "./types";

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const INDENT = "    ";

/** Flattens the category tree depth-first; children are indented by depth. */
export function flattenCategories(
  nodes: CategoryNode[],
  depth = 0,
): CategoryOption[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      depth,
      label: `${INDENT.repeat(depth)}${depth > 0 ? "↳ " : ""}${node.name}`,
    },
    ...(node.child?.length ? flattenCategories(node.child, depth + 1) : []),
  ]);
}

// ---------------------------------------------------------------------------
// List row display
// ---------------------------------------------------------------------------

export function foodMetaOf(product: SellerProduct): FoodMeta | null {
  const meta = product.food_meta;
  return meta && !Array.isArray(meta) ? meta : null;
}

export type BadgeTone = "outline" | "warning" | "destructive" | "success";

export interface RowBadge {
  label: string;
  tone: BadgeTone;
}

/** Food is sold out by the manual switch, by status, or by limited stock at 0. */
export function isFoodSoldOut(product: SellerProduct): boolean {
  const meta = foodMetaOf(product);
  return (
    meta?.manual_override === "sold_out" ||
    product.food_availability?.status === "sold_out" ||
    (meta?.stock_mode !== "unlimited" && product.current_stock <= 0)
  );
}

function stockBadge(stock: number, emptyLabel: string): RowBadge {
  if (stock <= 0) return { label: emptyLabel, tone: "destructive" };
  if (stock <= LOW_STOCK_THRESHOLD) {
    return { label: `${stock} left`, tone: "warning" };
  }
  return { label: `${stock} in stock`, tone: "outline" };
}

/** The badge next to the price. Admin approval wins when it is known. */
export function rowBadge(product: SellerProduct): RowBadge {
  if (product.approved === false) {
    return { label: "Awaiting approval", tone: "warning" };
  }
  if (product.listing_type === "food") {
    const meta = foodMetaOf(product);
    if (meta?.manual_override === "sold_out") {
      return { label: "Sold out", tone: "destructive" };
    }
    if (meta?.stock_mode === "unlimited") {
      return { label: "Unlimited", tone: "success" };
    }
    return stockBadge(product.current_stock, "Sold out");
  }
  return stockBadge(product.current_stock, "Out of stock");
}

/** "Scheduled, 12:00 to 15:00" / "Always available" (food rows only). */
export function availabilityLine(product: SellerProduct): string {
  const meta = foodMetaOf(product);
  if (meta?.availability_mode !== "scheduled") return "Always available";
  const slot = meta.time_slots?.[0];
  return slot?.start && slot.end
    ? `Scheduled, ${slot.start} to ${slot.end}`
    : "Scheduled";
}

// ---------------------------------------------------------------------------
// Client-side list filters
// TODO(backend): replace with server params (`published`, `featured`,
// `availability`) once the list endpoint supports them. Until then these only
// filter the pages loaded so far, so counts and results are partial.
// ---------------------------------------------------------------------------

export type ProductFilter = "all" | "published" | "unpublished" | "featured";
export type FoodFilter = "all" | "always" | "scheduled" | "sold_out";

export const PRODUCT_FILTERS: { value: ProductFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "featured", label: "Featured" },
];

export const FOOD_FILTERS: { value: FoodFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "always", label: "Always available" },
  { value: "scheduled", label: "Scheduled" },
  { value: "sold_out", label: "Sold out" },
];

export function matchesProductFilter(
  product: SellerProduct,
  filter: ProductFilter,
): boolean {
  switch (filter) {
    case "published":
      return product.status;
    case "unpublished":
      return !product.status;
    case "featured":
      return product.featured;
    default:
      return true;
  }
}

export function matchesFoodFilter(
  product: SellerProduct,
  filter: FoodFilter,
): boolean {
  switch (filter) {
    case "always":
      return foodMetaOf(product)?.availability_mode !== "scheduled";
    case "scheduled":
      return foodMetaOf(product)?.availability_mode === "scheduled";
    case "sold_out":
      return isFoodSoldOut(product);
    default:
      return true;
  }
}

/** "42 products, 24 food items" from whichever totals are known. */
export function catalogueSummary(
  products: number | undefined,
  food: number | undefined,
): string | undefined {
  const parts: string[] = [];
  if (products !== undefined) {
    parts.push(`${products} ${products === 1 ? "product" : "products"}`);
  }
  if (food !== undefined) {
    parts.push(`${food} ${food === 1 ? "food item" : "food items"}`);
  }
  return parts.length ? parts.join(", ") : undefined;
}

// ---------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------

/** Formats typing as 24-hour "HH:mm" ("1230" -> "12:30"). */
export function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

// ---------------------------------------------------------------------------
// Create payloads
// ---------------------------------------------------------------------------

function photoFields(photoIds: number[]) {
  return photoIds.length > 0
    ? { photos: photoIds.join(","), thumbnail_img: String(photoIds[0]) }
    : {};
}

export function buildProductPayload(
  values: ProductFormValues,
  photoIds: number[],
): CreateProductPayload {
  const categoryId = Number(values.category_id);
  return {
    listing_type: "product",
    name: values.name.trim(),
    category_ids: [categoryId],
    category_id: categoryId,
    unit_price: Number(normaliseNumber(values.unit_price)),
    unit: values.unit.trim(),
    current_stock: Number(values.current_stock),
    ...photoFields(photoIds),
    // Hidden fields: the non-food path throws on a missing `tags` / `button`.
    tags: ["[]"],
    button: "publish",
    cash_on_delivery: values.cash_on_delivery ? 1 : 0,
  };
}

export function buildFoodPayload(
  values: FoodFormValues,
  photoIds: number[],
): CreateProductPayload {
  const categoryId = Number(values.category_id);
  const scheduled = values.availability_mode === "scheduled";
  const limited = values.stock_mode === "limited";

  return {
    listing_type: "food",
    name: values.name.trim(),
    category_ids: [categoryId],
    category_id: categoryId,
    unit_price: Number(normaliseNumber(values.unit_price)),
    unit: values.unit.trim(),
    // Unlimited: omit it, the server stores the 999999 sentinel.
    ...(limited ? { current_stock: Number(values.current_stock) } : {}),
    ...photoFields(photoIds),
    tags: ["[]"],
    button: "publish",
    food_meta: {
      short_description: values.short_description.trim(),
      delivery_options: values.delivery_options,
      prep_time_value: Number(values.prep_time_value),
      prep_time_unit: values.prep_time_unit,
      stock_mode: values.stock_mode,
      availability_mode: values.availability_mode,
      ...(scheduled
        ? {
            available_days: DAYS.map((d) => d.value).filter((d) =>
              values.available_days.includes(d),
            ),
            time_slots: [{ start: values.time_from, end: values.time_to }],
          }
        : {}),
      // Without these flags the schedule and zero stock have no visible effect.
      auto_time_based: scheduled,
      auto_stock_based: limited,
      manual_override: values.sold_out ? "sold_out" : "auto",
    },
  };
}
