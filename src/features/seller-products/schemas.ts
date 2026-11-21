import { z } from "zod";
import {
  DEFAULT_SCHEDULE_DAYS,
  NAME_MAX,
  SHORT_DESCRIPTION_MAX,
  UNIT_MAX,
} from "./constants";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Strips thousands separators typed by the user ("2,500" -> "2500"). */
export const normaliseNumber = (value: string) =>
  value.replace(/,/g, "").trim();

export const nameField = (noun: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${noun} name`)
    .max(NAME_MAX, `Keep the name under ${NAME_MAX} characters`);

export const categoryField = z.string().min(1, "Choose a category");

export const priceField = z
  .string()
  .trim()
  .min(1, "Enter a price")
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(normaliseNumber(value)),
    "Enter a valid amount, like 2500 or 2500.50",
  )
  .refine(
    (value) => Number(normaliseNumber(value)) > 0,
    "Price must be greater than 0",
  );

// The API rejects digits (regex /^[A-Za-z\s]+$/) and the column is varchar(20).
const unitField = z
  .string()
  .trim()
  .min(1, "Enter a unit")
  .max(UNIT_MAX, `Keep it under ${UNIT_MAX} characters`)
  .regex(/^[A-Za-z\s]+$/, "Letters only, no numbers.");

export const wholeNumber = (message: string) =>
  z.string().trim().regex(/^\d+$/, message);

export const productSchema = z.object({
  name: nameField("product"),
  category_id: categoryField,
  unit_price: priceField,
  current_stock: z
    .string()
    .trim()
    .min(1, "Enter the quantity")
    .regex(/^\d+$/, "Quantity must be a whole number"),
  unit: unitField,
  cash_on_delivery: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

const deliveryOption = z.enum(["delivery", "pickup", "dine_in"]);
const day = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// Step 1 of the food form.
const foodDetailsShape = {
  name: nameField("food"),
  category_id: categoryField,
  short_description: z
    .string()
    .trim()
    .min(1, "Add a short description")
    .max(
      SHORT_DESCRIPTION_MAX,
      `Keep it under ${SHORT_DESCRIPTION_MAX} characters`,
    ),
  delivery_options: z
    .array(deliveryOption)
    .min(1, "Choose at least one way customers can get it"),
  prep_time_value: wholeNumber("Use a whole number").refine(
    (value) => Number(value) >= 1,
    "Prep time must be at least 1",
  ),
  prep_time_unit: z.enum(["minutes", "hours"]),
};

// Step 2 of the food form.
const foodPricingShape = {
  unit_price: priceField,
  unit: unitField,
  stock_mode: z.enum(["unlimited", "limited"]),
  current_stock: z.string().trim(),
  availability_mode: z.enum(["always", "scheduled"]),
  available_days: z.array(day),
  time_from: z.string().trim(),
  time_to: z.string().trim(),
  sold_out: z.boolean(),
};

export const foodSchema = z
  .object({ ...foodDetailsShape, ...foodPricingShape })
  .superRefine((values, ctx) => {
    if (values.stock_mode === "limited") {
      if (!values.current_stock) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["current_stock"],
          message: "Enter how many you can serve",
        });
      } else if (!/^\d+$/.test(values.current_stock)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["current_stock"],
          message: "Quantity must be a whole number",
        });
      }
    }

    if (values.availability_mode !== "scheduled") return;

    if (values.available_days.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["available_days"],
        message: "Pick at least one day",
      });
    }
    (["time_from", "time_to"] as const).forEach((field) => {
      if (!TIME_PATTERN.test(values[field])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Use 24-hour time, like 12:00",
        });
      }
    });
    if (
      TIME_PATTERN.test(values.time_from) &&
      values.time_from === values.time_to
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["time_to"],
        message: "End time must be different from start time",
      });
    }
  });

export type FoodFormValues = z.infer<typeof foodSchema>;

/** Fields shown on step 1, validated before moving to step 2. */
export const FOOD_STEP_ONE_FIELDS = [
  "name",
  "category_id",
  "short_description",
  "delivery_options",
  "prep_time_value",
  "prep_time_unit",
] as const satisfies readonly (keyof FoodFormValues)[];

export const FOOD_DEFAULT_VALUES: FoodFormValues = {
  name: "",
  category_id: "",
  short_description: "",
  delivery_options: ["delivery", "pickup"],
  prep_time_value: "",
  prep_time_unit: "minutes",
  unit_price: "",
  unit: "",
  stock_mode: "unlimited",
  current_stock: "",
  availability_mode: "always",
  available_days: [...DEFAULT_SCHEDULE_DAYS],
  time_from: "",
  time_to: "",
  sold_out: false,
};

export const PRODUCT_DEFAULT_VALUES: ProductFormValues = {
  name: "",
  category_id: "",
  unit_price: "",
  current_stock: "",
  unit: "",
  cash_on_delivery: true,
};
