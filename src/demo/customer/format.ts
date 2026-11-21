export { minutesAgo, daysAgo } from "../format";

/** 4500 -> "₦4,500" (the customer and rider boards show no decimals). */
export function money(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₦${Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/** 4500 -> "₦4,500.00", the money format the real API sends. */
export function apiMoney(amount: number): string {
  return `${money(amount)}.00`;
}

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
];
const pad = (n: number) => String(n).padStart(2, "0");

/** "02 Jan 2026" */
export function dayLabel(date: Date): string {
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "20261121" */
export function ymd(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/** "2m", "20m", "3h", "3d" */
export function agoShort(now: Date, date: Date): string {
  const minutes = Math.max(
    0,
    Math.round((now.getTime() - date.getTime()) / 60_000),
  );
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h`;
  const days = Math.round(minutes / (60 * 24));
  return days === 1 ? "Yesterday" : `${days}d`;
}
