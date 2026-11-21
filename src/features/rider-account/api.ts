import { axiosPrivate } from "~/lib/config/axios";
import type { AppNotification } from "~/features/customer-orders/types";
import type {
  BankOption,
  BankResolution,
  RiderApplication,
  RiderPayout,
  RiderProfile,
} from "./types";

// TODO(backend): rider onboarding and account. The backend only has delivery
// boys created by an admin (`delivery-boy/*` for deliveries and earnings). The
// approved design lets a person apply from the app, so these are proposed:
//   POST /delivery-boy/apply                 -> RiderApplication (profile, vehicle, documents, payout); status `pending`
//   GET  /delivery-boy/application           -> { status: "none" | "pending" | "approved" }
//   GET  /delivery-boy/profile               -> RiderProfile
//   GET  /delivery-boy/banks                 -> { data: BankOption[] }
//   POST /delivery-boy/bank/resolve          -> { accountName }  (404 when not found)
//   POST /delivery-boy/payout                -> RiderPayout
//   GET  /delivery-boy/notifications, POST /delivery-boy/notifications/read
// Documents and the profile photo are sent as uploaded file names (the upload
// endpoint, `file/upload`, is not wired for riders yet).

const RiderService = {
  profile: async (): Promise<RiderProfile> =>
    (await axiosPrivate.get<RiderProfile>("/delivery-boy/profile")).data,

  apply: async (input: RiderApplication): Promise<void> => {
    await axiosPrivate.post("/delivery-boy/apply", input);
  },

  applicationStatus: async (): Promise<"none" | "pending" | "approved"> =>
    (
      await axiosPrivate.get<{ status: "none" | "pending" | "approved" }>(
        "/delivery-boy/application",
      )
    ).data.status,

  banks: async (): Promise<BankOption[]> =>
    (await axiosPrivate.get<{ data: BankOption[] }>("/delivery-boy/banks")).data
      .data,

  resolveAccount: async (
    bankCode: string,
    accountNumber: string,
  ): Promise<BankResolution> =>
    (
      await axiosPrivate.post<BankResolution>("/delivery-boy/bank/resolve", {
        bankCode,
        accountNumber,
      })
    ).data,

  savePayout: async (payout: RiderPayout): Promise<void> => {
    await axiosPrivate.post("/delivery-boy/payout", payout);
  },

  notifications: async (): Promise<AppNotification[]> =>
    (
      await axiosPrivate.get<{ data: AppNotification[] }>(
        "/delivery-boy/notifications",
      )
    ).data.data,

  markNotificationsRead: async (): Promise<void> => {
    await axiosPrivate.post("/delivery-boy/notifications/read");
  },
};

export default RiderService;
