import { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Notice } from "~/components/ui/notice";
import { Text } from "~/components/ui/text";
import { Toggle } from "~/components/ui/toggle";
import { PhotoPicker } from "~/features/seller-uploads/components/photo-picker";
import { usePhotoUploads } from "~/features/seller-uploads/hooks";
import { SHADOWS } from "~/lib/colors";
import { DAYS, DELIVERY_OPTIONS } from "../constants";
import { applyServerErrors, getValidationErrors } from "../errors";
import { useCreateProduct } from "../hooks";
import {
  FOOD_DEFAULT_VALUES,
  FOOD_STEP_ONE_FIELDS,
  foodSchema,
  type FoodFormValues,
} from "../schemas";
import type { AvailabilityMode, PrepTimeUnit, StockMode } from "../types";
import { buildFoodPayload } from "../utils";
import { CategoryField } from "./category-field";
import { Chip } from "./chip";
import { FormScreen } from "./form-screen";
import {
  PillSegmentedControl,
  type PillSegmentOption,
} from "./pill-segmented-control";
import { StepBar } from "./step-bar";
import { TimeField } from "./time-field";

/** Server validation keys -> form fields (`*` = any array index). */
const FIELD_MAP = {
  name: "name",
  category_ids: "category_id",
  category_id: "category_id",
  unit_price: "unit_price",
  unit: "unit",
  current_stock: "current_stock",
  "food_meta.short_description": "short_description",
  "food_meta.delivery_options": "delivery_options",
  "food_meta.delivery_options.*": "delivery_options",
  "food_meta.prep_time_value": "prep_time_value",
  "food_meta.prep_time_unit": "prep_time_unit",
  "food_meta.stock_mode": "stock_mode",
  "food_meta.availability_mode": "availability_mode",
  "food_meta.available_days": "available_days",
  "food_meta.available_days.*": "available_days",
  "food_meta.time_slots": "time_from",
  "food_meta.time_slots.*.start": "time_from",
  "food_meta.time_slots.*.end": "time_to",
} as const;

const PREP_UNITS: PillSegmentOption<PrepTimeUnit>[] = [
  { value: "minutes", label: "Min" },
  { value: "hours", label: "Hours" },
];
const STOCK_MODES: PillSegmentOption<StockMode>[] = [
  { value: "unlimited", label: "Unlimited" },
  { value: "limited", label: "Limited" },
];
const AVAILABILITY_MODES: PillSegmentOption<AvailabilityMode>[] = [
  { value: "always", label: "Always" },
  { value: "scheduled", label: "Scheduled" },
];

const isStepOneField = (field: string) =>
  (FOOD_STEP_ONE_FIELDS as readonly string[]).includes(field);

