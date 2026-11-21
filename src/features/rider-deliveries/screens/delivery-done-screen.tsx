import { router, useLocalSearchParams } from "expo-router";
import { Button } from "~/components/ui/button";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";
import { formatNaira } from "~/lib/utils/format";

// Delivery complete board: a success badge, the order, and a reminder to hand
// over the cash when it was a cash order.
export function DeliveryDoneScreen() {
  const { code, cash } = useLocalSearchParams<{
    code?: string;
    cash?: string;
  }>();
  return (
    <StatusLayout
      hero={
        <StatusHero
          icon="checkmark"
          size={164}
          core={84}
          iconSize={44}
          halo={120}
        />
      }
      title="Delivery complete"
      body={
        cash
          ? `Order #${code} was delivered. Remember to hand over ${formatNaira(Number(cash))} in cash.`
          : `Order #${code} was delivered. The customer paid online, so there is nothing to hand over.`
      }
      footer={
        <Button onPress={() => router.replace("/(tabs)/deliveries")}>
          Back to deliveries
        </Button>
      }
    />
  );
}
