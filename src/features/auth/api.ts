import { axiosInstance, axiosPrivate } from "~/lib/config/axios";
import { isVendorApp } from "~/lib/config/features";
import { normalizePhone } from "./schemas";
import type {
  ForgotPasswordDTO,
  LoginDTO,
  LoginResponse,
  ResetPasswordDTO,
  Token,
  User,
} from "./types";

// Endpoints are relative to the /api/v2 root (backend: routes/api.php,
// `v2/auth` group, AuthController + PasswordResetController).
const resolveIdentifier = (data: ForgotPasswordDTO) =>
  data.method === "phone" ? normalizePhone(data.identifier) : data.identifier;

const AuthService = {
  // POST /auth/login — `user_type` picks which account table is searched
  // (sellers for the vendor app, customers for the customer app). Failures are
  // HTTP 401 `{ result: false, message }`: "User not found", "Unauthorized"
  // (wrong password), "User is banned", and for sellers "Your seller account
  // is under review. We will notify you once approved.".
  login: async (data: LoginDTO): Promise<Token> => {
    const method = data.method ?? "email";
    const { data: response } = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      {
        login_by: method,
        // The API reads the phone number from the `email` field too.
        email: method === "phone" ? normalizePhone(data.email) : data.email,
        password: data.password,
        user_type: data.userType ?? (isVendorApp ? "seller" : "customer"),
      },
    );
    return { access: response.access_token, userType: response.user?.type };
  },

  logout: async (_data: { token: string }): Promise<void> => {
    await axiosPrivate.get("/auth/logout");
  },

  // POST /auth/password/forget_request — emails (or texts) a 6-digit code.
  // 404 "User is not found" when no account matches. Note: the endpoint is not
  // scoped to a user type, so it also accepts customer accounts.
  forgotPassword: async (data: ForgotPasswordDTO) => {
    const { data: response } = await axiosInstance.post(
      "/auth/password/forget_request",
      { send_code_by: data.method, email_or_phone: resolveIdentifier(data) },
    );
    return response;
  },

  // POST /auth/password/resend_code
  resendResetCode: async (data: ForgotPasswordDTO) => {
    const { data: response } = await axiosInstance.post(
      "/auth/password/resend_code",
      { verify_by: data.method, email_or_phone: resolveIdentifier(data) },
    );
    return response;
  },

  // POST /auth/password/confirm_reset — the account is found by the code alone
  // (HTTP 200 `{ result: false, message: "No user is found" }` when wrong).
  resetPassword: async (data: ResetPasswordDTO) => {
    const { data: response } = await axiosInstance.post(
      "/auth/password/confirm_reset",
      { verification_code: data.code, password: data.password },
    );
    return response;
  },

  // GET /auth/user — the authenticated user row.
  getProfile: async (): Promise<User> => {
    const { data: response } = await axiosPrivate.get<User>("/auth/user");
    return { ...response, full_name: response.name };
  },
};

export default AuthService;
