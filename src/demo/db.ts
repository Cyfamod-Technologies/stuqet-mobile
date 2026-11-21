import { naira } from "./format";
import { demoImage } from "./images";
import { buildListings } from "./data/catalogue";
import { buildOrders, orderTotal } from "./data/orders";
import { buildConversations } from "./data/messages";
import { buildNotifications } from "./data/notifications";
import {
  buildCommissions,
  buildPayments,
  buildWithdrawals,
} from "./data/money";
import { buildTickets } from "./data/support";
import { SHOP_SEEDS, packageExpiry } from "./data/shops";
import type { ShopInfo } from "~/features/seller-shop/types";
import type { DemoDataSet, DemoDb, DemoShopKind } from "./types";

/** Seed uploads the shops' logos and banners point at. */
const SEED_UPLOADS: [number, string][] = [
  [9001, demoImage("shop/logo")],
  [9101, demoImage("shop/banner-1")],
  [9102, demoImage("shop/banner-2")],
  [9103, demoImage("shop/banner-3")],
];

/** The empty shop the "Under review" account becomes once approved. */
const FRESH_SHOP: ShopInfo = {
  id: 304,
  user_id: 4024,
  name: "Sade's Store",
  title: null,
  description: null,
  logo: "",
  upload_id: null,
  sliders: [],
  sliders_id: null,
  address: null,
  phone: "08074567890",
  email: "review@stuqet.com",
  rating: 0,
  verified: false,
  is_submitted_form: false,
  verify_text: "Not verified",
  package_invalid_at: "",
  product_upload_limit: 20,
  seller_package: "Starter",
  admin_to_pay: "₦0.00",
  cash_on_delivery_status: 0,
  bank_payment_status: 0,
  bank_name: null,
  bank_acc_name: null,
  bank_acc_no: null,
  bank_routing_no: null,
  products: 0,
  orders: 0,
  sales: "₦0.00",
  business_category: "product",
};

const databases = new Map<DemoDataSet, DemoDb>();

function createDb(set: DemoDataSet): DemoDb {
  const now = new Date();
  const kind: DemoShopKind = set === "fresh" ? "product" : set;
  const fresh = set === "fresh";

  const listings = fresh ? [] : buildListings(kind);
  const orders = fresh ? [] : buildOrders(kind, now, listings);
  const seed = SHOP_SEEDS[kind];

  const { balance: seedBalance, ...shopSeed } = seed;
  const shop: ShopInfo = fresh
    ? { ...FRESH_SHOP }
    : {
        ...shopSeed,
        products: 0,
        orders: 0,
        sales: "",
        admin_to_pay: "",
        package_invalid_at: "",
      };

  const db: DemoDb = {
    kind,
    now,
    shop,
    balance: fresh ? 0 : seedBalance,
    listings,
    orders,
    conversations: fresh ? [] : buildConversations(kind, now),
    notifications: fresh ? [] : buildNotifications(now, orders),
    payments: fresh ? [] : buildPayments(now),
    withdrawals: fresh ? [] : buildWithdrawals(now),
    commissions: fresh ? [] : buildCommissions(orders),
    tickets: fresh ? [] : buildTickets(now),
    verification: {
      submitted: shop.is_submitted_form,
      verified: shop.verified,
    },
    uploads: new Map(SEED_UPLOADS),
    next: {
      listing: 1000,
      order: 6000,
      upload: 9200,
      message: 500,
      ticket: 70,
      ticketMessage: 100,
      withdrawal: 2100,
    },
  };
  refreshShop(db);
  return db;
}

/** Recomputes the fields of the shop that depend on other data. */
export function refreshShop(db: DemoDb): ShopInfo {
  const paid = db.orders.filter((o) => o.paymentStatus === "paid");
  db.shop.products = db.listings.length;
  db.shop.orders = db.orders.filter(
    (o) => o.deliveryStatus === "delivered",
  ).length;
  db.shop.sales = naira(paid.reduce((sum, o) => sum + orderTotal(o), 0));
  db.shop.admin_to_pay = naira(db.balance);
  db.shop.package_invalid_at = packageExpiry(db.now);
  return db.shop;
}

export function getDb(set: DemoDataSet): DemoDb {
  let db = databases.get(set);
  if (!db) {
    db = createDb(set);
    databases.set(set, db);
  }
  return db;
}

/** Throws every change away; the next request rebuilds the sample data. */
export function resetDemoData(): void {
  databases.clear();
}
