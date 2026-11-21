import { z } from "zod";

export const SIGNUP_PASSWORD_MIN = 6;
export const CODE_LENGTH = 6;

const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]{7,16}$/, "Enter a valid phone number");

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    method: z.enum(["email", "phone"]),
    email: z.string().trim(),
    phone: z.string().trim(),
    password: z
      .string()
      .min(SIGNUP_PASSWORD_MIN, `At least ${SIGNUP_PASSWORD_MIN} characters`),
    agree: z.boolean().refine((value) => value, "Accept the terms to continue"),
  })
  .superRefine((data, ctx) => {
    if (data.method === "email") {
      if (!z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Enter a valid email address",
        });
      }
    } else if (!phone.safeParse(data.phone).success) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid phone number",
      });
    }
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
