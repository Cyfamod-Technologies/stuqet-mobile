const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad = (value: number) => String(value).padStart(2, "0");

/** 4500 -> "₦4,500.00", the money format the API sends. */
export function naira(amount: number): string {
  const [whole, fraction] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${amount < 0 ? "-" : ""}₦${grouped}.${fraction}`;
}

/** "21-11-2026" (d-m-Y). */
export function dmy(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/** "20261121" for order codes. */
export function ymd(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/** "Nov-21", the sales chart's date key. */
export function monthDay(date: Date): string {
  return `${MONTHS[date.getMonth()].slice(0, 3)}-${pad(date.getDate())}`;
}

/** "November 21 2026, 3:04 pm" (notification date). */
export function notificationDate(date: Date): string {
  const hours = date.getHours();
  const suffix = hours >= 12 ? "pm" : "am";
  return `${MONTHS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}, ${hours % 12 || 12}:${pad(date.getMinutes())} ${suffix}`;
}

/** Fields of one chat message, as MessageCollection sends them. */
export function messageStamp(date: Date) {
  const hours = date.getHours();
  return {
    year: String(date.getFullYear()),
    month: pad(date.getMonth() + 1),
    day_of_month: `${pad(date.getDate())}-${MONTHS[date.getMonth()].slice(0, 3)}`,
    date: `${MONTHS[date.getMonth()]} ${pad(date.getDate())}, ${date.getFullYear()}`,
    time: `${pad(hours % 12 || 12)}:${pad(date.getMinutes())} ${hours >= 12 ? "pm" : "am"}`,
  };
}

/** "2026-11-21 15:04:00", what the ticket endpoints send. */
export function sqlDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function minutesAgo(now: Date, minutes: number): Date {
  return new Date(now.getTime() - minutes * 60_000);
}

export function daysAgo(now: Date, days: number, hour = 10, minute = 30): Date {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}
