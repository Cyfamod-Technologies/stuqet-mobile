/** 120000 -> "₦120,000". Whole naira only (the chart does not need kobo). */
export function formatNaira(value: number): string {
  const whole = Math.round(value);
  return `₦${String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
