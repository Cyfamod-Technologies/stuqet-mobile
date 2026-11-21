import { z } from "zod";
import type {
  PickedFile,
  VerificationElement,
  VerificationFormValues,
} from "./types";

export const shopProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your shop name").max(100),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .refine(
      (value) => value === "" || /^[+\d][\d\s-]{6,}$/.test(value),
      "Enter a valid phone number",
    ),
  address: z.string().trim().min(3, "Enter your shop address").max(255),
});

export type ShopProfileValues = z.infer<typeof shopProfileSchema>;

export const payoutSchema = z
  .object({
    cash_on_delivery_status: z.boolean(),
    bank_payment_status: z.boolean(),
    bank_name: z.string().trim().max(100),
    bank_acc_name: z.string().trim().max(100),
    bank_acc_no: z.string().trim().max(30),
    bank_routing_no: z.string().trim().max(30),
  })
  .superRefine((values, ctx) => {
    if (values.bank_acc_no && !/^\d{10}$/.test(values.bank_acc_no)) {
      ctx.addIssue({
        code: "custom",
        path: ["bank_acc_no"],
        message: "Enter the 10-digit account number",
      });
    }
    if (!values.bank_payment_status) return;
    const required = [
      ["bank_name", "Choose your bank"],
      ["bank_acc_name", "Enter the account name"],
      ["bank_acc_no", "Enter the 10-digit account number"],
    ] as const;
    for (const [field, message] of required) {
      if (!values[field]) {
        ctx.addIssue({ code: "custom", path: [field], message });
      }
    }
  });

export type PayoutValues = z.infer<typeof payoutSchema>;

const pickedFileSchema = z.custom<PickedFile>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "uri" in value &&
    typeof value.uri === "string",
  "Choose a file",
);

/** One required field per admin-configured element, keyed `element_<index>`. */
export function createVerificationSchema(elements: VerificationElement[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const element of elements) {
    const key = `element_${element.index}`;
    switch (element.type) {
      case "file":
        shape[key] = pickedFileSchema;
        break;
      case "multi_select":
        shape[key] = z.array(z.string()).min(1, "Choose at least one option");
        break;
      case "select":
      case "radio":
        shape[key] = z.string().min(1, "Choose an option");
        break;
      default:
        shape[key] = z.string().trim().min(1, "This field is required");
    }
  }
  return z.object(shape);
}

export function emptyVerificationValues(
  elements: VerificationElement[],
): VerificationFormValues {
  const values: VerificationFormValues = {};
  for (const element of elements) {
    const key = `element_${element.index}`;
    if (element.type === "multi_select") values[key] = [];
    else if (element.type === "file") values[key] = null;
    else values[key] = "";
  }
  return values;
}
