import type { DemoImageKey } from "../images";
import { demoImage } from "../images";
import type { DemoListing, DemoShopKind } from "../types";
import type { FoodMeta, ServiceMeta } from "~/features/seller-products/types";

type Seed = {
  name: string;
  image: DemoImageKey;
  price: number;
  category: number;
  stock?: number;
  unit?: string;
  published?: boolean;
  featured?: boolean;
  approved?: boolean;
  description?: string;
  food?: FoodMeta;
  service?: ServiceMeta;
};

const ALWAYS: FoodMeta = {
  availability_mode: "always",
  stock_mode: "unlimited",
  delivery_options: ["delivery", "pickup"],
  prep_time_value: 20,
  prep_time_unit: "minutes",
  auto_time_based: false,
  auto_stock_based: false,
  manual_override: "auto",
};

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

function food(extra: FoodMeta): FoodMeta {
  return { ...ALWAYS, ...extra };
}

// ---------------------------------------------------------------------------
// Products (Campus Mart): 14 rows so the list paginates (10 per page).
// ---------------------------------------------------------------------------

const PRODUCTS: Seed[] = [
  {
    name: "Wireless earbuds",
    image: "products/wireless-earbuds",
    price: 3000,
    category: 12,
    stock: 12,
    featured: true,
    description: "Bluetooth 5.3 earbuds with a pocket charging case.",
  },
  {
    name: "Phone case, orange",
    image: "products/phone-case",
    price: 1500,
    category: 11,
    stock: 40,
    description: "Shock-proof case for iPhone 13.",
  },
  {
    name: "Orange canvas sneakers",
    image: "products/sneakers",
    price: 18500,
    category: 21,
    stock: 8,
    description: "Everyday canvas sneakers, sizes 40 to 45.",
  },
  {
    name: "Campus backpack",
    image: "products/backpack",
    price: 12000,
    category: 22,
    stock: 15,
    featured: true,
    description: "Water-resistant 25 litre backpack with a laptop sleeve.",
  },
  {
    name: "Power bank 20000mAh",
    image: "products/power-bank",
    price: 9500,
    category: 13,
    stock: 0,
    description: "Fast-charging power bank with three outputs.",
  },
  {
    name: "Notebook set, 3 pack",
    image: "products/notebooks",
    price: 2800,
    category: 31,
    stock: 60,
    description: "A5 ruled notebooks, 80 pages each.",
  },
  {
    name: "LED desk lamp",
    image: "products/desk-lamp",
    price: 6800,
    category: 41,
    stock: 9,
    published: false,
    description: "Dimmable reading lamp with a USB port.",
  },
  {
    name: "Bluetooth speaker",
    image: "products/speaker",
    price: 15000,
    category: 12,
    stock: 6,
    approved: false,
    description: "Portable speaker, 12 hours of playtime.",
  },
  {
    name: "Stuqet hoodie",
    image: "products/hoodie",
    price: 12500,
    category: 23,
    stock: 22,
    featured: true,
    description: "Heavyweight cotton hoodie in brand orange.",
  },
  {
    name: "Water bottle 750ml",
    image: "products/water-bottle",
    price: 4200,
    category: 42,
    stock: 30,
    description: "Insulated bottle, keeps drinks cold for 12 hours.",
  },
  {
    name: "Wireless earbuds Pro",
    image: "products/wireless-earbuds",
    price: 8500,
    category: 12,
    stock: 4,
    description: "Noise-cancelling earbuds.",
  },
  {
    name: "Phone case, clear",
    image: "products/phone-case",
    price: 1200,
    category: 11,
    stock: 55,
  },
  {
    name: "Stuqet hoodie, grey",
    image: "products/hoodie",
    price: 12500,
    category: 23,
    stock: 11,
  },
  {
    name: "Mini backpack",
    image: "products/backpack",
    price: 8000,
    category: 22,
    stock: 18,
  },
];

// ---------------------------------------------------------------------------
// Food. Campus Mart sells a few dishes; Mama Ngozi's Kitchen is food only.
// ---------------------------------------------------------------------------

