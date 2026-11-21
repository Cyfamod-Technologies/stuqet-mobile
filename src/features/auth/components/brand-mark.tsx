import { View } from "react-native";
import { SHADOWS } from "~/lib/colors";
import { Text } from "~/components/ui/text";

interface BrandMarkProps {
  size?: number;
  /** Orange glow under the tile (login hero, splash). */
  glow?: boolean;
}

// The Stuqet "s." tile from the vendor boards: orange rounded square, white
// "s." Radius is ~28% of the size (16/40, 18/52, 34/120).
export function BrandMark({ size = 40, glow }: BrandMarkProps) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Stuqet"
      className="items-center justify-center bg-primary"
      style={[
        { width: size, height: size, borderRadius: size * 0.3 },
        glow ? SHADOWS.button : undefined,
      ]}
    >
      <Text
        allowFontScaling={false}
        className="font-sans-bold text-primary-foreground"
        style={{
          fontSize: size * 0.72,
          lineHeight: size * 0.9,
          marginTop: -size * 0.04,
        }}
      >
        s.
      </Text>
    </View>
  );
}

interface VendorChipProps {
  /** Larger variant used on the splash screen. */
  large?: boolean;
}

export function VendorChip({ large }: VendorChipProps) {
  return (
    <View
      className={
        large
          ? "rounded-full border-[1.5px] border-tint-border bg-tint px-3.5 py-1"
          : "rounded-full border border-tint-border bg-tint px-[9px] py-[3px]"
      }
    >
      <Text
        allowFontScaling={false}
        className="font-sans-extrabold text-brand-text"
        style={
          large
            ? { fontSize: 12, lineHeight: 16, letterSpacing: 3 }
            : { fontSize: 11, lineHeight: 14, letterSpacing: 1.5 }
        }
      >
        VENDOR
      </Text>
    </View>
  );
}

// Welcome-screen lockup: tile + "stuqet" wordmark + VENDOR chip.
export function VendorLockup() {
  return (
    <View className="flex-row items-center gap-2.5">
      <BrandMark size={40} />
      <Text
        className="font-sans-extrabold text-[26px] leading-7"
        style={{ letterSpacing: -0.5 }}
      >
        stuqet
      </Text>
      <VendorChip />
    </View>
  );
}
