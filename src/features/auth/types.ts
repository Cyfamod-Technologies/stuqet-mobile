export interface Token {
  access: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

/** Shape returned by GET /auth/me — adjust to match your backend. */
export interface User {
  email: string;
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
