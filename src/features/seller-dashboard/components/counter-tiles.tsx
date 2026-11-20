import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { useOrderCount } from "~/features/seller-orders/hooks";
import type { DeliveryStatus } from "~/features/seller-orders/types";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface TileProps {
  label: string;
  icon: IconName;
  value: number | undefined;
  loading?: boolean;
  status: DeliveryStatus;
}

function Tile({ label, icon, value, loading, status }: TileProps) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: "/orders",
          params: { status, t: String(Date.now()) },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value ?? "loading"}. Opens orders`}
      style={SHADOWS.field}
      className="flex-1 gap-2 rounded-[20px] border border-border bg-card p-3.5 active:opacity-90"
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-tint">
        <Ionicons name={icon} size={18} color={colors["brand-text"]} />
      </View>
      {loading ? (
        <Skeleton className="h-[30px] w-10" />
      ) : (
        <Text className="font-sans-extrabold text-[26px] leading-[30px]">
          {value}
        </Text>
      )}
      <Text variant="caption" className="font-sans-semibold text-[13px]">
        {label}
      </Text>
    </Pressable>
  );
}

function OrderCountTile({
  status,
  label,
  icon,
}: {
  status: DeliveryStatus;
  label: string;
  icon: IconName;
}) {
  const count = useOrderCount(status);
  // A failed count is left out rather than shown as a wrong number.
  if (count.isError) return null;
  return (
    <Tile
      label={label}
      icon={icon}
      status={status}
      loading={count.isPending}
      value={count.data?.count}
    />
  );
}

// Three tiles: new (pending) orders, orders on the way, delivered orders.
// Counts come from the orders list paginator totals; "delivered" is the exact
// figure from shop/info.
export function CounterTiles({ delivered }: { delivered: number }) {
  return (
    <View className="flex-row gap-2.5">
      <OrderCountTile status="pending" label="New orders" icon="receipt-outline" />
      <OrderCountTile status="on_the_way" label="On delivery" icon="bicycle-outline" />
      <Tile
        status="delivered"
        label="Delivered"
        icon="checkmark"
        value={delivered}
      />
    </View>
  );
}
