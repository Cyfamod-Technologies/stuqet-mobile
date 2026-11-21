import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DemoFill } from "~/components/demo-fill";
import { FormField } from "~/components/forms/form-field";
import { Select } from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { useAreas, useCities, useStates } from "../hooks";
import { addressSchema, type AddressFormValues } from "../schemas";

export function useAddressForm(initial?: Partial<AddressFormValues>) {
  return useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: "",
      stateId: 0,
      cityId: 0,
      areaId: null,
      phone: "",
      ...initial,
    },
  });
}

interface AddressFieldsProps {
  form: UseFormReturn<AddressFormValues>;
}

// The address form shared by set-up step 3 and the delivery address screens:
// street / hostel / building, State, City, Area and a phone number with the
// +234 prefix. State, city and area load from the places endpoints, each
// narrowing the next.
export function AddressFields({ form }: AddressFieldsProps) {
  const colors = useThemeColors();
  const [sample, setSample] = useState(0);
  const { control, setValue, formState } = form;
  const stateId = useWatch({ control, name: "stateId" });
  const cityId = useWatch({ control, name: "cityId" });
  const areaId = useWatch({ control, name: "areaId" });

  const states = useStates();
  const cities = useCities(stateId > 0 ? stateId : null);
  const areas = useAreas(cityId > 0 ? cityId : null);
  const toOptions = (rows?: { id: number; name: string }[]) =>
    (rows ?? []).map((row) => ({ label: row.name, value: String(row.id) }));

  const fill = () => {
    const { customerSamples } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("~/demo/customer") as typeof import("~/demo/customer");
    const item =
      customerSamples.address[sample % customerSamples.address.length];
    setSample((n) => n + 1);
    setValue("address", item.address, { shouldValidate: true });
    setValue("phone", item.phone, { shouldValidate: true });
    setValue("stateId", 1, { shouldValidate: true });
    setValue("cityId", 11, { shouldValidate: true });
    setValue("areaId", 111, { shouldValidate: true });
  };

  return (
    <View className="gap-3.5">
      <DemoFill
        onFill={process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? fill : undefined}
      />
      <FormField
        control={control}
        name="address"
        label="Address"
        placeholder="Street, hostel or building"
        autoComplete="street-address"
        startAdornment={
          <Ionicons name="location-outline" size={20} color={colors.hint} />
        }
      />
      <Select
        label="State"
        placeholder="Select state"
        value={stateId > 0 ? String(stateId) : ""}
        options={toOptions(states.data)}
        error={formState.errors.stateId?.message}
        onValueChange={(value) => {
          setValue("stateId", Number(value), { shouldValidate: true });
          setValue("cityId", 0);
          setValue("areaId", null);
        }}
      />
      <View className="flex-row gap-3">
        <Select
          className="flex-1"
          label="City"
          placeholder="Select city"
          value={cityId > 0 ? String(cityId) : ""}
          options={toOptions(cities.data)}
          disabled={stateId <= 0}
          error={formState.errors.cityId?.message}
          onValueChange={(value) => {
            setValue("cityId", Number(value), { shouldValidate: true });
            setValue("areaId", null);
          }}
        />
        <Select
          className="flex-1"
          label="Area"
          placeholder="Select area"
          value={areaId ? String(areaId) : ""}
          options={toOptions(areas.data)}
          disabled={cityId <= 0}
          onValueChange={(value) =>
            setValue("areaId", Number(value), { shouldValidate: true })
          }
        />
      </View>
      <View className="gap-1.5">
        <Text className="font-sans-semibold text-sm leading-[18px]">Phone</Text>
        <View className="flex-row gap-2.5">
          <View className="min-h-field items-center justify-center rounded-field border border-border bg-field px-4">
            <Text className="font-sans-bold text-base">+234</Text>
          </View>
          <View className="flex-1">
            <FormField
              control={control}
              name="phone"
              type="phone"
              placeholder="801 234 5678"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
