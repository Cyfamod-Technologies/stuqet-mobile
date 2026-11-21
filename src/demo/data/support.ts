import { demoImage } from "../images";
import { minutesAgo } from "../format";
import type { DemoTicket } from "../types";

export function buildTickets(now: Date): DemoTicket[] {
  const day = 60 * 24;
  return [
    {
      id: 61,
      code: "20261120",
      subject: "Payout has not arrived",
      status: "pending",
      at: minutesAgo(now, 180),
      messages: [
        {
          id: 1,
          body: "I requested a withdrawal three days ago and my bank has not received it. Please check.",
          fromSupport: false,
          senderName: null,
          attachments: [demoImage("documents/support-screenshot")],
          at: minutesAgo(now, 180),
          visibleAt: 0,
        },
      ],
    },
    {
      id: 58,
      code: "20261114",
      subject: "Cannot upload a product photo",
      status: "open",
      at: minutesAgo(now, 7 * day),
      messages: [
        {
          id: 2,
          body: "The photo stays on uploading and never finishes.",
          fromSupport: false,
          senderName: null,
          attachments: [],
          at: minutesAgo(now, 7 * day),
          visibleAt: 0,
        },
        {
          id: 3,
          body: "Hi, thanks for reaching out. Is the photo larger than 5 MB? Try a smaller one and tell us if it still fails.",
          fromSupport: true,
          senderName: "Stuqet Support",
          attachments: [],
          at: minutesAgo(now, 7 * day - 90),
          visibleAt: 0,
        },
        {
          id: 4,
          body: "It was 8 MB. I will compress it and try again.",
          fromSupport: false,
          senderName: null,
          attachments: [],
          at: minutesAgo(now, 7 * day - 120),
          visibleAt: 0,
        },
      ],
    },
    {
      id: 52,
      code: "20261102",
      subject: "How do I change my bank details?",
      status: "solved",
      at: minutesAgo(now, 19 * day),
      messages: [
        {
          id: 5,
          body: "Where can I update the account my payouts go to?",
          fromSupport: false,
          senderName: null,
          attachments: [],
          at: minutesAgo(now, 19 * day),
          visibleAt: 0,
        },
        {
          id: 6,
          body: "Open More, then Payout details, change the bank and account number, and tap Save details.",
          fromSupport: true,
          senderName: "Stuqet Support",
          attachments: [],
          at: minutesAgo(now, 19 * day - 40),
          visibleAt: 0,
        },
      ],
    },
    {
      id: 47,
      code: "20261019",
      subject: "Order marked delivered by mistake",
      status: "solved",
      at: minutesAgo(now, 33 * day),
      messages: [
        {
          id: 7,
          body: "I marked an order as delivered too early. Can it be reversed?",
          fromSupport: false,
          senderName: null,
          attachments: [],
          at: minutesAgo(now, 33 * day),
          visibleAt: 0,
        },
        {
          id: 8,
          body: "Delivered orders are locked, but we have reopened it for you. Please update the status again.",
          fromSupport: true,
          senderName: "Stuqet Support",
          attachments: [],
          at: minutesAgo(now, 33 * day - 60),
          visibleAt: 0,
        },
      ],
    },
  ];
}

export const SUPPORT_REPLIES = [
  "Thanks for the details. We are looking into it and will update you within 24 hours.",
  "We have escalated this to the payments team. You will hear back shortly.",
  "Thanks, that helps. Could you send a screenshot of the screen you see?",
];
