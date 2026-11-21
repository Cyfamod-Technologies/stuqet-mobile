/** Response of POST /file/image-upload. */
export interface ImageUploadResponse {
  result: boolean;
  message: string;
  /** Absolute URL of the stored file. */
  path: string;
  /** Id to send to endpoints that attach files (0 on failure). */
  upload_id: number;
}

export type PhotoStatus = "uploading" | "done" | "failed";

/** One photo in the picker, from selection to uploaded id. */
export interface PhotoItem {
  /** Stable client key (list key and retry/remove handle). */
  key: string;
  /** Local file URI, used for the preview. */
  uri: string;
  status: PhotoStatus;
  /** 0-100 while uploading. */
  progress: number;
  /** Upload id once the server stored the file. */
  uploadId?: number;
  /** Sanitised file name sent to the server. */
  filename: string;
  /** Base64 payload, kept only until the upload succeeds so it can be retried. */
  base64?: string;
  /** Why the upload failed (shown to screen readers and in the retry hint). */
  error?: string;
}

export interface UploadImageInput {
  base64: string;
  filename: string;
  onProgress?: (percent: number) => void;
}
