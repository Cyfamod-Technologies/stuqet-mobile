import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { SetupHeader } from "~/features/customer-onboarding/components/setup-header";
import {
  PayoutFields,
  usePayoutForm,
} from "~/features/rider-account/components/payout-fields";
import { useApplyAsRider } from "~/features/rider-account/hooks";
import { useBanks } from "~/features/rider-account/hooks";
import { useRiderApplication } from "../store";

// Rider 4 · Payout: bank, account number and the confirmed account name, then
// "Submit application", which sends everything and opens "under review".
export function RiderPayoutStepScreen() {
  const app = useRiderApplication();
  const form = usePayoutForm();
  const banks = useBanks();
  const apply = useApplyAsRider();

  const submit = () =>
    apply.mutate(
      {
        phone: app.phone,
        school: app.school,
        area: app.area,
        avatar: app.avatar?.uri ?? null,
        vehicle: app.vehicle,
        plate: app.vehicle === "motorbike" ? app.plate.trim() : null,
        documents: Object.fromEntries(
          Object.entries(app.documents).map(([key, file]) => [
            key,
            file?.name ?? "",
          ]),
        ),
        payout: {
          bankCode: form.bankCode,
          bankName:
            banks.data?.find((b) => b.code === form.bankCode)?.name ?? "",
          accountNumber: form.accountNumber,
          accountName: form.accountName,
        },
      },
      { onSuccess: () => router.replace("/rider-setup/review") },
    );

  return (
    <View className="flex-1">
      <Screen
        contentContainerStyle={{ gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <SetupHeader step={4} total={4} label="Payout" />
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="font-sans-extrabold text-[32px] leading-[38px]"
          >
            Where should we pay you?
          </Text>
          <Text tone="muted" className="font-sans-medium text-base leading-6">
            Your earnings are paid to this bank account.
          </Text>
        </View>
        <PayoutFields form={form} />
      </Screen>
      <SetupFooter>
        <Button
          disabled={!form.ready}
          loading={apply.isPending}
          onPress={submit}
        >
          Submit application
        </Button>
      </SetupFooter>
    </View>
  );
}
