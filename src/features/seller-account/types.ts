/** An image chosen from the library, ready to upload. */
export interface PickedImage {
  uri: string;
  /** JPEG data (only when requested from the picker). */
  base64: string | null;
  /** File name to show and to send with a multipart upload. */
  name: string;
  mimeType: string;
}

/** Fields of POST /seller/shop-update for the "shop profile" group. */
export interface ShopProfilePayload {
  name: string;
  address: string;
  phone: string;
  /** Upload id of the logo (from /file/image-upload). */
  logo: string | null;
  // shop-update overwrites these with null when they are missing from the
  // request, so the current values are always sent back.
  meta_title: string | null;
  meta_description: string | null;
  sliders: string | null;
}

/** Fields of POST /seller/shop-update for the "payout" group (all six are
 * always sent: the server nulls any that are missing). */
export interface PayoutPayload {
  cash_on_delivery_status: 0 | 1;
  bank_payment_status: 0 | 1;
  bank_name: string;
  bank_acc_name: string;
  bank_acc_no: string;
  bank_routing_no: string;
}

/** A bank the seller can pick, with the provider code the resolver needs. */
export interface BankOption {
  name: string;
  code: string;
}

/** Fields of POST /seller/shop-update for the "banners" group. */
export interface BannersPayload {
  /** Comma-separated upload ids, in display order ("" removes them all). */
  sliders: string;
}

/** What the (proposed) bank resolver returns. */
export interface ResolvedAccount {
  accountName: string;
}

export interface ResolveAccountInput {
  bankCode: string;
  accountNumber: string;
}

export type VerificationFieldType =
  "text" | "file" | "select" | "multi_select" | "radio";

/** One entry of the admin-configured verification form. */
export interface VerificationElement {
  /** Position in the admin form: the API names the value `element_<index>`. */
  index: number;
  type: VerificationFieldType;
  label: string;
  options: string[];
}

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

export type VerificationValue = string | string[] | PickedFile | null;
export type VerificationFormValues = Record<string, VerificationValue>;
