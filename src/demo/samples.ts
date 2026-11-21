import type {
  FoodFormValues,
  ProductFormValues,
} from "~/features/seller-products/schemas";
import type { ServiceFormValues } from "~/features/seller-services/schemas";
import type {
  PayoutValues,
  ShopProfileValues,
} from "~/features/seller-account/schemas";
import type {
  VerificationElement,
  VerificationFormValues,
} from "~/features/seller-account/types";
import type { TicketValues } from "~/features/seller-support/schemas";
import { DEMO_PASSWORD, DEMO_RESET_CODE } from "./data/accounts";
import type { DemoImageKey } from "./images";
import { pickDemoDocument, queueDemoPhotos } from "./picker";

/**
 * Sample values for the "Fill with sample data" chip on every form. Each call
 * returns the next variant, so tapping twice shows different content.
 */

const counters: Record<string, number> = {};

function cycle<T>(name: string, variants: T[]): T {
  const index = counters[name] ?? 0;
  counters[name] = index + 1;
  return variants[index % variants.length];
}

export function productSample(): ProductFormValues {
  const index = counters.product ?? 0;
  queueDemoPhotos(
    ...([
      ["products/backpack", "products/notebooks"],
      ["products/speaker", "products/power-bank"],
      ["products/notebooks", "products/desk-lamp"],
    ][index % 3] as DemoImageKey[]),
  );
  return cycle<ProductFormValues>("product", [
    {
      name: "Laptop sleeve 15 inch",
      category_id: "22",
      unit_price: "6500",
      current_stock: "25",
      unit: "Pcs",
      cash_on_delivery: true,
    },
    {
      name: "Mechanical keyboard",
      category_id: "12",
      unit_price: "28000",
      current_stock: "7",
      unit: "Pc",
      cash_on_delivery: true,
    },
    {
      name: "Scientific calculator",
      category_id: "32",
      unit_price: "7500",
      current_stock: "40",
      unit: "Pcs",
      cash_on_delivery: false,
    },
  ]);
}

export function foodSample(): FoodFormValues {
  const index = counters.food ?? 0;
  queueDemoPhotos(
    ...([
      ["food/jollof-rice", "food/fried-rice-plantain"],
      ["food/suya", "food/meat-pie"],
    ][index % 2] as DemoImageKey[]),
  );
  return cycle<FoodFormValues>("food", [
    {
      name: "Ofada rice and ayamase",
      category_id: "51",
      short_description: "Local ofada rice with spicy green pepper stew",
      delivery_options: ["delivery", "pickup"],
      prep_time_value: "25",
      prep_time_unit: "minutes",
      unit_price: "3000",
      unit: "Plate",
      stock_mode: "limited",
      current_stock: "30",
      availability_mode: "scheduled",
      available_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      time_from: "11:00",
      time_to: "16:00",
      sold_out: false,
    },
    {
      name: "Peppered snail",
      category_id: "54",
      short_description: "Spicy grilled snail, a campus favourite",
      delivery_options: ["delivery", "pickup", "dine_in"],
      prep_time_value: "15",
      prep_time_unit: "minutes",
      unit_price: "2500",
      unit: "Pack",
      stock_mode: "unlimited",
      current_stock: "",
      availability_mode: "always",
      available_days: [],
      time_from: "",
      time_to: "",
      sold_out: false,
    },
  ]);
}

export function serviceSample(): ServiceFormValues {
  const index = counters.service ?? 0;
  queueDemoPhotos(
    ...([
      ["services/laptop-repair", "services/printing"],
      ["services/tutoring", "services/photography"],
    ][index % 2] as DemoImageKey[]),
  );
  return cycle<ServiceFormValues>("service", [
    {
      name: "Phone screen replacement",
      service_type: "repair_maintenance",
      category_id: "61",
      description:
        "Same-day screen replacement for iPhone and Android phones, with a 30-day warranty.",
      pricing_type: "fixed_price",
      unit_price: "15000",
      slot_mode: "limited",
      current_stock: "10",
      location: "Shop 12, Akoka Plaza, Lagos",
      service_area: "Akoka and Yaba",
    },
    {
      name: "CV writing and review",
      service_type: "consultation",
      category_id: "62",
      description: "A one-hour session to write or polish your CV.",
      pricing_type: "hourly_rate",
      unit_price: "4000",
      slot_mode: "unlimited",
      current_stock: "",
      location: "Online",
      service_area: "Anywhere in Nigeria",
    },
  ]);
}

export function shopProfileSample(): ShopProfileValues {
  return cycle<ShopProfileValues>("shop", [
    {
      name: "Campus Mart Express",
      phone: "0803 123 4567",
      address: "Block B, Shop 4, Yaba Tech Plaza, Lagos",
    },
    {
      name: "Campus Mart",
      phone: "08031234567",
      address: "Shop 12, Akoka Plaza, Akoka, Lagos",
    },
  ]);
}

/** Bank details; the account name is filled in by the fake bank lookup. */
export function payoutSample(): PayoutValues {
  return cycle<PayoutValues>("payout", [
    {
      cash_on_delivery_status: true,
      bank_payment_status: true,
      bank_name: "Zenith Bank",
      bank_acc_name: "",
      bank_acc_no: "2054781236",
      bank_routing_no: "057",
    },
    {
      cash_on_delivery_status: false,
      bank_payment_status: true,
      bank_name: "GTBank",
      bank_acc_name: "",
      bank_acc_no: "0123456789",
      bank_routing_no: "058",
    },
  ]);
}

export function withdrawSample(): { amount: string; message: string } {
  return cycle("withdraw", [
    { amount: "10000", message: "Weekly payout" },
    { amount: "25000", message: "Restocking money" },
  ]);
}

export function replySample(): string {
  return cycle("reply", [
    "Your order is packed. Riders collect at 3 pm today.",
    "Yes, it is available. Would you like me to hold one for you?",
    "Thanks for your patience. I will confirm the delivery time shortly.",
  ]);
}

export function ticketSample(): TicketValues {
  return cycle<TicketValues>("ticket", [
    {
      subject: "Customer paid but the order shows unpaid",
      details:
        "A customer says they paid by transfer for order 20261121-12345678 but it still shows as unpaid. Please confirm the payment.",
    },
    {
      subject: "My shop banner will not update",
      details:
        "I replaced my banners in Shop settings but the old image still shows on my storefront.",
    },
  ]);
}

/** Answers for the admin-configured verification form. */
export function verificationSample(
  elements: VerificationElement[],
): VerificationFormValues {
  const values: VerificationFormValues = {};
  for (const element of elements) {
    const key = `element_${element.index}`;
    switch (element.type) {
      case "file":
        values[key] = pickDemoDocument();
        break;
      case "multi_select":
        values[key] = element.options.slice(0, 2);
        break;
      case "select":
      case "radio":
        values[key] = element.options[0] ?? "";
        break;
      default:
        values[key] = "RC 1840216";
    }
  }
  return values;
}

export const authSample = {
  /** Sign-in with the products and food demo shop. */
  email: "shop@campusmart.com",
  phone: "0803 123 4567",
  password: DEMO_PASSWORD,
  resetCode: DEMO_RESET_CODE,
  newPassword: "NewPass@123",
};
