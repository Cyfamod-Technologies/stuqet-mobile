import { Alert, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "~/components/ui/back-button";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import {
  AddressFields,
  useAddressForm,
} from "~/features/customer-account/components/address-fields";
import {
  useAddresses,
  useDeleteAddress,
  useMakeDefaultAddress,
  useSaveAddress,
} from "~/features/customer-account/hooks";
import { useCheckoutStore } from "../store";
import { notifySuccess } from "~/lib/utils/toast";

// Add address / Edit address: the same form as set-up step 3. The first address
// becomes the default, and a new one picked from Checkout is used right away.
export function AddressFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const addressId = id ? Number(id) : undefined;
  const addresses = useAddresses();
  const existing = addresses.data?.find((a) => a.id === addressId);
  const save = useSaveAddress();
  const makeDefault = useMakeDefaultAddress();
  const remove = useDeleteAddress();
  const setPicked = useCheckoutStore((s) => s.setAddressId);

  // `key` remounts the form once the saved address has loaded.
  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 28,
          paddingHorizontal: 20,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="headerTitle" className="flex-1 text-center">
            {addressId ? "Edit address" : "Add address"}
          </Text>
          <View className="w-11" />
        </View>
        <FormBody
          key={existing?.id ?? "new"}
          existing={existing}
          addressId={addressId}
          onSave={(values) =>
            save.mutate(
              {
                id: addressId,
                label: values.address.split(",")[0],
                address: values.address,
                stateId: values.stateId,
                cityId: values.cityId,
                areaId: values.areaId,
                phone: values.phone,
                makeDefault: !existing && (addresses.data?.length ?? 0) === 0,
              },
              {
                onSuccess: () => {
                  notifySuccess({
                    message: addressId ? "Address updated" : "Address saved",
                  });
                  router.back();
                },
              },
            )
          }
          saving={save.isPending}
          onMakeDefault={() =>
            addressId &&
            makeDefault.mutate(addressId, {
              onSuccess: () =>
                notifySuccess({ message: "Default address updated" }),
            })
          }
          onDelete={() =>
            Alert.alert("Delete this address?", "You can add it again later.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () =>
                  addressId &&
                  remove.mutate(addressId, {
                    onSuccess: () => {
                      setPicked(null);
                      router.back();
                    },
                  }),
              },
            ])
          }
        />
      </ScrollView>
    </View>
  );
}

function FormBody({
  existing,
  addressId,
  onSave,
  saving,
  onMakeDefault,
  onDelete,
}: {
  existing?: {
    address: string;
    stateId: number;
    cityId: number;
    areaId: number | null;
    phone: string;
    isDefault: boolean;
  };
  addressId?: number;
  onSave: (
    values: import("~/features/customer-account/schemas").AddressFormValues,
  ) => void;
  saving: boolean;
  onMakeDefault: () => void;
  onDelete: () => void;
}) {
  const form = useAddressForm(
    existing
      ? {
          address: existing.address,
          stateId: existing.stateId,
          cityId: existing.cityId,
          areaId: existing.areaId,
          phone: existing.phone,
        }
      : undefined,
  );

  return (
    <>
      <AddressFields form={form} />
      <View className="gap-3">
        <Button
          loading={saving || form.formState.isSubmitting}
          onPress={form.handleSubmit(onSave)}
        >
          {addressId ? "Save changes" : "Save address"}
        </Button>
        {addressId ? (
          <>
            {existing?.isDefault ? null : (
              <Button variant="outline" onPress={onMakeDefault}>
                Make default
              </Button>
            )}
            <Button
              variant="ghost"
              textClassName="text-[17px] text-destructive-text"
              onPress={onDelete}
            >
              Delete address
            </Button>
          </>
        ) : null}
      </View>
    </>
  );
}
