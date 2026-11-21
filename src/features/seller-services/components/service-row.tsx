import { memo, useState } from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { Toggle } from "~/components/ui/toggle";
import type { SellerProduct } from "~/features/seller-products/types";
import { serviceMetaOf, servicePriceLine, serviceTypeLabel } from "../utils";

interface ServiceRowProps {
  service: SellerProduct;
  onTogglePublished: (service: SellerProduct, next: boolean) => void;
  /** True while this row's publish request is in flight. */
  busy?: boolean;
}

// One services row: thumbnail (wrench tile without a photo), name, price line,
// type badge, and the Published switch.
function ServiceRowBase({ service, onTogglePublished, busy }: ServiceRowProps) {
  const colors = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(service.thumbnail_img) && !imageFailed;

  // Admin approval wins when known (the list does not return it yet, backend
  // audit B5); otherwise the service type, falling back to the category until
  // `service_meta` is added to the list payload.
  const awaiting = service.approved === false;
  const typeLabel =
    serviceTypeLabel(serviceMetaOf(service)?.service_type) ??
    (service.category || undefined);

  return (
    <Card
      style={SHADOWS.field}
      className="flex-row items-center gap-3 rounded-[20px] p-3"
    >
      <View className="h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[14px] border border-tint-border bg-tint">
        {showImage ? (
          <Image
            source={{ uri: service.thumbnail_img }}
            className="h-full w-full"
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Ionicons
            name="construct-outline"
            size={25}
            color={colors["brand-text"]}
          />
        )}
      </View>

      <View className="min-w-0 flex-1 gap-1.5">
        <Text className="font-sans-bold text-base leading-5" numberOfLines={2}>
          {service.name}
        </Text>
        <Text
          className="font-sans-extrabold text-[15px] leading-[19px]"
          numberOfLines={1}
        >
          {servicePriceLine(service)}
        </Text>
        {awaiting || typeLabel ? (
          <View className="flex-row">
            <Badge
              label={awaiting ? "Awaiting approval" : (typeLabel ?? "")}
              variant={awaiting ? "warning" : "outline"}
              className={awaiting ? undefined : "bg-secondary"}
              textClassName={
                awaiting
                  ? "font-sans-bold leading-[14px]"
                  : "font-sans-bold leading-[14px] text-foreground"
              }
            />
          </View>
        ) : null}
      </View>

      <View className="items-end gap-2">
        <Text variant="caption" className="font-sans-semibold">
          Published
        </Text>
        <Toggle
          value={service.status}
          onValueChange={(next) => onTogglePublished(service, next)}
          disabled={busy}
          label={`Published, ${service.name}`}
        />
      </View>
    </Card>
  );
}

export const ServiceRow = memo(ServiceRowBase);
