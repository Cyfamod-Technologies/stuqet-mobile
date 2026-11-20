import { axiosPrivate } from "~/lib/config/axios";
import type {
  CommissionItem,
  LaravelPage,
  MoneySettings,
  PaymentItem,
  WithdrawalItem,
  WithdrawPayload,
} from "./types";

interface BusinessSettingRow {
  type: string;
  value: string | null;
}

const SETTING_KEYS = [
  "minimum_seller_amount_withdraw",
  "vendor_commission_activation",
  "seller_commission_type",
  "vendor_commission",
];

function toNumberOrNull(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const MoneyService = {
  // GET /seller/payment-history?page=
  getPayments: async (page: number): Promise<LaravelPage<PaymentItem>> => {
    const { data } = await axiosPrivate.get<LaravelPage<PaymentItem>>(
      "/seller/payment-history",
      { params: { page } },
    );
    return data;
  },

  // GET /seller/withdraw-request?page=
  getWithdrawals: async (
    page: number,
  ): Promise<LaravelPage<WithdrawalItem>> => {
    const { data } = await axiosPrivate.get<LaravelPage<WithdrawalItem>>(
      "/seller/withdraw-request",
      { params: { page } },
    );
    return data;
  },

  // GET /seller/commission-list?page=
  getCommissions: async (
    page: number,
  ): Promise<LaravelPage<CommissionItem>> => {
    const { data } = await axiosPrivate.get<LaravelPage<CommissionItem>>(
      "/seller/commission-list",
      { params: { page } },
    );
    return data;
  },

  // POST /seller/withdraw-request/store. Failures come back as HTTP 200
  // `{ result: false, message }` and are turned into rejections by axios.ts.
  requestWithdrawal: async (payload: WithdrawPayload): Promise<string> => {
    const { data } = await axiosPrivate.post<{ message?: string }>(
      "/seller/withdraw-request/store",
      payload,
    );
    return data.message ?? "Request has been sent successfully";
  },

  // POST /business-settings { keys } returns the raw rows `{ type, value }`.
  getSettings: async (): Promise<MoneySettings> => {
    const { data } = await axiosPrivate.post<BusinessSettingRow[]>(
      "/business-settings",
      { keys: SETTING_KEYS.join(",") },
    );
    const rows = Array.isArray(data) ? data : [];
    const get = (type: string) => rows.find((row) => row.type === type)?.value;

    const commissionActive = get("vendor_commission_activation") === "1";
    const fixed = get("seller_commission_type") === "fixed_rate";

    return {
      minimumWithdraw: toNumberOrNull(get("minimum_seller_amount_withdraw")),
      fixedCommissionRate:
        commissionActive && fixed
          ? toNumberOrNull(get("vendor_commission"))
          : null,
    };
  },
};

export default MoneyService;
