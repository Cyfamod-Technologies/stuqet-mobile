import { useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { FormField } from "~/components/forms/form-field";
import type { ShopInfo } from "~/features/seller-shop/types";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { notifyError, notifySuccess } from "~/lib/utils/toast";
import { FormScreen } from "../components/form-screen";
import { ShopLogo } from "../components/shop-logo";
import { useUpdateShopProfile, useUploadImage } from "../hooks";
import { pickImage } from "../pick-image";
import { shopProfileSchema, type ShopProfileValues } from "../schemas";

interface PendingLogo {
  uploadId: string;
  uri: string;
}

function hasUploadedLogo(shop: ShopInfo): boolean {
  return Boolean(shop.upload_id) && shop.upload_id !== "0";
}

function ShopSettingsForm({ shop }: { shop: ShopInfo }) {
  const router = useRouter();
  const update = useUpdateShopProfile();
  const upload = useUploadImage();
  const [logo, setLogo] = useState<PendingLogo | null>(null);

  const { control, handleSubmit } = useForm<ShopProfileValues>({
    resolver: zodResolver(shopProfileSchema),
    defaultValues: {
      name: shop.name ?? "",
      phone: shop.phone ?? "",
      address: shop.address ?? "",
    },
  });

  const changeLogo = async () => {
    const image = await pickImage({ square: true, base64: true });
    if (!image) return;
    if (!image.base64) {
      notifyError({ message: "We couldn't read that photo. Try another one." });
      return;
    }
    upload.mutate(
      { base64: image.base64, filename: `shop-logo-${Date.now()}.jpg` },
      { onSuccess: (uploadId) => setLogo({ uploadId, uri: image.uri }) },
    );
  };

  const onSubmit = handleSubmit((values) => {
    update.mutate(
      {
        name: values.name,
        address: values.address,
        phone: values.phone,
        logo: logo?.uploadId ?? shop.upload_id,
        // shop-update clears these when absent, so send the current values.
        meta_title: shop.title,
        meta_description: shop.description,
        sliders: shop.sliders_id,
      },
      {
        onSuccess: (message) => {
          notifySuccess({ message });
          router.back();
        },
      },
    );
  });

  const logoUri = logo?.uri ?? (hasUploadedLogo(shop) ? shop.logo : null);

  return (
    <FormScreen
      title="Shop settings"
      footer={
        <Button
          onPress={onSubmit}
          loading={update.isPending}
          disabled={upload.isPending}
        >
          Save changes
        </Button>
      }
    >
      <View className="flex-row items-center gap-3.5">
        <ShopLogo name={shop.name} uri={logoUri} size="lg" />
        <Pressable
          onPress={changeLogo}
          disabled={upload.isPending}
          accessibilityRole="button"
          accessibilityLabel="Change logo"
          hitSlop={8}
        >
          <Text variant="link" className="text-[15px] underline">
            {upload.isPending ? "Uploading…" : "Change logo"}
          </Text>
        </Pressable>
      </View>

      <FormField
        control={control}
        name="name"
        label="Shop name"
        placeholder="Shop name"
        autoCapitalize="words"
      />
      <FormField
        control={control}
        name="phone"
        type="phone"
        label="Shop phone"
        placeholder="Phone"
      />
      <FormField
        control={control}
        name="address"
        label="Shop address"
        placeholder="Address"
      />
    </FormScreen>
  );
}

export function ShopSettingsScreen() {
  const colors = useThemeColors();
  const shop = useShopInfo();

  if (shop.isPending) {
    return (
      <FormScreen title="Shop settings">
        <Skeleton className="h-16 w-40 rounded-2xl" />
        <Skeleton className="h-[52px] rounded-2xl" />
        <Skeleton className="h-[52px] rounded-2xl" />
        <Skeleton className="h-[52px] rounded-2xl" />
      </FormScreen>
    );
  }

  if (shop.isError) {
    return (
      <FormScreen
        title="Shop settings"
        refreshControl={
          <RefreshControl
            refreshing={shop.isRefetching}
            onRefresh={() => {
              void shop.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your shop"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => shop.refetch()}
        />
      </FormScreen>
    );
  }

  return <ShopSettingsForm shop={shop.data} />;
}
