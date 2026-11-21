import { useState } from "react";
import { Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import type { ShopInfo } from "~/features/seller-shop/types";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { notifyError, notifySuccess } from "~/lib/utils/toast";
import { BannerTile } from "../components/banner-tile";
import { FormScreen } from "../components/form-screen";
import { useUpdateBanners, useUploadImage } from "../hooks";
import {
  afterSheetCloses,
  pickImage,
  takePhoto,
  uploadFilename,
} from "../pick-image";
import type { PickedImage } from "../types";

interface Banner {
  /** Upload id, what shop-update stores. */
  id: string;
  uri: string | null;
}

/** Pairs the comma-separated ids with their picture URLs when they line up. */
function initialBanners(shop: ShopInfo): Banner[] {
  const ids = (shop.sliders_id ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const urls = shop.sliders ?? [];
  const aligned = urls.length === ids.length;
  return ids.map((id, index) => ({ id, uri: aligned ? urls[index] : null }));
}

function ShopBannersForm({ shop }: { shop: ShopInfo }) {
  const router = useRouter();
  const colors = useThemeColors();
  const update = useUpdateBanners();
  const upload = useUploadImage();
  const [banners, setBanners] = useState<Banner[]>(() => initialBanners(shop));
  const [sheetOpen, setSheetOpen] = useState(false);

  const addBanner = (image: PickedImage | null) => {
    if (!image) return;
    if (!image.base64) {
      notifyError({ message: "We couldn't read that photo. Try another one." });
      return;
    }
    upload.mutate(
      { base64: image.base64, filename: uploadFilename("shop-banner") },
      {
        onSuccess: (id) =>
          setBanners((current) => [...current, { id, uri: image.uri }]),
      },
    );
  };

  const choose = (pick: typeof pickImage) => () =>
    afterSheetCloses(() => {
      void pick({ aspect: [16, 9], base64: true }).then(addBanner);
    });

  const save = () =>
    update.mutate(
      { sliders: banners.map((banner) => banner.id).join(",") },
      {
        onSuccess: (message) => {
          notifySuccess({ message });
          router.back();
        },
      },
    );

  return (
    <FormScreen
      title="Shop banners"
      footer={
        <Button
          onPress={save}
          loading={update.isPending}
          disabled={upload.isPending}
        >
          Save banners
        </Button>
      }
    >
      <Text className="font-sans-medium text-[15px] leading-5 text-muted-foreground">
        Banners show at the top of your shop page. Wide photos work best.
      </Text>

      {banners.map((banner, index) => (
        <BannerTile
          key={banner.id}
          position={index + 1}
          uri={banner.uri}
          onRemove={() =>
            setBanners((current) => current.filter((b) => b.id !== banner.id))
          }
        />
      ))}

      <Pressable
        onPress={() => setSheetOpen(true)}
        disabled={upload.isPending}
        accessibilityRole="button"
        accessibilityLabel="Add banner"
        className="h-24 items-center justify-center gap-1 rounded-[20px] border-[1.5px] border-dashed border-tint-border bg-tint active:opacity-80"
      >
        <Ionicons name="add" size={22} color={colors["brand-text"]} />
        <Text variant="link" className="text-[15px]">
          {upload.isPending ? "Uploading…" : "Add banner"}
        </Text>
      </Pressable>

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

export function ShopBannersScreen() {
  const colors = useThemeColors();
  const shop = useShopInfo();

  if (shop.isPending) {
    return (
      <FormScreen title="Shop banners">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-[110px] rounded-[20px]" />
        <Skeleton className="h-[110px] rounded-[20px]" />
        <Skeleton className="h-24 rounded-[20px]" />
      </FormScreen>
    );
  }

  if (shop.isError) {
    return (
      <FormScreen
        title="Shop banners"
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

  return <ShopBannersForm shop={shop.data} />;
}
