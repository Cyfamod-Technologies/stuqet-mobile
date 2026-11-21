import { Image, View } from "react-native";
import { RoundIconButton } from "~/components/ui/round-icon-button";

interface PhotoChipProps {
  uri: string;
  onRemove: () => void;
  size?: number;
}

// Thumbnail of an attached photo with a remove button on its corner.
export function PhotoChip({ uri, onRemove, size = 88 }: PhotoChipProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri }}
        resizeMode="cover"
        accessibilityLabel="Attached photo"
        style={{ width: size, height: size }}
        className="rounded-[18px] border border-tint-border bg-tint"
      />
      <View className="absolute -right-3 -top-3">
        <RoundIconButton icon="close" label="Remove photo" onPress={onRemove} />
      </View>
    </View>
  );
}
