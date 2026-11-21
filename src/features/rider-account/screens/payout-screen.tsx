import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionBar } from "~/components/ui/action-bar";
import { BackButton } from "~/components/ui/back-button";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { PayoutFields, usePayoutForm } from "../components/payout-fields";
import { useBanks, useRiderProfile, useSavePayout } from "../hooks";

// Payout details board: the same bank, account number and confirmed name as
// onboarding step 4, with "Save details".
export function RiderPayoutScreen() {
  const profile = useRiderProfile();
  // `key` remounts the form once the saved payout has loaded.
  return (
    <PayoutContent
      key={
        profile.isLoading
          ? "loading"
          : (profile.data?.payout?.accountNumber ?? "new")
      }
      loading={profile.isLoading}
      initial={profile.data?.payout ?? undefined}
    />
  );
}

function PayoutContent({
  loading,
  initial,
}: {
  loading: boolean;
  initial?: { bankCode: string; accountNumber: string };
}) {
  const insets = useSafeAreaInsets();
  const form = usePayoutForm(initial);
  const banks = useBanks();
  const save = useSavePayout();

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 24,
          paddingHorizontal: 20,
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="headerTitle" className="flex-1 text-center">
            Payout details
          </Text>
          <View className="w-11" />
        </View>
        {loading ? (
          <Skeleton className="h-64 rounded-card" />
        ) : (
          <PayoutFields form={form} />
        )}
      </ScrollView>
      <ActionBar>
        <Button
          disabled={!form.ready}
          loading={save.isPending}
          onPress={() =>
            save.mutate(
              {
                bankCode: form.bankCode,
                bankName:
                  banks.data?.find((b) => b.code === form.bankCode)?.name ?? "",
                accountNumber: form.accountNumber,
                accountName: form.accountName,
              },
              { onSuccess: () => router.back() },
            )
          }
        >
          Save details
        </Button>
      </ActionBar>
    </View>
  );
}
