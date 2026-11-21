import { Image, View } from "react-native";
import { RoundIconButton } from "~/components/ui/round-icon-button";
import { Text } from "~/components/ui/text";

interface BannerTileProps {
  /** 1-based position, shown as "Banner N". */
  position: number;
  uri: string | null;
  onRemove: () => void;
}

// One banner on the Shop banners screen: 110px wide tile (picture or the peach
// placeholder), its name bottom-left and a 44px remove button top-right.
export function BannerTile({ position, uri, onRemove }: BannerTileProps) {
  return (
    <View className="h-[110px] overflow-hidden rounded-[20px] border border-tint-border bg-tint">
      {uri ? (
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
          accessibilityLabel={`Banner ${position}`}
        />
      ) : (
        <View className="bg-tint-border/60 absolute -right-[30px] -top-[30px] h-[130px] w-[130px] rounded-full" />
      )}
      <View className="bg-card/90 absolute bottom-3 left-4 rounded-full px-2.5 py-0.5">
        <Text className="font-sans-bold text-sm text-brand-text">
          {`Banner ${position}`}
        </Text>
      </View>
      <View className="absolute right-2.5 top-2.5">
        <RoundIconButton
          icon="close"
          label={`Remove banner ${position}`}
          onPress={onRemove}
        />
      </View>
    </View>
  );
}
