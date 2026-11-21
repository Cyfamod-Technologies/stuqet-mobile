import type { TicketStatus } from "./types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parse(value: string): Date | null {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "02 Jan 2026". */
export function formatTicketDate(value: string): string {
  const date = parse(value);
  if (!date) return value;
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "Today, 09:12" or "02 Jan, 09:12". */
export function formatMessageTime(value: string): string {
  const date = parse(value);
  if (!date) return value;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const now = new Date();
  const today =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return today
    ? `Today, ${time}`
    : `${pad(date.getDate())} ${MONTHS[date.getMonth()]}, ${time}`;
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  pending: "Pending",
  open: "Open",
  solved: "Solved",
};

export const STATUS_BADGE = {
  pending: "destructive",
  open: "outline",
  solved: "success",
} as const satisfies Record<TicketStatus, string>;

/** Unknown statuses from the API fall back to "open". */
export function toStatus(value: string | null | undefined): TicketStatus {
  const status = value?.trim().toLowerCase();
  if (status === "pending" || status === "solved") return status;
  return "open";
}
