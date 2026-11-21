import type { DemoCartLine, DemoPersona } from "../types";
import { dishByName } from "./vendors";

/** Ada starts with the cart from the Cart board (long name, add-ons, coupon to try). */
export function buildCartLines(persona: DemoPersona): DemoCartLine[] {
  if (persona !== "customer") return [];
  const combo = dishByName(
    1,
    "Smoky party jollof rice with grilled chicken, fried plantain and coleslaw family combo",
  );
  const zobo = dishByName(1, "Zobo drink");
  if (!combo || !zobo) return [];
  return [
    {
      id: 801,
      dishId: combo.id,
      sizeId: "large",
      addOnIds: ["chicken", "plantain", "coleslaw", "pepper"],
      quantity: 1,
      note: null,
    },
    {
      id: 802,
      dishId: zobo.id,
      sizeId: null,
      addOnIds: [],
      quantity: 2,
      note: null,
    },
  ];
}
