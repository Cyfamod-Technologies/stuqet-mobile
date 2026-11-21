import { useState } from "react";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { MediaPickerSheet } from "~/components/ui/media-picker-sheet";
import { Text } from "~/components/ui/text";
import type { PhotoUploads } from "../hooks";
import type { PhotoItem } from "../types";

interface PhotoPickerProps {
  uploads: PhotoUploads;
  label?: string;
  error?: string;
  /** Tile edge: 80px (products, food) or 88px (services board). */
  size?: "md" | "lg";
}

const TILE_SIZES = { md: "h-20 w-20", lg: "h-[88px] w-[88px]" } as const;

// iOS cannot present the camera or library while the sheet's modal is still
// dismissing, so give it a moment before launching the picker.
const SHEET_DISMISS_DELAY = Platform.OS === "ios" ? 450 : 0;

function PhotoTile({
  photo,
  index,
  tile,
  onRetry,
  onRemove,
}: {
  photo: PhotoItem;
  index: number;
  tile: string;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const colors = useThemeColors();
  const status =
    photo.status === "uploading"
      ? `uploading, ${photo.progress} percent`
      : photo.status === "failed"
        ? "upload failed, double tap to retry"
        : "uploaded";

  return (
    <View
      className={`${tile} overflow-visible rounded-[18px]`}
      accessible
      accessibilityLabel={`Photo ${index + 1}${index === 0 ? ", cover" : ""}, ${status}`}
    >
      <Image
        source={{ uri: photo.uri }}
        className={`${tile} rounded-[18px] border border-tint-border bg-tint`}
        resizeMode="cover"
      />

      {photo.status === "uploading" ? (
        <View
          className={`${tile} absolute items-center justify-center rounded-[18px] bg-black/40`}
        >
          <Text className="font-sans-bold text-sm text-white">
            {photo.progress}%
          </Text>
        </View>
      ) : null}

      {photo.status === "failed" ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={`Retry uploading photo ${index + 1}`}
          className={`${tile} bg-destructive-tint/95 absolute items-center justify-center gap-0.5 rounded-[18px] border border-destructive`}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={colors["destructive-text"]}
          />
          <Text className="font-sans-bold text-xs text-destructive-text">
            Retry
          </Text>
        </Pressable>
      ) : null}

      {index === 0 && photo.status === "done" ? (
        <View className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5">
          <Text className="font-sans-bold text-[11px] leading-[14px] text-white">
            Cover
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={onRemove}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`Remove photo ${index + 1}`}
        className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full border border-border bg-field"
      >
        <Ionicons name="close" size={14} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

// "Photos" row: dashed add tile followed by the picked photos, each with its
// own upload progress / failed-retry state. The first photo is the cover.
export function PhotoPicker({
  uploads,
  label = "Photos",
  error,
  size = "md",
}: PhotoPickerProps) {
  const colors = useThemeColors();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { photos, canAddMore, max, takePhoto, pickFromLibrary, retry, remove } =
    uploads;
  const tile = TILE_SIZES[size];

  const afterSheet = (action: () => Promise<void>) => () => {
    setTimeout(() => void action(), SHEET_DISMISS_DELAY);
  };

  return (
    <View className="gap-2">
      <Text variant="label">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // The remove buttons overhang the tiles, so keep room above and right.
        className="-mx-5 overflow-visible"
        contentContainerStyle={{
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingRight: 28,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {canAddMore ? (
          <Pressable
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            accessibilityHint={`Take a photo or choose up to ${max} from your library`}
            className={`${tile} items-center justify-center gap-0.5 rounded-[18px] border-[1.5px] border-dashed border-primary bg-tint active:opacity-80`}
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={colors["brand-text"]}
            />
            <Text className="font-sans-bold text-xs text-brand-text">
              Add photo
            </Text>
          </Pressable>
        ) : null}
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.key}
            photo={photo}
            index={index}
            tile={tile}
            onRetry={() => retry(photo.key)}
            onRemove={() => remove(photo.key)}
          />
        ))}
      </ScrollView>
      <MediaPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onTakePhoto={afterSheet(takePhoto)}
        onChooseLibrary={afterSheet(pickFromLibrary)}
      />
      {error ? (
        <Text className="font-sans-medium text-xs text-destructive-text">
          {error}
        </Text>
      ) : (
        <Text variant="caption">
          Up to {max} photos. The first one is the cover.
        </Text>
      )}
    </View>
  );
}
