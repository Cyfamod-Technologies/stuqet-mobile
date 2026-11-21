import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Keyframe,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import {
  dismissToast,
  useToastStore,
  type ToastItem,
  type ToastVariant,
} from "~/lib/stores/toast-store";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

// In-app notification (toast). Floating card pinned to the top of the screen,
// under the status bar / notch, 16px from each side. Use it through
// `notifySuccess / notifyError / notifyInfo / notifyWarning`
// (src/lib/utils/toast.ts); see "Notifications (toasts)" in docs/DESIGN.md.

const GUTTER = 16;
const TOP_GAP = 8;
const STACK_GAP = 8;

const VARIANTS: Record<
  ToastVariant,
  {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    accent: string;
    tile: string;
    color: "brand-text" | "success-text" | "warning-text" | "destructive-text";
    label: string;
  }
> = {
  success: {
    icon: "checkmark-circle",
    accent: "bg-success",
    tile: "bg-success-tint",
    color: "success-text",
    label: "Success",
  },
  error: {
    icon: "alert-circle",
    accent: "bg-destructive",
    tile: "bg-destructive-tint",
    color: "destructive-text",
    label: "Error",
  },
  info: {
    icon: "information-circle",
    accent: "bg-primary",
    tile: "bg-tint",
    color: "brand-text",
    label: "Notice",
  },
  warning: {
    icon: "warning",
    accent: "bg-warning",
    tile: "bg-warning-tint",
    color: "warning-text",
    label: "Warning",
  },
};

// Slide down from just above the resting spot while fading in; leave the same
// way up. Content animation only; nothing here touches navigation.
const ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -28 }, { scale: 0.96 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
}).duration(260);

const EXIT = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: -18 }] },
}).duration(180);

const SWIPE_UP_DISTANCE = 36;
const SWIPE_SIDE_DISTANCE = 80;
const SWIPE_VELOCITY = 650;

interface ToastCardProps {
  toast: ToastItem;
  reducedMotion: boolean;
}

const ToastCard = memo(function ToastCard({
  toast,
  reducedMotion,
}: ToastCardProps) {
  const { id, variant, message, description, duration, stamp } = toast;
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const v = VARIANTS[variant];

  // Auto-dismiss timer. It pauses while the card is touched or dragged and
  // resumes with whatever time was left; showing the same toast again (stamp)
  // starts it over.
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  useEffect(() => {
    remaining.current = duration;
  }, [duration, stamp]);
  useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => dismissToast(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - startedAt),
      );
    };
  }, [id, paused, stamp]);

  // Tell screen readers. Android reads the live region by itself; iOS needs an
  // explicit announcement.
  const spoken = description ? `${message}. ${description}` : message;
  useEffect(() => {
    if (Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(`${v.label}. ${spoken}`);
    }
  }, [spoken, stamp, v.label]);

  // Swipe up (or sideways) to dismiss; otherwise spring back.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const gone = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .activeOffsetY([-10, 10])
        .onBegin(() => {
          "worklet";
          runOnJS(setPaused)(true);
        })
        .onUpdate((e) => {
          "worklet";
          tx.set(e.translationX);
          // Dragging down is resisted; the card only leaves upward or sideways.
          ty.set(e.translationY < 0 ? e.translationY : e.translationY * 0.15);
        })
        .onEnd((e) => {
          "worklet";
          const side =
            Math.abs(e.translationX) > SWIPE_SIDE_DISTANCE ||
            Math.abs(e.velocityX) > SWIPE_VELOCITY;
          const up =
            e.translationY < -SWIPE_UP_DISTANCE ||
            e.velocityY < -SWIPE_VELOCITY;
          if (side || up) {
            if (side) {
              const dir = e.translationX < 0 ? -1 : 1;
              tx.set(withTiming(dir * width, { duration: 180 }));
            } else {
              ty.set(withTiming(-160, { duration: 180 }));
            }
            gone.set(
              withTiming(1, { duration: 180 }, (finished) => {
                if (finished) runOnJS(dismissToast)(id);
              }),
            );
          } else {
            tx.set(withSpring(0, { damping: 18, stiffness: 220 }));
            ty.set(withSpring(0, { damping: 18, stiffness: 220 }));
          }
        })
        .onFinalize(() => {
          "worklet";
          runOnJS(setPaused)(false);
        }),
    [id, width, tx, ty, gone],
  );

  const dragStyle = useAnimatedStyle(() => {
    const drift = Math.min(
      1,
      Math.max(Math.abs(tx.get()) / (width * 0.7), -ty.get() / 140),
    );
    return {
      opacity: (1 - drift * 0.6) * (1 - gone.get()),
      transform: [{ translateX: tx.get() }, { translateY: ty.get() }],
    };
  });

  return (
    <Animated.View
      entering={reducedMotion ? undefined : ENTER}
      exiting={reducedMotion ? undefined : EXIT}
      layout={reducedMotion ? undefined : LinearTransition.duration(220)}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={dragStyle}>
          {/* Shadow lives on the outer view; the inner one clips the accent. */}
          <View
            style={SHADOWS.toast}
            className="rounded-2xl border border-border-strong bg-card"
          >
            <View className="overflow-hidden rounded-2xl">
              <View
                className={cn("absolute bottom-0 left-0 top-0 w-1", v.accent)}
              />
              <Pressable
                accessible
                accessibilityRole="alert"
                accessibilityLabel={spoken}
                accessibilityHint="Double tap to dismiss"
                accessibilityLiveRegion={
                  variant === "error" || variant === "warning"
                    ? "assertive"
                    : "polite"
                }
                accessibilityActions={[{ name: "dismiss", label: "Dismiss" }]}
                onAccessibilityAction={() => dismissToast(id)}
                onPress={() => dismissToast(id)}
                className="min-h-[64px] flex-row items-center gap-3 py-3 pl-4 pr-1"
              >
                <View
                  className={cn(
                    "h-10 w-10 items-center justify-center rounded-tile",
                    v.tile,
                  )}
                >
                  <Ionicons name={v.icon} size={22} color={colors[v.color]} />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text
                    numberOfLines={2}
                    className="font-sans-bold text-[15px] leading-5"
                  >
                    {message}
                  </Text>
                  {description ? (
                    <Text variant="meta" numberOfLines={2}>
                      {description}
                    </Text>
                  ) : null}
                </View>
                <View
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  className="h-11 w-11 items-center justify-center"
                >
                  <Ionicons name="close" size={18} color={colors.subtle} />
                </View>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
});

// Mounted once in each root layout, last, so it draws over the navigators, the
// offline banner and the debug overlay. The wrapper only covers the toasts, so
// touches everywhere else pass straight through to the screen.
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 top-0 z-[100]"
      style={{
        paddingTop: insets.top + TOP_GAP,
        paddingLeft: Math.max(GUTTER, insets.left),
        paddingRight: Math.max(GUTTER, insets.right),
        gap: STACK_GAP,
        elevation: 100,
      }}
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} reducedMotion={reducedMotion} />
      ))}
    </View>
  );
}
