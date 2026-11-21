import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { notifyError } from "~/lib/utils/toast";
import type { PickedFile, PickedImage } from "./types";

interface PickImageOptions {
  /** Crop to a square (logo). */
  square?: boolean;
  /** Crop to this ratio (banners). Ignored when `square` is set. */
  aspect?: [number, number];
  /** Return the JPEG data too (for the base64 upload endpoint). */
  base64?: boolean;
}

/**
 * iOS cannot present a picker while the bottom sheet's modal is still
 * dismissing, so pickers opened from a sheet wait for it to finish.
 */
export function afterSheetCloses(task: () => void) {
  setTimeout(task, Platform.OS === "ios" ? 450 : 0);
}

/** "shop-logo-1760000000000.jpg": a unique name for an upload. */
export function uploadFilename(prefix: string): string {
  return `${prefix}-${Date.now()}.jpg`;
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("pdf")) return "pdf";
  return "jpg";
}

/** Demo mode: the next bundled illustration for this kind of picture. */
function demoImageFor(options: PickImageOptions): PickedImage | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { pickDemoPhotos } = require("~/demo") as typeof import("~/demo");
  const purpose = options.square
    ? "logo"
    : options.aspect
      ? "banner"
      : "listing";
  return toPickedImage(pickDemoPhotos(1, purpose)[0]);
}

function toPickedImage(
  asset: ImagePicker.ImagePickerAsset | undefined,
): PickedImage | null {
  if (!asset) return null;
  const mimeType = asset.mimeType ?? "image/jpeg";
  return {
    uri: asset.uri,
    base64: asset.base64 ?? null,
    name: asset.fileName ?? `upload-${Date.now()}.${extensionFor(mimeType)}`,
    mimeType,
  };
}

function pickerOptions({
  square = false,
  aspect,
  base64 = false,
}: PickImageOptions): ImagePicker.ImagePickerOptions {
  const crop = square ? ([1, 1] as [number, number]) : aspect;
  return {
    mediaTypes: ["images"],
    allowsEditing: Boolean(crop),
    aspect: crop,
    quality: 0.8,
    base64,
  };
}

/** Opens the photo library. Resolves to null when the user cancels. */
export async function pickImage(
  options: PickImageOptions = {},
): Promise<PickedImage | null> {
  if (process.env.EXPO_PUBLIC_DEMO_MODE === "true") {
    return demoImageFor(options);
  }
  const result = await ImagePicker.launchImageLibraryAsync(
    pickerOptions(options),
  );
  return result.canceled ? null : toPickedImage(result.assets[0]);
}

/** Opens the camera. Resolves to null when cancelled or not allowed. */
export async function takePhoto(
  options: PickImageOptions = {},
): Promise<PickedImage | null> {
  if (process.env.EXPO_PUBLIC_DEMO_MODE === "true") {
    return demoImageFor(options);
  }
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    notifyError({
      message: "Allow camera access in your phone settings to take a photo.",
    });
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(pickerOptions(options));
  return result.canceled ? null : toPickedImage(result.assets[0]);
}

/** Opens the file browser for a JPG, PNG or PDF. Null when cancelled. */
export async function pickDocument(): Promise<PickedFile | null> {
  if (process.env.EXPO_PUBLIC_DEMO_MODE === "true") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { pickDemoDocument } = require("~/demo") as typeof import("~/demo");
    return pickDemoDocument();
  }
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/jpeg", "image/png", "application/pdf"],
    copyToCacheDirectory: true,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;

  const mimeType = asset.mimeType ?? "application/octet-stream";
  return {
    uri: asset.uri,
    name: asset.name || `document-${Date.now()}.${extensionFor(mimeType)}`,
    mimeType,
  };
}
