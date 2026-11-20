import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
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
import { useCreateProduct } from "../hooks";
import { applyServerErrors, getValidationErrors } from "../errors";
import {
  PRODUCT_DEFAULT_VALUES,
  productSchema,
  type ProductFormValues,
} from "../schemas";
import { buildProductPayload } from "../utils";
import { CategoryField } from "./category-field";
import { FormScreen } from "./form-screen";

/** Server validation keys -> form fields. */
const FIELD_MAP = {
  name: "name",
  category_ids: "category_id",
  category_id: "category_id",
  unit_price: "unit_price",
  current_stock: "current_stock",
  unit: "unit",
} as const;

export function AddProductScreen() {
  const router = useRouter();
  const uploads = usePhotoUploads();
  const { mutate: createProduct, isPending } = useCreateProduct();
  const [serverNotice, setServerNotice] = useState<string[]>([]);

  const { control, handleSubmit, setError } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: PRODUCT_DEFAULT_VALUES,
  });

  const blockedByPhotos = uploads.isUploading || uploads.hasFailed;

  const onSubmit = handleSubmit((values) => {
    if (blockedByPhotos) return;
    setServerNotice([]);
    createProduct(buildProductPayload(values, uploads.uploadedIds), {
      onSuccess: () =>
        router.replace({
          pathname: "/catalogue/saved",
          params: { type: "product" },
        }),
      onError: (error) => {
        const errors = getValidationErrors(error);
        if (!errors) return;
        const { unmapped } = applyServerErrors<ProductFormValues>(
          errors,
          FIELD_MAP,
          setError,
        );
        setServerNotice(unmapped);
      },
    });
  });

  return (
    <FormScreen
      title="Add product"
      footer={
        <Button
          onPress={() => void onSubmit()}
          loading={isPending}
          disabled={blockedByPhotos}
        >
          Save product
        </Button>
      }
    >
      {serverNotice.length > 0 ? (
        <Notice tone="error" title="We couldn't save this product">
          {serverNotice.join("\n")}
        </Notice>
      ) : null}
      {uploads.hasFailed ? (
        <Notice tone="warning" title="A photo didn't upload">
          Retry it or remove it to save your product.
        </Notice>
      ) : null}

      <PhotoPicker uploads={uploads} />

      <FormField
        control={control}
        name="name"
        label="Product name"
        placeholder="Product name"
        maxLength={200}
      />

      <Controller
        control={control}
        name="category_id"
        render={({ field, fieldState }) => (
          <CategoryField
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

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
          name="current_stock"
          type="number"
          label="Quantity"
          placeholder="0"
          keyboardType="number-pad"
          containerClassName="flex-1"
        />
      </View>

      <FormField
        control={control}
        name="unit"
        label="Unit"
        placeholder="e.g. Pc, Kg"
        hint="Letters only, no numbers."
        autoCapitalize="words"
        maxLength={20}
      />

      <Controller
        control={control}
        name="cash_on_delivery"
        render={({ field }) => (
          <Card
            style={SHADOWS.field}
            className="min-h-16 flex-row items-center gap-3 rounded-[20px] px-4 py-2.5"
          >
            <View className="flex-1">
              <Text variant="heading" className="text-base">
                Allow cash on delivery
              </Text>
              <Text variant="caption" className="text-[13px] leading-[18px]">
                Buyers can pay when it arrives
              </Text>
            </View>
            <Toggle
              value={field.value}
              onValueChange={field.onChange}
              label="Allow cash on delivery"
            />
          </Card>
        )}
      />
    </FormScreen>
  );
}
