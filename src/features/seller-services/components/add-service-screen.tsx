import { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemeColors } from "~/lib/colors";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { Notice } from "~/components/ui/notice";
import { Text } from "~/components/ui/text";
import { CategoryField } from "~/features/seller-products/components/category-field";
import { FormScreen } from "~/features/seller-products/components/form-screen";
import { OptionSelectField } from "~/features/seller-products/components/option-select-field";
import { PillSegmentedControl } from "~/features/seller-products/components/pill-segmented-control";
import { StepBar } from "~/features/seller-products/components/step-bar";
import {
  applyServerErrors,
  getValidationErrors,
} from "~/features/seller-products/errors";
import { PhotoPicker } from "~/features/seller-uploads/components/photo-picker";
import { usePhotoUploads } from "~/features/seller-uploads/hooks";
import {
  LOCATION_MAX,
  PRICE_TYPES,
  SERVICE_AREA_MAX,
  SERVICE_TYPES,
  SLOT_MODES,
} from "../constants";
import { useCreateService } from "../hooks";
import {
  SERVICE_DEFAULT_VALUES,
  SERVICE_STEP_ONE_FIELDS,
  serviceSchema,
  type ServiceFormValues,
} from "../schemas";
import { buildServicePayload } from "../utils";

/** Server validation keys -> form fields. */
const FIELD_MAP = {
  name: "name",
  category_ids: "category_id",
  category_id: "category_id",
  description: "description",
  unit_price: "unit_price",
  current_stock: "current_stock",
  "service_meta.service_type": "service_type",
  "service_meta.pricing_type": "pricing_type",
  "service_meta.slot_mode": "slot_mode",
  "service_meta.location": "location",
  "service_meta.service_area": "service_area",
} as const;

const SERVICE_TYPE_OPTIONS = SERVICE_TYPES.map(({ value, label }) => ({
  value,
  label,
}));
const PRICE_TYPE_OPTIONS = PRICE_TYPES.map(({ value, label }) => ({
  value,
  label,
}));

const isStepOneField = (field: string) =>
  (SERVICE_STEP_ONE_FIELDS as readonly string[]).includes(field);

// Two-step "Add service" form (AddService / AddService2 boards). Posts to
// POST /seller/products/add with listing_type=service and service_meta[...].
export function AddServiceScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const uploads = usePhotoUploads();
  const { mutate: createService, isPending } = useCreateService();
  const [step, setStep] = useState<1 | 2>(1);
  const [serverNotice, setServerNotice] = useState<string[]>([]);

  const { control, handleSubmit, setError, trigger, setValue } =
    useForm<ServiceFormValues>({
      resolver: zodResolver(serviceSchema),
      defaultValues: SERVICE_DEFAULT_VALUES,
    });

  const slotMode = useWatch({ control, name: "slot_mode" });
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
    if (await trigger([...SERVICE_STEP_ONE_FIELDS])) setStep(2);
  };

  const onSubmit = handleSubmit((values) => {
    if (blockedByPhotos) return;
    const payload = buildServicePayload(values, uploads.uploadedIds);
    if (!payload) {
      setStep(1);
      return;
    }
    setServerNotice([]);
    createService(payload, {
      onSuccess: () => router.replace("/services/saved"),
      onError: (error) => {
        const errors = getValidationErrors(error);
        if (!errors) return;
        const { mapped, unmapped } = applyServerErrors<ServiceFormValues>(
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
      Retry it or remove it to save your service.
    </Notice>
  ) : null;

  const serverNoticeView =
    serverNotice.length > 0 ? (
      <Notice tone="error" title="We couldn't save this service">
        {serverNotice.join("\n")}
      </Notice>
    ) : null;

  if (step === 1) {
    return (
      <FormScreen
        key="details"
        title="Add service"
        footer={<Button onPress={() => void goNext()}>Continue</Button>}
      >
        <StepBar step={1} total={2} label="Details" />
        {serverNoticeView}
        {photoNotice}

        <PhotoPicker uploads={uploads} size="lg" />

        <FormField
          control={control}
          name="name"
          label="Service name"
          placeholder="Service name"
          maxLength={200}
        />

        <Controller
          control={control}
          name="service_type"
          render={({ field, fieldState }) => (
            <OptionSelectField
              label="Service type"
              value={field.value}
              options={SERVICE_TYPE_OPTIONS}
              onChange={field.onChange}
              placeholder="Choose a service type"
              error={fieldState.error?.message}
            />
          )}
        />

        {/* Not on the board, but the API requires category_ids for every
            listing type (ProductRequest), so services need one too. */}
        <Controller
          control={control}
          name="category_id"
          render={({ field, fieldState }) => (
            <CategoryField
              label="Service category"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <FormField
          control={control}
          name="description"
          label="Description"
          placeholder="What do you offer?"
          multiline
          style={{ minHeight: 72 }}
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      key="pricing"
      title="Add service"
      onBack={() => setStep(1)}
      footer={
        <Button
          onPress={() => void onSubmit()}
          loading={isPending}
          disabled={blockedByPhotos}
        >
          Save service
        </Button>
      }
    >
      <StepBar step={2} total={2} label="Price and area" />
      {serverNoticeView}
      {photoNotice}

      <Controller
        control={control}
        name="pricing_type"
        render={({ field, fieldState }) => (
          <OptionSelectField
            label="Price type"
            value={field.value}
            options={PRICE_TYPE_OPTIONS}
            onChange={field.onChange}
            placeholder="Choose a price type"
            error={fieldState.error?.message}
          />
        )}
      />

      <FormField
        control={control}
        name="unit_price"
        type="number"
        label="Price (₦)"
        placeholder="0"
        keyboardType="decimal-pad"
      />

      <View className="gap-1.5">
        <Text variant="label">Availability</Text>
        <PillSegmentedControl
          options={SLOT_MODES}
          value={slotMode}
          accessibilityLabel="Availability"
          onChange={(value) =>
            setValue("slot_mode", value, { shouldValidate: true })
          }
        />
      </View>
      {/* Not on the board: the API requires a quantity for limited slots. */}
      {slotMode === "limited" ? (
        <FormField
          control={control}
          name="current_stock"
          type="number"
          label="Available slots"
          placeholder="0"
          keyboardType="number-pad"
          maxLength={6}
        />
      ) : null}

      <View className="gap-1.5">
        <Text variant="label">Location</Text>
        <View>
          <View
            pointerEvents="none"
            className="absolute left-4 top-0 z-10 h-field justify-center"
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={colors["muted-foreground"]}
            />
          </View>
          <FormField
            control={control}
            name="location"
            placeholder="Office, city or branch"
            maxLength={LOCATION_MAX}
            className="pl-8"
          />
        </View>
      </View>

      <FormField
        control={control}
        name="service_area"
        label="Service area"
        placeholder="Where you can serve customers"
        maxLength={SERVICE_AREA_MAX}
      />
    </FormScreen>
  );
}
