import { useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { ListRow } from "~/components/ui/list-row";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { FormField } from "~/components/forms/form-field";
import type { ShopInfo } from "~/features/seller-shop/types";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { notifyError, notifySuccess } from "~/lib/utils/toast";
import { FormScreen } from "../components/form-screen";
import { IconFormField } from "../components/icon-field";
import { ShopLogo } from "~/components/shop-logo";
import { useUpdateShopProfile, useUploadImage } from "../hooks";
import {
  afterSheetCloses,
  pickImage,
  takePhoto,
  uploadFilename,
} from "../pick-image";
import { shopProfileSchema, type ShopProfileValues } from "../schemas";
import type { PickedImage } from "../types";

interface PendingLogo {
  uploadId: string;
  uri: string;
}

function hasUploadedLogo(shop: ShopInfo): boolean {
  return Boolean(shop.upload_id) && shop.upload_id !== "0";
}

function bannerSummary(shop: ShopInfo): string {
  const count = shop.sliders?.length ?? 0;
  if (count === 0) return "No banners yet. Add one";
  return `${count} ${count === 1 ? "banner" : "banners"} on your shop page`;
}

function ShopSettingsForm({ shop }: { shop: ShopInfo }) {
  const router = useRouter();
  const update = useUpdateShopProfile();
  const upload = useUploadImage();
  const [logo, setLogo] = useState<PendingLogo | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<ShopProfileValues>({
    resolver: zodResolver(shopProfileSchema),
    defaultValues: {
      name: shop.name ?? "",
      phone: shop.phone ?? "",
      address: shop.address ?? "",
    },
  });

  const uploadLogo = (image: PickedImage | null) => {
    if (!image) return;
    if (!image.base64) {
      notifyError({ message: "We couldn't read that photo. Try another one." });
      return;
    }
    upload.mutate(
      { base64: image.base64, filename: uploadFilename("shop-logo") },
      { onSuccess: (uploadId) => setLogo({ uploadId, uri: image.uri }) },
    );
  };

  const choose = (pick: typeof pickImage) => () =>
    afterSheetCloses(() => {
      void pick({ square: true, base64: true }).then(uploadLogo);
    });

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

  const fill =
    process.env.EXPO_PUBLIC_DEMO_MODE === "true"
      ? () => {
          const samples =
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require("~/demo/samples") as typeof import("~/demo/samples");
          reset(samples.shopProfileSample());
        }
      : undefined;

  const logoUri = logo?.uri ?? (hasUploadedLogo(shop) ? shop.logo : null);

  return (
    <FormScreen
      title="Shop settings"
      demoFill={fill}
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
      <Card className="overflow-hidden p-0">
        <ListRow
          icon="images-outline"
          title="Shop banners"
          subtitle={bannerSummary(shop)}
          onPress={() => router.push("/(tabs)/more/shop-banners")}
          last
        />
      </Card>

      <View className="flex-row items-center gap-3.5">
        <ShopLogo name={shop.name} uri={logoUri} size={72} />
        <Pressable
          onPress={() => setSheetOpen(true)}
          disabled={upload.isPending}
          accessibilityRole="button"
          accessibilityLabel="Change logo"
          hitSlop={8}
          className="min-h-11 justify-center"
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
      <IconFormField
        control={control}
        name="phone"
        icon="call-outline"
        label="Shop phone"
        placeholder="Phone"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <IconFormField
        control={control}
        name="address"
        icon="location-outline"
        label="Shop address"
        placeholder="Address"
      />

      <MediaPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add a photo"
        onTakePhoto={choose(takePhoto)}
        onChooseLibrary={choose(pickImage)}
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
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[72px] w-48 rounded-2xl" />
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
