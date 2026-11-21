/**
 * Route of the demo rider, as fractions of the map image. It must match ROUTE
 * in scripts/generate-demo-customer-images.py, which draws it on the map.
 */
export const TRACK_ROUTE = [
  { x: 0.14, y: 0.78 },
  { x: 0.14, y: 0.52 },
  { x: 0.38, y: 0.52 },
  { x: 0.38, y: 0.3 },
  { x: 0.66, y: 0.3 },
  { x: 0.66, y: 0.58 },
  { x: 0.86, y: 0.58 },
  { x: 0.86, y: 0.22 },
];

/** Position `progress` (0 to 1) of the way along the route. */
export function pointOnRoute(progress: number): { x: number; y: number } {
  const clamped = Math.min(1, Math.max(0, progress));
  const lengths = TRACK_ROUTE.slice(1).map((point, i) =>
    Math.hypot(point.x - TRACK_ROUTE[i].x, point.y - TRACK_ROUTE[i].y),
  );
  let remaining = clamped * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i += 1) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] === 0 ? 0 : Math.min(1, remaining / lengths[i]);
      const a = TRACK_ROUTE[i];
      const b = TRACK_ROUTE[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= lengths[i];
  }
  return TRACK_ROUTE[TRACK_ROUTE.length - 1];
}

/** Seconds after placing an order at which each status starts (auto orders). */
export const AUTO_SCHEDULE: [
  import("~/features/customer-orders/types").OrderStatus,
  number,
][] = [
  ["pending", 0],
  ["confirmed", 6],
  ["preparing", 14],
  ["ready", 26],
  ["picked_up", 34],
  ["on_the_way", 46],
  ["delivered", 130],
];
