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

/** "02-01-2026" (API `d-m-Y`) to "02 Jan 2026". Falls back to the input. */
export function formatApiDate(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${match[1]} ${month} ${match[3]}` : value;
}

/**
 * Parses a money string typed by the user or formatted by the API
 * ("86,400.00", "86.400,00", "₦86,400", "1200"). Returns NaN when it cannot
 * be read, so callers can skip client-side checks instead of guessing.
 */
export function parseMoney(value: string | null | undefined): number {
  if (!value) return NaN;
  const core = value.replace(/[^\d.,]/g, "");
  if (!/\d/.test(core)) return NaN;

  const lastDot = core.lastIndexOf(".");
  const lastComma = core.lastIndexOf(",");
  let decimalIndex = -1;

  if (lastDot !== -1 && lastComma !== -1) {
    decimalIndex = Math.max(lastDot, lastComma);
  } else {
    const index = Math.max(lastDot, lastComma);
    if (index !== -1) {
      const separator = core[index];
      const occurrences = core.split(separator).length - 1;
      const digitsAfter = core.length - index - 1;
      // "1,234" is thousands; "12.5" / "12,50" is a decimal.
      if (occurrences === 1 && digitsAfter !== 3) decimalIndex = index;
    }
  }

  const integerPart = (
    decimalIndex === -1 ? core : core.slice(0, decimalIndex)
  ).replace(/[.,]/g, "");
  const fractionPart =
    decimalIndex === -1
      ? ""
      : core.slice(decimalIndex + 1).replace(/[.,]/g, "");

  return Number(fractionPart ? `${integerPart}.${fractionPart}` : integerPart);
}

/** "₦86,400.00" shown as "₦86,400" (only drops an all-zero decimal part). */
export function tidyMoney(value: string): string {
  return value.replace(/[.,]0{1,2}(?=[^\d]*$)/, "");
}

/**
 * Formats `value` with the same currency symbol (and its placement) as an
 * API-formatted money string, e.g. ("₦86,400.00", 20000) gives "₦20,000".
 */
export function formatLike(
  reference: string | null | undefined,
  value: number,
) {
  const match = reference?.match(/^([^\d-]*)[\d.,\s]+([^\d]*)$/);
  const prefix = match?.[1] ?? "";
  const suffix = match?.[2] ?? "";
  const core = value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${prefix}${core}${suffix}`;
}

/**
 * Parses what the seller typed in the amount field ("20000", "20,000.50").
 * Commas are grouping, the dot is the decimal point. NaN when invalid.
 */
export function parseTypedAmount(value: string): number {
  const cleaned = value.replace(/[,\s]/g, "");
  return /^\d+(\.\d{1,2})?$/.test(cleaned) ? Number(cleaned) : NaN;
}
