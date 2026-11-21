import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { HeroBadge } from "~/components/ui/hero-badge";
import { Text } from "~/components/ui/text";
import { SupportGate } from "../components/support-gate";

// Confirmation after "Submit ticket".
function TicketSent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code?: string }>();

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center gap-[18px] px-6">
        <HeroBadge icon="checkmark" tone="success" />
        <Text variant="display" className="text-center text-[30px] leading-9">
          Ticket sent
        </Text>
        <Text tone="muted" className="max-w-[310px] text-center text-[17px]">
          {`Your ticket${code ? ` #${code}` : ""} is open. We will reply in the ticket thread, and you can add replies and photos there.`}
        </Text>
      </View>
      <View
        className="gap-2.5 px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 16 }}
      >
        <Button onPress={() => router.dismissTo("/(tabs)/more/support")}>
          View tickets
        </Button>
        <Button
          variant="outline"
          className="min-h-[52px]"
          textClassName="text-[17px]"
          onPress={() => router.dismissTo("/(tabs)/more")}
        >
          Back to More
        </Button>
      </View>
    </View>
  );
}

export function TicketSentScreen() {
  return (
    <SupportGate>
      <TicketSent />
    </SupportGate>
  );
}