const CAMPUS_FOOD: Seed[] = [
  {
    name: "Jollof rice and chicken",
    image: "food/jollof-rice",
    price: 2500,
    category: 51,
    unit: "plate",
    stock: 100,
    description: "Smoky party jollof with a grilled chicken drumstick.",
    food: food({
      short_description: "Smoky party jollof with grilled chicken",
    }),
  },
  {
    name: "Pounded yam and egusi",
    image: "food/pounded-yam-egusi",
    price: 3200,
    category: 52,
    unit: "plate",
    stock: 6,
    description: "Fresh pounded yam with egusi soup and assorted meat.",
    food: food({
      short_description: "Pounded yam, egusi soup and assorted meat",
      availability_mode: "scheduled",
      available_days: [...WEEKDAYS],
      time_slots: [{ start: "12:00", end: "15:00" }],
      stock_mode: "limited",
      auto_time_based: true,
      auto_stock_based: true,
      prep_time_value: 35,
    }),
  },
  {
    name: "Fried rice and plantain",
    image: "food/fried-rice-plantain",
    price: 2800,
    category: 51,
    unit: "plate",
    stock: 0,
    description: "Vegetable fried rice with sweet fried plantain.",
    food: food({
      short_description: "Vegetable fried rice with fried plantain",
      stock_mode: "limited",
      auto_stock_based: true,
    }),
  },
  {
    name: "Chicken suya",
    image: "food/suya",
    price: 2000,
    category: 53,
    unit: "stick",
    stock: 80,
    description: "Spicy grilled suya with sliced onions.",
    food: food({ short_description: "Spicy grilled suya skewers" }),
  },
  {
    name: "Chicken shawarma",
    image: "food/shawarma",
    price: 3500,
    category: 54,
    unit: "wrap",
    stock: 40,
    description: "Loaded chicken shawarma wrap.",
    food: food({
      short_description: "Loaded chicken shawarma",
      delivery_options: ["delivery", "pickup", "dine_in"],
    }),
  },
  {
    name: "Puff puff (10 pieces)",
    image: "food/puff-puff",
    price: 1200,
    category: 54,
    unit: "pack",
    stock: 50,
    published: false,
    food: food({ short_description: "Golden fried puff puff" }),
  },
  {
    name: "Strawberry smoothie",
    image: "food/smoothie",
    price: 1800,
    category: 55,
    unit: "cup",
    stock: 25,
    food: food({
      short_description: "Fresh strawberry and yoghurt smoothie",
      delivery_options: ["pickup", "dine_in"],
      prep_time_value: 10,
    }),
  },
  {
    name: "Meat pie",
    image: "food/meat-pie",
    price: 1000,
    category: 54,
    unit: "piece",
    stock: 70,
    food: food({
      short_description: "Flaky meat pie",
      manual_override: "sold_out",
    }),
  },
];

const KITCHEN_FOOD: Seed[] = [
  ...CAMPUS_FOOD.slice(0, 5),
  {
    name: "Jollof rice, family tray",
    image: "food/jollof-rice",
    price: 14000,
    category: 51,
    unit: "tray",
    stock: 10,
    food: food({
      short_description: "Feeds four. Order a day ahead.",
      stock_mode: "limited",
      auto_stock_based: true,
      prep_time_value: 2,
      prep_time_unit: "hours",
    }),
  },
  ...CAMPUS_FOOD.slice(5),
  {
    name: "Beef suya, large",
    image: "food/suya",
    price: 3500,
    category: 53,
    unit: "pack",
    stock: 30,
    food: food({ short_description: "Large beef suya with yaji spice" }),
  },
  {
    name: "Chicken pie",
    image: "food/meat-pie",
    price: 1200,
    category: 54,
    unit: "piece",
    stock: 35,
    food: food({ short_description: "Creamy chicken pie" }),
  },
  {
    name: "Mango smoothie",
    image: "food/smoothie",
    price: 1800,
    category: 55,
    unit: "cup",
    stock: 20,
    food: food({ short_description: "Chilled mango smoothie" }),
  },
];

