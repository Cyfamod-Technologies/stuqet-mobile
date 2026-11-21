export type SearchParams = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Factory for the common query-key shapes of a REST resource.
 * Add feature-specific keys alongside these as your app grows.
 *
 * Example:
 *   const KEYS = createQueryKeys("posts");
 *   KEYS.all              // ["posts"]
 *   KEYS.table({ page })  // ["posts", { page }]
 *   KEYS.byId("123")      // ["posts", "123"]
 */
const createQueryKeys = <T extends string>(entity: T) => ({
  all: [entity] as const,
  table: (searchParams?: SearchParams) => [entity, searchParams] as const,
  byId: (id: string) => [entity, id] as const,
});

export const QUERY_KEYS = {
  users: {
    me: ["me"] as const,
    ...createQueryKeys("users"),
  },
  // Vendor app (seller API). One namespace per feature; screens and hooks must
  // use these instead of inlining arrays.
  seller: {
    shop: ["seller", "shop"] as const,
    dashboard: ["seller", "dashboard"] as const,
    orders: {
      all: ["seller", "orders"] as const,
      list: (params?: SearchParams) =>
        ["seller", "orders", "list", params] as const,
      detail: (id: string | number) =>
        ["seller", "orders", "detail", String(id)] as const,
    },
    products: {
      all: ["seller", "products"] as const,
      list: (params?: SearchParams) =>
        ["seller", "products", "list", params] as const,
      detail: (id: string | number) =>
        ["seller", "products", "detail", String(id)] as const,
      categories: ["seller", "products", "categories"] as const,
    },
    money: {
      payments: ["seller", "money", "payments"] as const,
      withdrawals: ["seller", "money", "withdrawals"] as const,
      commissions: ["seller", "money", "commissions"] as const,
    },
    verification: ["seller", "verification"] as const,
    account: {
      resolve: (bankCode: string, accountNumber: string) =>
        ["seller", "account", "resolve", bankCode, accountNumber] as const,
    },
    support: {
      tickets: ["seller", "support", "tickets"] as const,
      ticket: (id: string | number) =>
        ["seller", "support", "ticket", String(id)] as const,
    },
    notifications: ["seller", "notifications"] as const,
    messages: {
      all: ["seller", "messages"] as const,
      conversations: ["seller", "messages", "conversations"] as const,
      thread: (id: string | number) =>
        ["seller", "messages", "thread", String(id)] as const,
    },
  },
  appVersion: {
    config: ["appVersion", "config"] as const,
  },
};
