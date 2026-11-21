import { Image, View } from "react-native";
import { Text } from "~/components/ui/text";
import { getInitials } from "~/lib/utils/helpers";

/** Round customer tile (44px): photo when the API has one, initials otherwise. */
export function CustomerAvatar({
  name,
  uri,
}: {
  name: string;
  uri: string | null;
}) {
  return (
    <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-tint-border bg-tint">
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: 44, height: 44 }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text className="font-sans-extrabold text-base text-brand-text">
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
