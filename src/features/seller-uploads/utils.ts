import { isAxiosError } from "axios";

/** Extensions the upload endpoint accepts (FileController::imageUpload). */
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * The picker re-encodes to JPEG when `quality` < 1, so default to jpg and only
 * keep another extension when the mime type clearly says so.
 */
export function extensionFor(mimeType?: string | null): string {
  const extension = mimeType ? MIME_EXTENSIONS[mimeType.toLowerCase()] : null;
  return extension && ALLOWED_EXTENSIONS.some((e) => e === extension)
    ? extension
    : "jpg";
}

/**
 * The server writes the client-supplied name into `public/uploads/all`
 * unsanitised, so never send anything but `[a-z0-9-]` plus our own extension.
 */
export function sanitiseFilename(
  original: string | null | undefined,
  extension: string,
  index: number,
): string {
  const base = (original ?? "")
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "photo"}-${Date.now()}-${index}.${extension}`;
}

/** Decoded byte size of a base64 string. */
export function base64ByteLength(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/** Best human-readable message for a failed upload request. */
export function uploadErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message: unknown = (error.response?.data as { message?: unknown })
      ?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message.length) return message.join(" ");
    if (!error.response) return "No connection. Check your internet and retry.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "The photo could not be uploaded.";
}
