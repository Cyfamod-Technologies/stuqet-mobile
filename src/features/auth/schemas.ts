import { z } from "zod";
import { passwordRegex } from "~/lib/utils/constants";
import { RESET_CODE_LENGTH, VENDOR_PASSWORD_MIN_LENGTH } from "./constants";

// Length of the emailed reset code (kept as an alias for the customer screens).
export const OTP_LENGTH = RESET_CODE_LENGTH;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code from your email`),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordRegex,
        "Must contain uppercase, lowercase, number, and special character",
      ),
    rePassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// --- Vendor app: email OR phone, backend rules (min 6 password) ------------

const emailSchema = z.string().trim().email("Enter a valid email address");
// The API only checks `numeric`; accept an optional + and spaces/dashes.
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]{7,16}$/, "Enter a valid phone number");

/** Strips formatting so the backend's `numeric` rule passes. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

const identifierSchema = z
  .object({
    method: z.enum(["email", "phone"]),
    identifier: z.string().trim().min(1, "This field is required"),
  })
  .superRefine((data, ctx) => {
    const result = (
      data.method === "email" ? emailSchema : phoneSchema
    ).safeParse(data.identifier);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        path: ["identifier"],
        message: result.error.issues[0]?.message ?? "Invalid value",
      });
    }
  });

export const vendorLoginSchema = identifierSchema.and(
  z.object({ password: z.string().min(1, "Password is required") }),
);

export const vendorForgotPasswordSchema = identifierSchema;

export const vendorResetPasswordSchema = z.object({
  code: z
    .string()
    .length(RESET_CODE_LENGTH, `Enter the ${RESET_CODE_LENGTH}-digit code`),
  password: z
    .string()
    .min(
      VENDOR_PASSWORD_MIN_LENGTH,
      `At least ${VENDOR_PASSWORD_MIN_LENGTH} characters`,
    ),
});

export type VendorLoginFormValues = z.infer<typeof vendorLoginSchema>;
export type VendorForgotPasswordFormValues = z.infer<
  typeof vendorForgotPasswordSchema
>;
export type VendorResetPasswordFormValues = z.infer<
  typeof vendorResetPasswordSchema
>;
