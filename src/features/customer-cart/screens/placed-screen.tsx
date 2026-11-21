import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ShopLogo } from "~/components/shop-logo";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { HeroBadge } from "~/components/ui/hero-badge";
import { StatusLayout } from "~/features/auth/components/status-layout";
import { goHome, useFoodNav } from "~/features/customer-food/navigation";
import { useOrder } from "~/features/customer-orders/hooks";

// Order placed board: a success badge with the vendor logo, "Order placed",
// who is preparing which order and how long it should take, then Track order
// and Back to home.
export function PlacedScreen() {
  const nav = useFoodNav();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useOrder(Number(orderId)).data;

  return (
    <StatusLayout
      hero={
        <View>
          <HeroBadge icon="checkmark" tone="success" />
          {order ? (
            <View className="absolute -bottom-1 -right-1 rounded-[22px] border-2 border-background bg-background">
              <ShopLogo
                uri={order.vendor.logo}
                name={order.vendor.name}
                size={56}
              />
            </View>
          ) : null}
        </View>
      }
      title="Order placed"
      body={
        order ? (
          <>
            {order.vendor.name} is preparing order{" "}
            <Text className="font-sans-bold text-[17px] text-foreground">{`#${order.code}`}</Text>
            . It should arrive in about {order.etaMinutes} minutes.
          </>
        ) : (
          "Your order is in. The vendor will confirm it shortly."
        )
      }
      footer={
        <>
          <Button onPress={() => nav.replaceWithTrack(Number(orderId))}>
            Track order
          </Button>
          <Button variant="outline" onPress={goHome}>
            Back to home
          </Button>
        </>
      }
    />
  );
}
