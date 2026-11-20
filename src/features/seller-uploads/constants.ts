/** Most photos a listing can carry. */
export const MAX_PHOTOS = 5;

/** Largest accepted photo after compression. The server has no documented
 * limit (nginx/PHP body size is unknown), so stay conservative. */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

/** Compression applied by the picker (0-1). */
export const PHOTO_QUALITY = 0.6;
