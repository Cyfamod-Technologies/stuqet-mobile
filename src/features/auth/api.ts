import { axiosInstance, axiosPrivate } from "~/lib/config/axios";
import { isVendorApp } from "~/lib/config/features";
import type { Token, LoginDTO, LoginResponse, User } from "./types";

// TODO: Align these endpoints with your backend's auth API.
const AuthService = {
  // POST /auth/login — `user_type` picks which account table is searched
  // (sellers for the vendor app, customers for the customer app).
  login: async (data: LoginDTO): Promise<Token> => {
    const { data: response } = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      {
        login_by: "email",
        email: data.email,
        password: data.password,
        user_type: isVendorApp ? "seller" : "customer",
      },
    );
    return { access: response.access_token };
  },

  logout: async (_data: { token: string }): Promise<void> => {
    await axiosPrivate.get("/auth/logout");
  },

  forgotPassword: async (data: { email: string }) => {
    const { data: response } = await axiosInstance.post(
      "/auth/forgot-password",
      data,
    );
    return response;
  },

  resetPassword: async (data: {
    otp: string;
    password: string;
    rePassword: string;
  }) => {
    const { data: response } = await axiosInstance.post(
      "/auth/confirm-password",
      data,
    );
    return response;
  },

  getProfile: async (): Promise<User> => {
    const { data: response } = await axiosPrivate.get<User>("/auth/me");
    return response;
  },
};

export default AuthService;
