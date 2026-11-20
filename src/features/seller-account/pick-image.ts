import * as ImagePicker from "expo-image-picker";
import type { PickedImage } from "./types";

interface PickImageOptions {
  /** Crop to a square (logo). */
  square?: boolean;
  /** Return the JPEG data too (for the base64 upload endpoint). */
  base64?: boolean;
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

/** Opens the photo library. Resolves to null when the user cancels. */
export async function pickImage({
  square = false,
  base64 = false,
}: PickImageOptions = {}): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: square,
    aspect: square ? [1, 1] : undefined,
    quality: 0.8,
    base64,
  });

  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;

  const mimeType = asset.mimeType ?? "image/jpeg";
  return {
    uri: asset.uri,
    base64: asset.base64 ?? null,
    name: asset.fileName ?? `upload-${Date.now()}.${extensionFor(mimeType)}`,
    mimeType,
  };
}
