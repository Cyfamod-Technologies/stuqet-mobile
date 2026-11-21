import { format, isSameDay, subDays } from "date-fns";
import type { ChatMessage, RawMessage } from "./types";

function toDate(raw: RawMessage): Date | null {
  const day = Number(raw.day_of_month.slice(0, 2));
  const time = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(raw.time.trim());
  const year = Number(raw.year);
  const month = Number(raw.month) - 1;
  if (!time || !Number.isFinite(day) || !Number.isFinite(year) || month < 0) {
    return null;
  }
  let hours = Number(time[1]) % 12;
  if (time[3].toLowerCase() === "pm") hours += 12;
  return new Date(year, month, day, hours, Number(time[2]));
}

/** Maps API messages (newest first) to chronological chat bubbles. */
export function toChatMessages(
  raw: RawMessage[],
  sellerId: number | null,
): ChatMessage[] {
  return raw
    .map((m) => ({
      id: m.id,
      userId: m.user_id,
      mine:
        sellerId !== null
          ? m.user_id === sellerId
          : m.send_type.toLowerCase() === "seller",
      text: m.message,
      createdAt: toDate(m),
    }))
    .sort((a, b) => a.id - b.id);
}

/** "now", "2m", "1h", "Yesterday", "3d", or "12 Nov". */
export function shortTimeAgo(date: Date | null, now = new Date()): string {
  if (!date) return "";
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (isSameDay(date, now)) return `${Math.floor(minutes / 60)}h`;
  if (isSameDay(date, subDays(now, 1))) return "Yesterday";
  const days = Math.floor(minutes / 1440);
  if (days < 7) return `${days}d`;
  return format(date, "d MMM");
}

/** Day separator: "Today", "Yesterday" or "21 Nov 2026". */
export function dayLabel(date: Date, now = new Date()): string {
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, subDays(now, 1))) return "Yesterday";
  return format(date, "d MMM yyyy");
}

export function clockTime(date: Date | null): string {
  return date ? format(date, "HH:mm") : "";
}