// ---------------------------------------------------------------------------
// Services (Campus Fix-It)
// ---------------------------------------------------------------------------

const SERVICES: Seed[] = [
  {
    name: "Laptop repair and diagnosis",
    image: "services/laptop-repair",
    price: 5000,
    category: 61,
    description: "Screen, battery, keyboard and software faults fixed.",
    service: {
      service_type: "repair_maintenance",
      pricing_type: "fixed_price",
      location: "Shop 12, Akoka Plaza, Lagos",
      service_area: "Akoka, Yaba and Surulere",
      slot_mode: "limited",
    },
  },
  {
    name: "Maths and physics tutoring",
    image: "services/tutoring",
    price: 3500,
    category: 62,
    description: "One-on-one tutoring for first and second year students.",
    service: {
      service_type: "training_coaching",
      pricing_type: "hourly_rate",
      location: "Online or on campus",
      service_area: "UNILAG campus",
      slot_mode: "limited",
    },
  },
  {
    name: "Event photography",
    image: "services/photography",
    price: 45000,
    category: 63,
    description: "Half-day coverage with 100 edited photos.",
    service: {
      service_type: "one_time",
      pricing_type: "custom_quote",
      location: "Travels to you",
      service_area: "Lagos mainland",
      slot_mode: "limited",
    },
  },
  {
    name: "Document printing and binding",
    image: "services/printing",
    price: 50,
    category: 64,
    published: false,
    description: "Black and white or colour, per page.",
    service: {
      service_type: "on_site",
      pricing_type: "fixed_price",
      location: "Shop 12, Akoka Plaza, Lagos",
      slot_mode: "unlimited",
    },
  },
  {
    name: "Tailoring and alterations",
    image: "services/tailoring",
    price: 4000,
    category: 65,
    description: "Hemming, resizing and custom outfits.",
    service: {
      service_type: "custom",
      pricing_type: "custom_quote",
      location: "Shop 12, Akoka Plaza, Lagos",
      slot_mode: "limited",
    },
  },
  {
    name: "Weekly laundry plan",
    image: "services/laundry",
    price: 12000,
    category: 66,
    description: "Pick-up, wash, fold and return every week.",
    service: {
      service_type: "subscription",
      pricing_type: "monthly_subscription",
      service_area: "Akoka hostels",
      slot_mode: "limited",
    },
  },
  {
    name: "Free consultation, laptop upgrade",
    image: "services/laptop-repair",
    price: 0,
    category: 61,
    service: {
      service_type: "consultation",
      pricing_type: "free_consultation",
      location: "Remote",
      slot_mode: "unlimited",
    },
  },
];

// ---------------------------------------------------------------------------

function toListing(
  seed: Seed,
  id: number,
  type: DemoListing["listingType"],
): DemoListing {
  return {
    id,
    listingType: type,
    name: seed.name,
    categoryIds: [seed.category],
    unitPrice: seed.price,
    unit: seed.unit ?? (type === "service" ? null : "pcs"),
    stock: seed.stock ?? 0,
    thumbnail: demoImage(seed.image),
    published: seed.published ?? true,
    featured: seed.featured ?? false,
    approved: seed.approved ?? true,
    description: seed.description ?? "",
    foodMeta: seed.food ?? null,
    serviceMeta: seed.service ?? null,
  };
}

/** Listings for a shop kind, oldest first (the API lists newest first). */
export function buildListings(kind: DemoShopKind): DemoListing[] {
  let id = 100;
  const make = (seeds: Seed[], type: DemoListing["listingType"]) =>
    seeds.map((seed) => toListing(seed, id++, type));

  switch (kind) {
    case "product":
      return [...make(PRODUCTS, "product"), ...make(CAMPUS_FOOD, "food")];
    case "food":
      return make(KITCHEN_FOOD, "food");
    case "service":
      return make(SERVICES, "service");
  }
}
