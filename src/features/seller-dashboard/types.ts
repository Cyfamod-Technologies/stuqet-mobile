/** One day of the 7-day sales chart, oldest first. */
export interface SalesDay {
  /** "Nov-21" as sent by the API. */
  date: string;
  /** Delivered-order revenue that day, in naira. */
  total: number;
  /** Weekday initial for the chart label. */
  label: string;
  isToday: boolean;
}

export interface RawSalesDay {
  date: string;
  total: number | string | null;
}

/**
 * The endpoint returns a PHP array keyed 1..7 (1 = today), which JSON
 * serialises as an object; a plain array is accepted too.
 */
export type RawSalesStat = Record<string, RawSalesDay> | RawSalesDay[];
