import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "~/components/screen";
import { SetupFooter } from "~/features/customer-onboarding/components/setup-footer";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import {
  AddressFields,
  useAddressForm,
} from "~/features/customer-account/components/address-fields";
import { useSaveAddress } from "~/features/customer-account/hooks";
import { SetupHeader } from "../components/setup-header";

// Set up 3 · Address: save a delivery address now to check out faster later, or
// "Add later".
export function AddressStepScreen() {
  const form = useAddressForm();
  const save = useSaveAddress();
  const next = () => router.push("/setup/notifications");

  const submit = form.handleSubmit((values) =>
    save.mutate(
      {
        label: values.address.split(",")[0],
        address: values.address,
        stateId: values.stateId,
        cityId: values.cityId,
        areaId: values.areaId,
        phone: values.phone,
        makeDefault: true,
      },
      { onSuccess: next },
    ),
  );

  return (
    <View className="flex-1">
      <Screen contentContainerStyle={{ gap: 14 }}>
        <SetupHeader step={3} total={4} label="Address" onSkip={next} />
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="font-sans-extrabold text-[32px] leading-[38px]"
          >
            Where should we deliver?
          </Text>
          <Text tone="muted" className="font-sans-medium text-base leading-6">
            Save a delivery address now to check out faster later.
          </Text>
        </View>
        <AddressFields form={form} />
      </Screen>
      <SetupFooter>
        <Button
          loading={save.isPending || form.formState.isSubmitting}
          onPress={submit}
        >
          Save address
        </Button>
        <Button
          variant="ghost"
          textClassName="text-[17px] text-brand-text underline"
          onPress={next}
        >
          Add later
        </Button>
      </SetupFooter>
    </View>
  );
}
