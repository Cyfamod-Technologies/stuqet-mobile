import { axiosPrivate } from "~/lib/config/axios";
import type { ImageUploadResponse, UploadImageInput } from "./types";

const UploadService = {
  /**
   * Upload one base64 image. NOTE: the base URL already ends in /api/v2, so the
   * path is `/file/image-upload`. Returns the id that listing endpoints expect.
   */
  uploadImage: async ({
    base64,
    filename,
    onProgress,
  }: UploadImageInput): Promise<number> => {
    const { data } = await axiosPrivate.post<ImageUploadResponse>(
      "/file/image-upload",
      { image: base64, filename },
      {
        onUploadProgress: (event) => {
          if (event.total) {
            onProgress?.(Math.round((event.loaded / event.total) * 100));
          }
        },
      },
    );
    if (!data.upload_id) {
      throw new Error(data.message || "The photo could not be uploaded.");
    }
    return data.upload_id;
  },
};

export default UploadService;
