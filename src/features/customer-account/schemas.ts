import { z } from "zod";

export const addressSchema = z.object({
  address: z.string().trim().min(5, "Enter the street, hostel or building"),
  stateId: z.number().int().positive("Select a state"),
  cityId: z.number().int().positive("Select a city"),
  areaId: z.number().int().positive().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,16}$/, "Enter a valid phone number"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
