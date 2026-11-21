import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { cn } from "~/lib/utils/helpers";
import { LOGO_COLORS, SHADOWS } from "~/lib/colors";
import { Text } from "~/components/ui/text";

export type LogoSize = "xs" | "sm" | "default" | "lg" | "xl";
export type LogoVariant = "default" | "icon";
export type LogoLayout = "stacked" | "inline";
export type LogoTile = "brand" | "white" | "dark";

interface LogoProps {
  size?: LogoSize;
  /** "icon" shows the monogram tile only. */
  variant?: LogoVariant;
  /** "stacked" (default): tile above the wordmark. "inline": tile beside it. */
  layout?: LogoLayout;
  /**
   * Show the VENDOR pill under/next to the wordmark. Defaults to on in the
   * vendor build (EXPO_PUBLIC_ROUTE=vendor) and off in the customer build.
   */
  vendor?: boolean;
  /** Orange glow under the tile (login / splash). */
  glow?: boolean;
  className?: string;
  textClassName?: string;
}

// Brand mark from the Logo board (placeholder art until the real logo ships):
// a 64-unit rounded-square tile (radius 16) with a white "s." glyph. The glyph
// is Arial Bold 48px at (13, 47) converted to a path, so it renders the same
// on every platform without needing the font.
const GLYPH_PATH =
  "M14.12 39.9 20.73 38.89Q21.16 40.81 22.45 41.81Q23.73 42.8 26.05 42.8Q28.61 42.8 29.9 41.87Q30.77 41.21 30.77 40.11Q30.77 39.36 30.3 38.87Q29.8 38.4 28.09 38Q20.12 36.24 17.99 34.79Q15.04 32.77 15.04 29.19Q15.04 25.95 17.59 23.75Q20.15 21.55 25.52 21.55Q30.62 21.55 33.11 23.21Q35.59 24.88 36.53 28.13L30.32 29.28Q29.92 27.83 28.81 27.05Q27.7 26.28 25.63 26.28Q23.03 26.28 21.91 27.01Q21.16 27.52 21.16 28.34Q21.16 29.05 21.81 29.54Q22.7 30.2 27.96 31.39Q33.23 32.59 35.31 34.32Q37.38 36.08 37.38 39.22Q37.38 42.64 34.52 45.1Q31.66 47.56 26.05 47.56Q20.97 47.56 18 45.5Q15.04 43.44 14.12 39.9ZM43.14 47V40.41H49.73V47Z";

const IS_VENDOR_BUILD = process.env.EXPO_PUBLIC_ROUTE === "vendor";

// mark: tile px; text: wordmark font px; pill: VENDOR pill font px.
// Anchors from the boards: default = Welcome lockup (40 / 26), lg = Login tile
// (52+), xl = Splash lockup (44px wordmark), min monogram 24px.
const SIZES: Record<
  LogoSize,
  { mark: number; text: number; tracking: number; pill: number; gap: number }
> = {
  xs: { mark: 24, text: 20, tracking: -0.4, pill: 9, gap: 8 },
  sm: { mark: 32, text: 24, tracking: -0.5, pill: 10, gap: 8 },
  default: { mark: 40, text: 26, tracking: -0.5, pill: 11, gap: 10 },
  lg: { mark: 56, text: 34, tracking: -1, pill: 12, gap: 12 },
  xl: { mark: 96, text: 44, tracking: -1.5, pill: 12, gap: 18 },
};

interface LogoMarkProps {
  /** Tile size in px (24 minimum). */
  size?: number;
  tile?: LogoTile;
  glow?: boolean;
  /** Tile on a dark surface: the "dark" tile lightens to stay visible. */
  onDark?: boolean;
  accessibilityLabel?: string;
}

/** The "s." monogram tile. Decorative unless an accessibilityLabel is given. */
export function LogoMark({
  size = 40,
  tile = "brand",
  glow,
  onDark,
  accessibilityLabel,
}: LogoMarkProps) {
  const fill =
    tile === "brand"
      ? LOGO_COLORS.brand
      : tile === "white"
        ? LOGO_COLORS.white
        : onDark
          ? LOGO_COLORS.inkOnDark
          : LOGO_COLORS.ink;
  const glyph = tile === "brand" ? LOGO_COLORS.onBrand : LOGO_COLORS.brand;

  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={
        accessibilityLabel ? "yes" : "no-hide-descendants"
      }
      style={[
        { width: size, height: size, borderRadius: size / 4 },
        glow ? SHADOWS.button : undefined,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Rect width={64} height={64} rx={16} ry={16} fill={fill} />
        <Path d={GLYPH_PATH} fill={glyph} />
      </Svg>
    </View>
  );
}

export function Logo({
  size = "default",
  variant = "default",
  layout = "stacked",
  vendor = IS_VENDOR_BUILD,
  glow,
  className,
  textClassName,
}: LogoProps) {
  const s = SIZES[size];
  const isIconOnly = variant === "icon";
  const inline = layout === "inline";
  const label = vendor ? "Stuqet Vendor" : "Stuqet";

  const wordmark = (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      allowFontScaling={false}
      className={cn("font-sans-extrabold text-foreground", textClassName)}
      style={{
        fontSize: s.text,
        lineHeight: Math.round(s.text * 1.1),
        letterSpacing: s.tracking,
      }}
    >
      stuqet
    </Text>
  );

  const pill = vendor ? (
    <View
      className="self-center rounded-pill border border-tint-border bg-tint"
      style={{
        paddingHorizontal: Math.round(s.pill * 0.8),
        paddingVertical: Math.round(s.pill * 0.3),
      }}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        allowFontScaling={false}
        className="font-sans-extrabold text-brand-text"
        style={{
          fontSize: s.pill,
          lineHeight: Math.round(s.pill * 1.3),
          letterSpacing: s.pill * (inline ? 0.14 : 0.25),
        }}
      >
        VENDOR
      </Text>
    </View>
  ) : null;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label} logo`}
      className={cn(
        inline ? "flex-row items-center" : "flex-col items-center",
        className,
      )}
      style={{ gap: s.gap }}
    >
      <LogoMark size={s.mark} glow={glow} />
      {!isIconOnly && !inline && (
        <View className="items-center" style={{ gap: s.gap * 0.45 }}>
          {wordmark}
          {pill}
        </View>
      )}
      {!isIconOnly && inline && (
        <>
          {wordmark}
          {pill}
        </>
      )}
    </View>
  );
}
