import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { notifyError } from "~/lib/utils/toast";
import UploadService from "./api";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_QUALITY } from "./constants";
import type { PhotoItem } from "./types";
import {
  base64ByteLength,
  extensionFor,
  sanitiseFilename,
  uploadErrorMessage,
} from "./utils";

/**
 * Photo selection plus upload state for one form.
 *
 * Each picked photo is uploaded immediately (base64 via /file/image-upload) and
 * tracked on its own: uploading with progress, done with its server id, or
 * failed with a retry. The form reads `uploadedIds` (in display order, the
 * first one is the cover) and blocks submit while `isUploading`.
 */
export function usePhotoUploads(max: number = MAX_PHOTOS) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const patch = useCallback((key: string, changes: Partial<PhotoItem>) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.key === key ? { ...photo, ...changes } : photo,
      ),
    );
  }, []);

  const upload = useCallback(
    async (photo: PhotoItem) => {
      if (!photo.base64) return;
      patch(photo.key, { status: "uploading", progress: 0, error: undefined });
      try {
        const uploadId = await UploadService.uploadImage({
          base64: photo.base64,
          filename: photo.filename,
          onProgress: (progress) => patch(photo.key, { progress }),
        });
        patch(photo.key, {
          status: "done",
          progress: 100,
          uploadId,
          base64: undefined,
        });
      } catch (error) {
        patch(photo.key, {
          status: "failed",
          error: uploadErrorMessage(error),
        });
      }
    },
    [patch],
  );

  const pick = useCallback(async () => {
    const remaining = max - photos.length;
    if (remaining <= 0) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: remaining > 1,
        selectionLimit: remaining,
        quality: PHOTO_QUALITY,
        base64: true,
        exif: false,
      });
      if (result.canceled) return;

      let rejected = 0;
      const added: PhotoItem[] = [];
      result.assets.slice(0, remaining).forEach((asset, index) => {
        if (!asset.base64 || base64ByteLength(asset.base64) > MAX_PHOTO_BYTES) {
          rejected += 1;
          return;
        }
        added.push({
          key: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
          uri: asset.uri,
          status: "uploading",
          progress: 0,
          filename: sanitiseFilename(
            asset.fileName,
            extensionFor(asset.mimeType),
            photos.length + index,
          ),
          base64: asset.base64,
        });
      });

      if (rejected > 0) {
        notifyError({
          message: "Some photos were skipped",
          description: `Each photo must be under ${MAX_PHOTO_BYTES / (1024 * 1024)} MB.`,
        });
      }
      if (added.length === 0) return;

      setPhotos((prev) => [...prev, ...added]);
      added.forEach((photo) => void upload(photo));
    } catch {
      notifyError({ message: "Could not open your photos. Please try again." });
    }
  }, [max, photos.length, upload]);

  const retry = useCallback(
    (key: string) => {
      const photo = photos.find((p) => p.key === key);
      if (photo) void upload(photo);
    },
    [photos, upload],
  );

  const remove = useCallback((key: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.key !== key));
  }, []);

  return {
    photos,
    pick,
    retry,
    remove,
    max,
    canAddMore: photos.length < max,
    isUploading: photos.some((photo) => photo.status === "uploading"),
    hasFailed: photos.some((photo) => photo.status === "failed"),
    /** Server ids of uploaded photos, cover first. */
    uploadedIds: photos.flatMap((photo) =>
      photo.status === "done" && photo.uploadId ? [photo.uploadId] : [],
    ),
  };
}

export type PhotoUploads = ReturnType<typeof usePhotoUploads>;
