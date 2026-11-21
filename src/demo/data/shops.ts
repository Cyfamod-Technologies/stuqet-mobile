import type { ShopInfo } from "~/features/seller-shop/types";
import { demoImage } from "../images";
import { dmy } from "../format";
import type { DemoShopKind } from "../types";

type ShopSeed = Omit<
  ShopInfo,
  "products" | "orders" | "sales" | "admin_to_pay" | "package_invalid_at"
> & { balance: number };

const SELLER_IMAGES = {
  logo: demoImage("shop/logo"),
  banners: [
    demoImage("shop/banner-1"),
    demoImage("shop/banner-2"),
    demoImage("shop/banner-3"),
  ],
};

export const SHOP_SEEDS: Record<DemoShopKind, ShopSeed> = {
  product: {
    id: 301,
    user_id: 4021,
    name: "Campus Mart",
    title: "Campus Mart | Gadgets, bags and campus food",
    description:
      "Everything for hostel life: gadgets, bags, stationery and hot food, delivered to your block.",
    logo: SELLER_IMAGES.logo,
    upload_id: "9001",
    sliders: SELLER_IMAGES.banners,
    sliders_id: "9101,9102,9103",
    address: "Shop 12, Akoka Plaza, Akoka, Lagos",
    phone: "08031234567",
    email: "shop@campusmart.com",
    rating: 4.6,
    verified: false,
    is_submitted_form: false,
    verify_text: "Not verified",
    product_upload_limit: 50,
    seller_package: "Growth",
    cash_on_delivery_status: 1,
    bank_payment_status: 1,
    bank_name: "Access Bank",
    bank_acc_name: "CAMPUS MART LTD",
    bank_acc_no: "0123456789",
    bank_routing_no: "044",
    business_category: "product",
    balance: 86400,
  },
  food: {
    id: 302,
    user_id: 4022,
    name: "Mama Ngozi's Kitchen",
    title: "Mama Ngozi's Kitchen | Home-style Nigerian food",
    description: "Jollof, soups, suya and snacks cooked fresh every morning.",
    logo: demoImage("shop/logo-kitchen"),
    upload_id: "9004",
    sliders: [demoImage("shop/banner-3")],
    sliders_id: "9103",
    address: "14 Moremi Road, Akoka, Lagos",
    phone: "08052345678",
    email: "kitchen@mamangozi.com",
    rating: 4.8,
    verified: true,
    is_submitted_form: true,
    verify_text: "Verified",
    product_upload_limit: 30,
    seller_package: "Starter",
    cash_on_delivery_status: 1,
    bank_payment_status: 1,
    bank_name: "GTBank",
    bank_acc_name: "NGOZI EZE",
    bank_acc_no: "0456789123",
    bank_routing_no: "058",
    business_category: "food",
    balance: 34200,
  },
  service: {
    id: 303,
    user_id: 4023,
    name: "Campus Fix-It",
    title: "Campus Fix-It | Repairs, lessons and more",
    description:
      "Laptop repairs, tutoring, photography, printing and laundry for students.",
    logo: demoImage("shop/logo-fixit"),
    upload_id: "9005",
    sliders: [demoImage("shop/banner-2")],
    sliders_id: "9102",
    address: "Shop 12, Akoka Plaza, Akoka, Lagos",
    phone: "08063456789",
    email: "hello@campusfixit.com",
    rating: 4.4,
    verified: false,
    is_submitted_form: true,
    verify_text: "Pending review",
    product_upload_limit: 20,
    seller_package: "Starter",
    cash_on_delivery_status: 0,
    bank_payment_status: 1,
    bank_name: "Opay",
    bank_acc_name: "BOLA ADEYEMI",
    bank_acc_no: "8063456789",
    bank_routing_no: "999992",
    business_category: "service",
    balance: 18000,
  },
};

/** Packages renew a year after the demo starts. */
export function packageExpiry(now: Date): string {
  const next = new Date(now);
  next.setFullYear(next.getFullYear() + 1);
  return dmy(next);
}
