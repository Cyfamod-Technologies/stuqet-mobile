import { z } from "zod";
import {
  categoryField,
  nameField,
  priceField,
  wholeNumber,
} from "~/features/seller-products/schemas";
import {
  DESCRIPTION_MAX,
  LOCATION_MAX,
  SERVICE_AREA_MAX,
  SERVICE_TYPES,
  PRICE_TYPES,
} from "./constants";

const priceTypeValues = PRICE_TYPES.map((t) => t.value) as [
  (typeof PRICE_TYPES)[number]["value"],
  ...(typeof PRICE_TYPES)[number]["value"][],
];

// Step 1 of the service form (Details).
const detailsShape = {
  name: nameField("service"),
  // Kept a string ("" until chosen) so the form value is a plain string; the
  // payload builder maps it back to the typed enum.
  service_type: z
    .string()
    .refine(
      (value) => SERVICE_TYPES.some((type) => type.value === value),
      "Choose a service type",
    ),
  category_id: categoryField,
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `Keep it under ${DESCRIPTION_MAX} characters`),
};

// Step 2 (Price and area).
const pricingShape = {
  pricing_type: z.enum(priceTypeValues, { message: "Choose a price type" }),
  unit_price: priceField,
  slot_mode: z.enum(["unlimited", "limited"]),
  current_stock: z.string().trim(),
  location: z
    .string()
    .trim()
    .max(LOCATION_MAX, `Keep it under ${LOCATION_MAX} characters`),
  service_area: z
    .string()
    .trim()
    .max(SERVICE_AREA_MAX, `Keep it under ${SERVICE_AREA_MAX} characters`),
};

export const serviceSchema = z
  .object({ ...detailsShape, ...pricingShape })
  .superRefine((values, ctx) => {
    if (values.slot_mode !== "limited") return;
    // The API requires `current_stock` when `service_meta.slot_mode` is limited.
    if (!values.current_stock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["current_stock"],
        message: "Enter how many slots you can take",
      });
    } else if (!wholeNumber("").safeParse(values.current_stock).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["current_stock"],
        message: "Slots must be a whole number",
      });
    }
  });

export type ServiceFormValues = z.infer<typeof serviceSchema>;

/** Fields on step 1, validated before moving on to step 2. */
export const SERVICE_STEP_ONE_FIELDS = [
  "name",
  "service_type",
  "category_id",
  "description",
] as const satisfies readonly (keyof ServiceFormValues)[];

export const SERVICE_DEFAULT_VALUES: ServiceFormValues = {
  name: "",
  service_type: "",
  category_id: "",
  description: "",
  pricing_type: "fixed_price",
  unit_price: "",
  slot_mode: "unlimited",
  current_stock: "",
  location: "",
  service_area: "",
};
