import { Image, View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn, getInitials } from "~/lib/utils/helpers";

interface ShopLogoProps {
  name: string;
  /** Image URL; initials are shown when there is none. */
  uri?: string | null;
  size?: "md" | "lg";
}

const SIZES = {
  md: { box: "h-14 w-14", text: "text-[21px]", px: 56 },
  lg: { box: "h-16 w-16", text: "text-2xl", px: 64 },
} as const;

// Rounded-square logo tile with initials fallback (peach tile, brand text).
export function ShopLogo({ name, uri, size = "md" }: ShopLogoProps) {
  const s = SIZES[size];

  return (
    <View
      accessibilityLabel={`${name} logo`}
      className={cn(
        "items-center justify-center overflow-hidden rounded-2xl border border-tint-border bg-tint",
        s.box,
      )}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: s.px, height: s.px }}
          resizeMode="cover"
        />
      ) : (
        <Text
          variant="display"
          tone="brand"
          className={cn("leading-none", s.text)}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
