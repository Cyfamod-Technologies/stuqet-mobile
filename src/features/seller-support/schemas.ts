import { z } from "zod";
import { MAX_MESSAGE_LENGTH, MAX_SUBJECT_LENGTH } from "./constants";

export const ticketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Enter a subject")
    .max(MAX_SUBJECT_LENGTH, "Keep the subject shorter"),
  details: z
    .string()
    .trim()
    .min(10, "Tell us a little more")
    .max(MAX_MESSAGE_LENGTH, "Keep the details shorter"),
});

export type TicketValues = z.infer<typeof ticketSchema>;
