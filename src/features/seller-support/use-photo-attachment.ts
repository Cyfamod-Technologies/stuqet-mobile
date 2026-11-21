import { useState } from "react";
import { useUploadImage } from "~/features/seller-account/hooks";
import {
  afterSheetCloses,
  pickImage,
  takePhoto,
  uploadFilename,
} from "~/features/seller-account/pick-image";
import { notifyError } from "~/lib/utils/toast";

interface AttachedPhoto {
  /** Upload id sent with the ticket or reply. */
  uploadId: string;
  uri: string;
}

/**
 * One optional photo for a ticket or reply: picked from the camera or the
 * library, uploaded straight away (base64 via /file/image-upload) and kept as
 * an upload id until the form is sent.
 */
export function usePhotoAttachment() {
  const upload = useUploadImage();
  const [photo, setPhoto] = useState<AttachedPhoto | null>(null);

  // Runs after the picker sheet has closed (see afterSheetCloses).
  const attach = (source: "camera" | "library") =>
    afterSheetCloses(() => {
      const pick = source === "camera" ? takePhoto : pickImage;
      void pick({ base64: true }).then((image) => {
        if (!image) return;
        if (!image.base64) {
          notifyError({
            message: "We couldn't read that photo. Try another one.",
          });
          return;
        }
        upload.mutate(
          { base64: image.base64, filename: uploadFilename("support") },
          { onSuccess: (uploadId) => setPhoto({ uploadId, uri: image.uri }) },
        );
      });
    });

  return {
    photo,
    uploading: upload.isPending,
    attach,
    remove: () => setPhoto(null),
  };
}
