export interface Token {
  access: string;
  /** Account type from the login response (`customer`, `delivery_boy`, `seller`). */
  userType?: string;
}

/** How a person identifies themselves: the backend accepts email or phone. */
export type IdentifierMethod = "email" | "phone";

export interface LoginDTO {
  /** Email address, or phone number when `method` is "phone". */
  email: string;
  password: string;
  /** Defaults to "email". Phone login is offered in the vendor app only. */
  method?: IdentifierMethod;
  /** Vendor "Remember me" choice (persisted for the next cold start). */
  remember?: boolean;
  /** Overrides the account table searched: the customer app tries `customer`, then `delivery_boy`. */
  userType?: "customer" | "delivery_boy";
}

/** Shape returned by GET /auth/user (the authenticated `User` row). */
export interface User {
  id?: number;
  email: string | null;
  name?: string;
  phone?: string | null;
  /** Alias of `name`, kept for the customer settings screen. */
  full_name?: string;
}

/** Response of POST /auth/login (Sanctum bearer token; it does not expire). */
export interface LoginResponse {
  result: boolean;
  message: string;
  access_token: string;
  user: {
    id: number;
    type: string;
    name: string;
    email: string;
    avatar: string | null;
    phone: string | null;
    email_verified: boolean;
  };
}

/** POST /auth/password/forget_request and /auth/password/resend_code. */
export interface ForgotPasswordDTO {
  /** Email address or phone number, matching `method`. */
  identifier: string;
  method: IdentifierMethod;
}

/** POST /auth/password/confirm_reset. The backend looks the account up by the
 * emailed code alone, so no identifier is sent. */
export interface ResetPasswordDTO {
  code: string;
  password: string;
}

/** Outcome of a failed login, derived from the backend's 401 message. */
export type LoginFailure =
  "suspended" | "under-review" | "invalid-credentials" | "other";
