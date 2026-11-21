import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import { HeroBadge } from "~/components/ui/hero-badge";
import { Text } from "~/components/ui/text";
import { ActionBar } from "~/components/ui/action-bar";

// Shown after a successful create. New items stay hidden from customers until
// admin approval and shop verification, so the copy sets that expectation.
export function ItemSavedScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center gap-[18px] px-6">
        <HeroBadge icon="checkmark" tone="success" />
        <Text variant="display" className="text-center">
          Saved
        </Text>
        <Text tone="muted" className="max-w-[310px] text-center text-[17px]">
          Your item goes live once it has been approved and your shop is
          verified. You can check its status in your catalogue.
        </Text>
      </View>
      <ActionBar>
        <Button onPress={() => router.dismissTo("/catalogue")}>
          View catalogue
        </Button>
        <Button
          variant="outline"
          onPress={() =>
            router.dismissTo({ pathname: "/catalogue", params: { add: "1" } })
          }
        >
          Add another
        </Button>
      </ActionBar>
    </View>
  );
}
