import { minutesAgo } from "../format";
import type { DemoMessage, DemoOrder, DemoPersona } from "../types";

/** The vendor answers customer messages with one of these after a few seconds. */
export const VENDOR_REPLIES = [
  "Sure, no problem. It is being packed now.",
  "Thanks for letting us know. We will sort it out.",
  "Your order is on its way. Please keep your phone close.",
  "Of course. Anything else you need with it?",
];

export function buildMessages(
  persona: DemoPersona,
  now: Date,
  orders: DemoOrder[],
): Map<number, DemoMessage[]> {
  const threads = new Map<number, DemoMessage[]>();
  if (persona !== "customer") return threads;
  const first = orders.find((order) => order.id === 6001);
  if (first) {
    threads.set(first.id, [
      {
        id: 1,
        mine: true,
        text: "Hi, can you add extra pepper please?",
        createdAt: minutesAgo(now, 36),
      },
      {
        id: 2,
        mine: false,
        text: "Sure, no problem. It is being packed now.",
        createdAt: minutesAgo(now, 34),
      },
    ]);
  }
  return threads;
}
