import { useState } from "react";
import { Image, View } from "react-native";
import { Text } from "~/components/ui/text";
import { getInitials } from "~/lib/utils/helpers";

export type ShopLogoSize = 24 | 40 | 56 | 72;

interface ShopLogoProps {
  /** Shop logo URL. Initials are shown when missing, loading or failed. */
  uri?: string | null;
  /** Shop name: source of the initials and of the accessibility label. */
  name: string;
  size?: ShopLogoSize;
  /**
   * Hide the tile from screen readers (default). Shop names are almost always
   * rendered next to the logo, so announcing "<name> logo" again is noise.
   * Pass `decorative={false}` where the logo stands alone.
   */
  decorative?: boolean;
}

// Initials are ~37.5% of the tile (board: 18px initials in a 48px tile).
const INITIALS_SIZE: Record<ShopLogoSize, number> = {
  24: 9,
  40: 15,
  56: 21,
  72: 27,
};

const RADIUS_RATIO = 0.28;

/**
 * The vendor/shop avatar used wherever a shop is shown: a rounded square
 * (radius 28% of the size, sizes 24/40/56/72) with the shop logo, falling back
 * to a monogram on the Stuqet tint tile (`tint-deep` fill, `tint-border` edge,
 * `brand-text` initials) while the image loads, if it fails, or when the shop
 * has no logo. Never use a generic store icon for a shop.
 */
export function ShopLogo({
  uri,
  name,
  size = 56,
  decorative = true,
}: ShopLogoProps) {
  const source = uri?.trim() ? uri.trim() : null;
  // Load status is keyed by URL, so a new logo (e.g. just uploaded) starts
  // again from "loading" without an effect.
  const [result, setResult] = useState<{
    uri: string;
    status: "loaded" | "failed";
  } | null>(null);
  const status = result && result.uri === source ? result.status : "loading";
  const failed = status === "failed";
  const loaded = status === "loaded";

  const initials = name.trim() ? getInitials(name) : "S";

  return (
    <View
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : "image"}
      accessibilityLabel={decorative ? undefined : `${name} logo`}
      importantForAccessibility={decorative ? "no-hide-descendants" : "yes"}
      style={{
        width: size,
        height: size,
        borderRadius: size * RADIUS_RATIO,
      }}
      className="shrink-0 items-center justify-center overflow-hidden border border-tint-border bg-tint-deep"
    >
      {/* Monogram: shown while loading, on failure and with no logo. Hidden
          once the image is in so transparent logos do not show it through. */}
      {loaded && !failed ? null : (
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          className="font-sans-extrabold text-brand-text"
          style={{
            fontSize: INITIALS_SIZE[size],
            lineHeight: INITIALS_SIZE[size] + 4,
          }}
        >
          {initials}
        </Text>
      )}
      {source && !failed ? (
        <Image
          source={{ uri: source }}
          accessible={false}
          onLoad={() => setResult({ uri: source, status: "loaded" })}
          onError={() => setResult({ uri: source, status: "failed" })}
          resizeMode="cover"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: size,
          }}
        />
      ) : null}
    </View>
  );
}
