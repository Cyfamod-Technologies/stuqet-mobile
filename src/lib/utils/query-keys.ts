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
  // Customer + rider app. One namespace per feature, like `seller` above.
  customer: {
    home: ["customer", "home"] as const,
    categories: ["customer", "categories"] as const,
    menu: (vendorId: number) => ["customer", "menu", vendorId] as const,
    dish: (id: number) => ["customer", "dish", id] as const,
    search: (params: object) => ["customer", "search", params] as const,
    trending: ["customer", "trending"] as const,
    cart: ["customer", "cart"] as const,
    checkout: (params: object) => ["customer", "checkout", params] as const,
    addresses: ["customer", "addresses"] as const,
    states: ["customer", "states"] as const,
    cities: (stateId: number) => ["customer", "cities", stateId] as const,
    areas: (cityId: number) => ["customer", "areas", cityId] as const,
    schools: (search: string) => ["customer", "schools", search] as const,
    profile: ["customer", "profile"] as const,
    orders: {
      all: ["customer", "orders"] as const,
      list: (tab: string) => ["customer", "orders", "list", tab] as const,
      detail: (id: number) => ["customer", "orders", "detail", id] as const,
      tracking: (id: number) => ["customer", "orders", "tracking", id] as const,
      chat: (id: number) => ["customer", "orders", "chat", id] as const,
    },
    notifications: ["customer", "notifications"] as const,
  },
  rider: {
    dashboard: ["rider", "dashboard"] as const,
    deliveries: {
      all: ["rider", "deliveries"] as const,
      list: (tab: string) => ["rider", "deliveries", "list", tab] as const,
      detail: (id: number) => ["rider", "deliveries", "detail", id] as const,
    },
    earnings: {
      summary: ["rider", "earnings", "summary"] as const,
      rows: (kind: string) => ["rider", "earnings", "rows", kind] as const,
    },
    profile: ["rider", "profile"] as const,
    application: ["rider", "application"] as const,
    banks: ["rider", "banks"] as const,
    notifications: ["rider", "notifications"] as const,
  },
  appVersion: {
    config: ["appVersion", "config"] as const,
  },
};
