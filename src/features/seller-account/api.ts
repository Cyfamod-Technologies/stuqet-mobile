import { axiosPrivate } from "~/lib/config/axios";
import { VERIFICATION_FIELD_TYPES } from "./constants";
import type {
  BannersPayload,
  PayoutPayload,
  PickedFile,
  ResolveAccountInput,
  ResolvedAccount,
  ShopProfilePayload,
  VerificationElement,
  VerificationFieldType,
  VerificationFormValues,
} from "./types";

/** Shape of one entry of GET /seller/shop-verify-form (admin settings JSON). */
interface RawVerificationElement {
  type?: string;
  label?: string;
  /** A JSON-encoded string of choices, or an array. */
  options?: string | string[] | null;
}

function parseOptions(raw: RawVerificationElement["options"]): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isFieldType(type: string | undefined): type is VerificationFieldType {
  return VERIFICATION_FIELD_TYPES.some((known) => known === type);
}

const AccountService = {
  // POST /seller/shop-update (name + address + phone + logo group).
  updateShopProfile: async (payload: ShopProfilePayload): Promise<string> => {
    const { data } = await axiosPrivate.post<{ message?: string }>(
      "/seller/shop-update",
      payload,
    );
    return data.message ?? "Shop info updated successfully";
  },

  // POST /seller/shop-update (payment group).
  updatePayout: async (payload: PayoutPayload): Promise<string> => {
    const { data } = await axiosPrivate.post<{ message?: string }>(
      "/seller/shop-update",
      payload,
    );
    return data.message ?? "Payment info updated successfully";
  },

  // POST /seller/shop-update (sliders only). A request without name/address
  // and without the payment, social or location keys takes the "sliders"
  // branch of ShopController::update.
  updateBanners: async (payload: BannersPayload): Promise<string> => {
    const { data } = await axiosPrivate.post<{ message?: string }>(
      "/seller/shop-update",
      payload,
    );
    return data.message ?? "Shop banners updated successfully";
  },

  // TODO(backend): this endpoint does not exist yet. The Paystack secret key
  // cannot live in the app, so the backend must proxy "resolve account":
  //   POST /seller/bank/resolve { bank_code, account_number }
  //   200 { result: true, data: { account_name: "CAMPUS MART LTD" } }
  //   "account not found" as HTTP 4xx or 200 { result: false, message }
  // Only called when EXPO_PUBLIC_ENABLE_ACCOUNT_RESOLVE is "true".
  resolveBankAccount: async ({
    bankCode,
    accountNumber,
  }: ResolveAccountInput): Promise<ResolvedAccount> => {
    const { data } = await axiosPrivate.post<{
      data?: { account_name?: string };
      account_name?: string;
    }>("/seller/bank/resolve", {
      bank_code: bankCode,
      account_number: accountNumber,
    });
    const accountName = (data.data?.account_name ?? data.account_name ?? "")
      .trim()
      .replace(/\s+/g, " ");
    if (!accountName) throw new Error("Account not found");
    return { accountName };
  },

  // POST /file/image-upload { image: base64, filename } returns `upload_id`.
  uploadImage: async (image: {
    base64: string;
    filename: string;
  }): Promise<string> => {
    const { data } = await axiosPrivate.post<{ upload_id: number | string }>(
      "/file/image-upload",
      image,
    );
    return String(data.upload_id);
  },

  // GET /seller/shop-verify-form. Indexes follow the admin form so that
  // unsupported field types (skipped here) do not shift `element_N`.
  getVerificationForm: async (): Promise<VerificationElement[]> => {
    const { data } = await axiosPrivate.get<RawVerificationElement[] | null>(
      "/seller/shop-verify-form",
    );
    const raw = Array.isArray(data) ? data : [];
    const elements: VerificationElement[] = [];
    raw.forEach((element, index) => {
      if (!isFieldType(element.type)) return;
      const options = parseOptions(element.options);
      // A choice field without choices cannot be answered (the web form
      // skips it too).
      const needsOptions = element.type !== "text" && element.type !== "file";
      if (needsOptions && options.length === 0) return;
      elements.push({
        index,
        type: element.type,
        label: element.label?.trim() || `Field ${index + 1}`,
        options,
      });
    });
    return elements;
  },

  // POST /seller/shop-verify-info-store (multipart: element_N and files).
  submitVerification: async (input: {
    elements: VerificationElement[];
    values: VerificationFormValues;
  }): Promise<string> => {
    const form = new FormData();
    for (const element of input.elements) {
      const key = `element_${element.index}`;
      const value = input.values[key];
      if (value === null || value === undefined) continue;

      if (element.type === "file") {
        const file = value as PickedFile;
        // React Native's FormData takes `{ uri, name, type }` for files.
        form.append(key, {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as unknown as Blob);
      } else if (Array.isArray(value)) {
        value.forEach((item) => form.append(`${key}[]`, item));
      } else if (typeof value === "string") {
        form.append(key, value);
      }
    }

    const { data } = await axiosPrivate.post<{ message?: string }>(
      "/seller/shop-verify-info-store",
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.message ?? "Your shop verification request has been submitted.";
  },
};

export default AccountService;
