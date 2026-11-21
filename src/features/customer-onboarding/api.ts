import { axiosInstance } from "~/lib/config/axios";
import type { IdentifierMethod } from "~/features/auth/types";
import { normalizePhone } from "~/features/auth/schemas";

export interface SignupInput {
  name: string;
  method: IdentifierMethod;
  /** Email address, or the phone number (without spaces) when `method` is phone. */
  contact: string;
  password: string;
}

const value = (method: IdentifierMethod, contact: string) =>
  method === "phone" ? normalizePhone(contact) : contact.trim();

const OnboardingService = {
  // TODO(backend): the approved design verifies the email or phone BEFORE the
  // account exists ("Verify your email before you create the account"). The
  // real `auth/resend_code` and `auth/confirm_code` need a signed-in user, so
  // this is the proposed pre-signup pair: POST /auth/verify-contact/send and
  // /auth/verify-contact/confirm with { method, value, code }.
  sendCode: async (
    method: IdentifierMethod,
    contact: string,
  ): Promise<void> => {
    await axiosInstance.post("/auth/verify-contact/send", {
      method,
      value: value(method, contact),
    });
  },

  confirmCode: async (
    method: IdentifierMethod,
    contact: string,
    code: string,
  ): Promise<void> => {
    await axiosInstance.post("/auth/verify-contact/confirm", {
      method,
      value: value(method, contact),
      code,
    });
  },

  // POST /auth/signup (AuthController::signup): name, email_or_phone,
  // register_by, password + password_confirmation. Failures arrive as
  // HTTP 200 `{ result: false, message: [...] }`, which axios.ts rejects.
  signup: async (input: SignupInput): Promise<void> => {
    await axiosInstance.post("/auth/signup", {
      name: input.name.trim(),
      email_or_phone: value(input.method, input.contact),
      register_by: input.method,
      password: input.password,
      password_confirmation: input.password,
    });
  },
};

export default OnboardingService;
