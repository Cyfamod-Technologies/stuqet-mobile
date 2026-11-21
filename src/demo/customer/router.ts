import type { DemoPersona } from "./types";

/** What a handler returns; the adapter turns it into an axios response. */
export interface DemoResult {
  status?: number;
  data: unknown;
}

export interface DemoRequest {
  method: string;
  /** Path after /api/v2, without the query string. */
  path: string;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  /** Signed-in persona, or null without a valid demo token. */
  persona: DemoPersona | null;
}

export type Handler = (request: DemoRequest, params: string[]) => DemoResult;

interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
  /** Public routes work without a session. */
  public: boolean;
}

const routes: Route[] = [];

export function on(
  method: "GET" | "POST" | "DELETE",
  pattern: RegExp,
  handler: Handler,
  isPublic = false,
) {
  routes.push({ method, pattern, handler, public: isPublic });
}

export function resolveRoute(method: string, path: string) {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(path);
    if (match) return { route, params: match.slice(1) };
  }
  return null;
}

export const ok = (data: unknown = {}): DemoResult => ({ data });
export const message = (text: string): DemoResult => ({
  data: { result: true, message: text },
});
/** HTTP 200 `{ result: false }`, which axios.ts turns into a rejection. */
export const refuse = (text: string): DemoResult => ({
  data: { result: false, message: text },
});
export const fail = (
  status: number,
  text: string,
  extra: object = {},
): DemoResult => ({
  status,
  data: { result: false, message: text, ...extra },
});

const PREFIX = "demo-customer:";

export function tokenFor(persona: DemoPersona): string {
  return `${PREFIX}${persona}`;
}

export function personaFromToken(token: string | null): DemoPersona | null {
  if (!token?.startsWith(PREFIX)) return null;
  const persona = token.slice(PREFIX.length);
  return persona === "customer" ||
    persona === "newbie" ||
    persona === "rider" ||
    persona === "riderReview"
    ? persona
    : null;
}

export const asString = (value: unknown): string =>
  typeof value === "string" ? value : value == null ? "" : String(value);

export const asNumber = (value: unknown): number => Number(value) || 0;

export function paginate<T>(
  rows: T[],
  query: DemoRequest["query"],
  perPage = 10,
) {
  const page = Math.max(1, asNumber(query.page) || 1);
  const lastPage = Math.max(1, Math.ceil(rows.length / perPage));
  return {
    data: rows.slice((page - 1) * perPage, page * perPage),
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total: rows.length,
    },
    links: { next: page < lastPage ? `?page=${page + 1}` : null },
  };
}
