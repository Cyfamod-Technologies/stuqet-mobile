import { z } from "zod";

export const riderProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,16}$/, "Enter a valid phone number"),
  school: z.string().min(1, "Choose your school"),
  area: z.string().min(1, "Choose the area you cover"),
});

export type RiderProfileValues = z.infer<typeof riderProfileSchema>;

export const PLATE_REGEX = /^[A-Za-z0-9\s-]{5,12}$/;

export const accountNumberSchema = z
  .string()
  .regex(/^\d{10}$/, "Enter the 10-digit account number");
