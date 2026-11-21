import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import type { DocumentKey } from "~/features/rider-account/types";
import { notifyError } from "~/lib/utils/toast";
import type { PickedDocument } from "./store";

type Source = "camera" | "library" | "file";

// Picks a photo or document for the rider application. In demo mode it returns
// the next bundled illustration instead of opening the system picker.
export async function pickForRider(
  source: Source,
  documentKey?: DocumentKey,
): Promise<PickedDocument | null> {
  if (process.env.EXPO_PUBLIC_DEMO_MODE === "true") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const demo = require("~/demo/customer") as typeof import("~/demo/customer");
    const picked = documentKey
      ? demo.pickDemoDocument(documentKey)
      : demo.pickDemoPhoto();
    return { uri: picked.uri, name: picked.name };
  }

  if (source === "file") {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "application/pdf"],
      copyToCacheDirectory: true,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    return asset ? { uri: asset.uri, name: asset.name } : null;
  }

  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      notifyError({
        message: "Allow camera access in your phone settings to take a photo.",
      });
      return null;
    }
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: !documentKey,
    aspect: documentKey ? undefined : [1, 1],
  };
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  return asset
    ? { uri: asset.uri, name: asset.fileName ?? `photo-${Date.now()}.jpg` }
    : null;
}

/** iOS cannot present a picker while the bottom sheet is still dismissing. */
export function afterSheetCloses(task: () => void) {
  setTimeout(task, 450);
}
