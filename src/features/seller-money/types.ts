/** Laravel paginated resource collection (`->paginate(10)`). */
export interface LaravelPage<T> {
  data: T[];
  links?: { next: string | null };
  meta?: { current_page: number; last_page: number; total: number };
}

/** One row of GET /seller/payment-history (SellerPaymentResource). */
export interface PaymentItem {
  id: number;
  /** Formatted money string, e.g. "₦40,000.00". */
  amount: string;
  /** Already composed by the API, e.g. "Bank payment TRX ID:88213". */
  payment_method: string;
  /** `d-m-Y`. */
  payment_date: string;
}

/** One row of GET /seller/withdraw-request (SellerWithdrawResource). */
export interface WithdrawalItem {
  id: number;
  amount: string;
  /** Translated label: "Pending" or "Paid". */
  status: string;
  /** `d-m-Y`. */
  created_at: string;
}

/** One row of GET /seller/commission-list (CommissionHistoryResource). */
export interface CommissionItem {
  id: number;
  order_code: string;
  /** Raw number (not formatted): the commission taken by the platform. */
  admin_commission: number | string;
  /** Formatted money string: what the seller earned on the order. */
  seller_earning: string;
  /** `d-m-Y`. */
  created_at: string;
}

export interface WithdrawPayload {
  amount: number;
  message?: string;
}

/** Business settings the Money screens care about (all optional). */
export interface MoneySettings {
  /** `minimum_seller_amount_withdraw`. */
  minimumWithdraw: number | null;
  /** Fixed commission rate in percent, only when the platform uses one. */
  fixedCommissionRate: number | null;
}
