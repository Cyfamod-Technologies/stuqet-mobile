import { minutesAgo } from "../format";
import type { DemoConversation, DemoMessage, DemoShopKind } from "../types";

/** [from seller?, text, minutes ago] */
type Line = [boolean, string, number];

interface Thread {
  customerId: number;
  title: string | null;
  lines: Line[];
}

const PRODUCT_THREADS: Thread[] = [
  {
    customerId: 9001,
    title: "Wireless earbuds",
    lines: [
      [false, "Hi, is the black pair still available?", 95],
      [true, "Yes, we have 12 in stock.", 88],
      [false, "Great. Can you deliver to Block C today?", 86],
      [true, "Yes, orders placed before 3 pm arrive the same day.", 83],
      [false, "Perfect, ordering now.", 2],
    ],
  },
  {
    customerId: 9002,
    title: "Order #20261121-12345102",
    lines: [
      [false, "Hello, I paid with my card. Has the order been confirmed?", 190],
      [true, "Hi Tunde, yes it is confirmed and being packed.", 130],
      [false, "Thanks, I will pick it up tomorrow.", 62],
    ],
  },
  {
    customerId: 9003,
    title: "Phone case",
    lines: [
      [false, "Do you have a case for the iPhone 13 Pro?", 1560],
      [
        true,
        "We have the orange and the clear one. Both fit the 13 Pro.",
        1500,
      ],
      [false, "Can you deliver to Block D?", 1440],
      [true, "Yes, we deliver to Block D for ₦500.", 1400],
    ],
  },
  {
    customerId: 9004,
    title: "Order #20261118-12345541",
    lines: [
      [false, "The backpack zip is stuck. Can I exchange it?", 4600],
      [
        true,
        "Sorry about that. Bring it to the shop and we will swap it.",
        4500,
      ],
      [false, "Okay, noted.", 4300],
      [true, "See you then, Chidi.", 4200],
    ],
  },
  {
    customerId: 9005,
    title: "Wireless earbuds",
    lines: [
      [false, "Do you have this in blue?", 7300],
      [true, "Only black and white for now. Blue arrives next week.", 7200],
      [false, "Do you have this in blue?", 7100],
      [true, "I will message you when it lands.", 7000],
    ],
  },
];

const FOOD_THREADS: Thread[] = [
  {
    customerId: 9003,
    title: "Jollof rice and chicken",
    lines: [
      [false, "Is the jollof ready by 1 pm?", 40],
      [true, "Yes, it comes out of the pot at 12:30.", 33],
      [false, "Please add extra pepper.", 5],
    ],
  },
  {
    customerId: 9001,
    title: "Chicken suya",
    lines: [
      [false, "Can I order 20 sticks for Saturday?", 1500],
      [
        true,
        "Yes, send your block and time and we will confirm the price.",
        1400,
      ],
    ],
  },
];

const SERVICE_THREADS: Thread[] = [
  {
    customerId: 9001,
    title: "Laptop repair and diagnosis",
    lines: [
      [false, "My laptop screen flickers when I move the lid.", 200],
      [
        true,
        "That is usually the display cable. Bring it in and we will check it for free.",
        150,
      ],
      [false, "Can I come at 4 pm today?", 20],
    ],
  },
  {
    customerId: 9002,
    title: "Maths and physics tutoring",
    lines: [[false, "Do you teach electromagnetism too?", 3000]],
  },
];

const THREADS: Record<DemoShopKind, Thread[]> = {
  product: PRODUCT_THREADS,
  food: FOOD_THREADS,
  service: SERVICE_THREADS,
};

export function buildConversations(
  kind: DemoShopKind,
  now: Date,
): DemoConversation[] {
  let messageId = 1;
  return THREADS[kind].map((thread, index): DemoConversation => {
    const messages = [...thread.lines]
      .sort((a, b) => b[2] - a[2])
      .map(([fromSeller, text, minutes]): DemoMessage => ({
        id: messageId++,
        fromSeller,
        text,
        at: minutesAgo(now, minutes),
        visibleAt: 0,
      }));
    return {
      id: 700 + index + 1,
      customerId: thread.customerId,
      title: thread.title,
      messages,
    };
  });
}

/** What the demo customer answers after the seller sends a message. */
export const AUTO_REPLIES = [
  "Thanks, that works for me!",
  "Okay, I will be there in a few minutes.",
  "Perfect, thank you so much.",
  "Great, can you confirm the total with delivery?",
  "Noted. I will send the payment now.",
];
