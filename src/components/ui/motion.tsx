import { useEffect, useRef, useState } from "react";
import { Keyframe, useReducedMotion } from "react-native-reanimated";

// Animations for the CONTENT of a screen (success badges, number count-up).
// Nothing here animates how a screen loads or how screens navigate; that is the
// navigation layer's job. All of it is skipped when "Reduce motion" is on.

/** A one-off expanding ring behind a success badge. */
export const RIPPLE = new Keyframe({
  0: { opacity: 0.55, transform: [{ scale: 0.9 }] },
  100: { opacity: 0, transform: [{ scale: 1.8 }] },
})
  .delay(320)
  .duration(1000);

const PARTICLES = 10;
const PARTICLE_DISTANCE = 82;

/** Keyframes for the confetti dots that burst out of a success badge. */
export const PARTICLE_KEYFRAMES = Array.from({ length: PARTICLES }, (_, i) => {
  const angle = (i / PARTICLES) * Math.PI * 2 + 0.3;
  const distance = PARTICLE_DISTANCE * (i % 2 === 0 ? 1 : 0.72);
  return new Keyframe({
    0: {
      opacity: 0,
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.3 }],
    },
    25: { opacity: 1 },
    100: {
      opacity: 0,
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale: 1 },
      ],
    },
  })
    .delay(380 + i * 14)
    .duration(820);
});

/**
 * Counts a number up to `target` (and from the previous value on changes), so
 * balances and sales totals ease in instead of snapping.
 */
export function useCountUp(target: number, duration = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const from = useRef(reduced ? target : 0);

  useEffect(() => {
    if (reduced) return;
    const start = Date.now();
    const origin = from.current;
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = origin + (target - origin) * eased;
      from.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  // With "Reduce motion" on there is nothing to animate.
  return reduced ? target : value;
}