export function AddFoodScreen() {
  const router = useRouter();
  const uploads = usePhotoUploads();
  const { mutate: createFood, isPending } = useCreateProduct();
  const [step, setStep] = useState<1 | 2>(1);
  const [serverNotice, setServerNotice] = useState<string[]>([]);

  const { control, handleSubmit, setError, trigger, setValue } =
    useForm<FoodFormValues>({
      resolver: zodResolver(foodSchema),
      defaultValues: FOOD_DEFAULT_VALUES,
    });

  const stockMode = useWatch({ control, name: "stock_mode" });
  const availabilityMode = useWatch({ control, name: "availability_mode" });
  const blockedByPhotos = uploads.isUploading || uploads.hasFailed;

  // Android back on step 2 returns to step 1 instead of leaving the form.
  useEffect(() => {
    if (step !== 2) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setStep(1);
      return true;
    });
    return () => sub.remove();
  }, [step]);

  const goNext = async () => {
    if (await trigger([...FOOD_STEP_ONE_FIELDS])) setStep(2);
  };

  const onSubmit = handleSubmit((values) => {
    if (blockedByPhotos) return;
    setServerNotice([]);
    createFood(buildFoodPayload(values, uploads.uploadedIds), {
      onSuccess: () => router.replace("/catalogue/saved"),
      onError: (error) => {
        const errors = getValidationErrors(error);
        if (!errors) return;
        const { mapped, unmapped } = applyServerErrors<FoodFormValues>(
          errors,
          FIELD_MAP,
          setError,
        );
        setServerNotice(unmapped);
        if (mapped.some(isStepOneField)) setStep(1);
      },
    });
  });

  const photoNotice = uploads.hasFailed ? (
    <Notice tone="warning" title="A photo didn't upload">
      Retry it or remove it to save your food item.
    </Notice>
  ) : null;

  const serverNoticeView =
    serverNotice.length > 0 ? (
      <Notice tone="error" title="We couldn't save this food item">
        {serverNotice.join("\n")}
      </Notice>
    ) : null;

  if (step === 1) {
    return (
      <FormScreen
        key="details"
        title="Add food"
        footer={<Button onPress={() => void goNext()}>Continue</Button>}
      >
        <StepBar step={1} total={2} label="Details" />
        {serverNoticeView}
        {photoNotice}

        <PhotoPicker uploads={uploads} />

        <FormField
          control={control}
          name="name"
          label="Food name"
          placeholder="Food name"
          maxLength={200}
        />

        <Controller
          control={control}
          name="category_id"
          render={({ field, fieldState }) => (
            <CategoryField
              label="Food category"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <FormField
          control={control}
          name="short_description"
          label="Short description"
          placeholder="One line, up to 255 characters"
          maxLength={255}
        />

        <Controller
          control={control}
          name="delivery_options"
          render={({ field, fieldState }) => (
            <View className="gap-2">
              <Text variant="label">How can customers get it?</Text>
              <View className="flex-row flex-wrap gap-2">
                {DELIVERY_OPTIONS.map((option) => {
                  const selected = field.value.includes(option.value);
                  return (
                    <Chip
                      key={option.value}
                      label={option.label}
                      large
                      check
                      role="checkbox"
                      selected={selected}
                      onPress={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((v) => v !== option.value)
                            : [...field.value, option.value],
                        )
                      }
                    />
                  );
                })}
              </View>
              {fieldState.error ? (
                <Text className="font-sans-medium text-xs text-destructive-text">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <View className="flex-row items-end gap-3">
          <FormField
            control={control}
            name="prep_time_value"
            type="number"
            label="Prep time"
            placeholder="0"
            keyboardType="number-pad"
            maxLength={4}
            containerClassName="flex-1"
          />
          <Controller
            control={control}
            name="prep_time_unit"
            render={({ field }) => (
              <View className="flex-1 gap-1.5">
                <Text variant="label">Unit</Text>
                <PillSegmentedControl
                  options={PREP_UNITS}
                  value={field.value}
                  onChange={field.onChange}
                  accessibilityLabel="Prep time unit"
                />
              </View>
            )}
          />
        </View>
      </FormScreen>
    );
  }

  return (
    <FormScreen
      key="pricing"
      title="Add food"
      onBack={() => setStep(1)}
      footer={
        <Button
          onPress={() => void onSubmit()}
          loading={isPending}
          disabled={blockedByPhotos}
        >
          Save food
        </Button>
      }
    >
      <StepBar step={2} total={2} label="Price and availability" />
      {serverNoticeView}
      {photoNotice}

      <View className="flex-row gap-3">
        <FormField
          control={control}
          name="unit_price"
          type="number"
          label="Price (₦)"
          placeholder="0"
          keyboardType="decimal-pad"
          containerClassName="flex-1"
        />
        <FormField
          control={control}
          name="unit"
          label="Serving unit"
          placeholder="Plate, Bowl, Pack"
          autoCapitalize="words"
          maxLength={20}
          containerClassName="flex-1"
        />
      </View>

      <View className="gap-1.5">
        <Text variant="label">Stock</Text>
        <PillSegmentedControl
          options={STOCK_MODES}
          value={stockMode}
          accessibilityLabel="Stock"
          onChange={(value) =>
            setValue("stock_mode", value, { shouldValidate: true })
          }
        />
      </View>
      {stockMode === "limited" ? (
        <FormField
          control={control}
          name="current_stock"
          type="number"
          label="Quantity available"
          placeholder="0"
          keyboardType="number-pad"
          hint="Marked sold out automatically when it reaches 0."
        />
      ) : null}

      <View className="gap-1.5">
        <Text variant="label">Availability</Text>
        <PillSegmentedControl
          options={AVAILABILITY_MODES}
          value={availabilityMode}
          accessibilityLabel="Availability"
          onChange={(value) =>
            setValue("availability_mode", value, { shouldValidate: true })
          }
        />
      </View>

      {availabilityMode === "scheduled" ? (
        <>
          <Controller
            control={control}
            name="available_days"
            render={({ field, fieldState }) => (
              <View className="gap-1.5">
                <Text variant="label">Days</Text>
                <View className="flex-row gap-1.5">
                  {DAYS.map((day) => {
                    const selected = field.value.includes(day.value);
                    return (
                      <Chip
                        key={day.value}
                        label={day.short}
                        accessibilityLabel={day.long}
                        shape="square"
                        grow
                        role="checkbox"
                        selected={selected}
                        onPress={() =>
                          field.onChange(
                            selected
                              ? field.value.filter((d) => d !== day.value)
                              : [...field.value, day.value],
                          )
                        }
                      />
                    );
                  })}
                </View>
                {fieldState.error ? (
                  <Text className="font-sans-medium text-xs text-destructive-text">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />
          <View className="flex-row gap-3">
            <TimeField control={control} name="time_from" label="From" />
            <TimeField control={control} name="time_to" label="To" />
          </View>
        </>
      ) : null}

      <Controller
        control={control}
        name="sold_out"
        render={({ field }) => (
          <Card
            style={SHADOWS.field}
            className="min-h-16 flex-row items-center gap-3 rounded-[20px] px-4 py-2.5"
          >
            <View className="flex-1">
              <Text variant="heading" className="text-base">
                Mark as sold out
              </Text>
              <Text variant="caption" className="text-[13px] leading-[18px]">
                Hides it from customers until you turn it off
              </Text>
            </View>
            <Toggle
              value={field.value}
              onValueChange={field.onChange}
              label="Mark as sold out"
            />
          </Card>
        )}
      />
    </FormScreen>
  );
}
