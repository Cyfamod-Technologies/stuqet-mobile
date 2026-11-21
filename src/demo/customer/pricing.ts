import type { DemoDish } from "./types";

export interface PricedLine {
  unitPrice: number;
  variation: string | null;
}

/** Price of one unit of a dish with the chosen size and add-ons, and its label. */
export function priceLine(
  dish: DemoDish,
  sizeId: string | null,
  addOnIds: string[],
): PricedLine {
  const size = dish.sizes.find((s) => s.id === sizeId) ?? dish.sizes[0] ?? null;
  const addOns = dish.addOns.filter((a) => addOnIds.includes(a.id));
  const unitPrice =
    (size ? size.price : dish.price) +
    addOns.reduce((sum, a) => sum + a.price, 0);
  const parts: string[] = [];
  if (size) parts.push(size.label);
  else if (dish.unit) parts.push(dish.unit);
  if (addOns.length > 0) parts.push(addOns.map((a) => a.label).join(", "));
  return { unitPrice, variation: parts.length > 0 ? parts.join(" · ") : null };
}
