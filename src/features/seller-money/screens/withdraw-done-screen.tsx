import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { HeroBadge } from "~/components/ui/hero-badge";
import { Text } from "~/components/ui/text";

export function WithdrawDoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center gap-[18px] px-6">
        <HeroBadge icon="checkmark" tone="success" />
        <Text variant="display" className="text-center text-[30px] leading-9">
          Request sent
        </Text>
        <Text tone="muted" className="max-w-[300px] text-center text-[17px]">
          {amount
            ? `Your withdrawal request for ${amount} is pending. You will be notified when it is paid.`
            : "Your withdrawal request is pending. You will be notified when it is paid."}
        </Text>
      </View>
      <View
        className="px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 16 }}
      >
        <Button onPress={() => router.back()}>Back to money</Button>
      </View>
    </View>
  );
}
