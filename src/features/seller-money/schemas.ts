import { z } from "zod";
import { parseTypedAmount } from "./utils";

interface WithdrawLimits {
  /** Smallest request the platform accepts, when known. */
  min: number | null;
  /** Available balance, when it could be parsed. */
  max: number | null;
  /** Formats a number like the API formats money (for error messages). */
  format: (value: number) => string;
}

// Rules from WithdrawRequestController::store: amount >= the platform minimum
// and <= the available balance. The server stays the authority, so a limit that
// is unknown is simply not checked here and the server message is surfaced.
export const createWithdrawSchema = ({ min, max, format }: WithdrawLimits) =>
  z.object({
    amount: z
      .string()
      .trim()
      .min(1, "Enter an amount")
      .superRefine((value, ctx) => {
        const amount = parseTypedAmount(value);
        if (Number.isNaN(amount) || amount <= 0) {
          ctx.addIssue({ code: "custom", message: "Enter a valid amount" });
          return;
        }
        if (min !== null && amount < min) {
          ctx.addIssue({
            code: "custom",
            message: `The minimum withdrawal is ${format(min)}`,
          });
        } else if (max !== null && amount > max) {
          ctx.addIssue({
            code: "custom",
            message: `You can withdraw up to ${format(max)}`,
          });
        }
      }),
    message: z.string().trim().max(500, "Keep the note under 500 characters"),
  });

export type WithdrawFormValues = z.infer<
  ReturnType<typeof createWithdrawSchema>
>;
