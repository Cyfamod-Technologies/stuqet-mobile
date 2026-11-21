import type { FulfilmentMode } from "~/features/customer-food/types";
import type { DemoDish, DemoVendor } from "../types";

const ALL: FulfilmentMode[] = ["delivery", "pickup", "dine_in"];
const DP: FulfilmentMode[] = ["delivery", "pickup"];

export const VENDORS: DemoVendor[] = [
  {
    id: 1,
    name: "Mama T Kitchen",
    logo: "logos/mama-t",
    cover: "covers/mama-t",
    rating: 4.7,
    reviewCount: 212,
    prepMinutes: 20,
    etaMinutes: 35,
    deliveryFee: 400,
    isOpen: true,
    opensLabel: null,
    modes: ALL,
    categories: ["Rice and stews"],
    phone: "0801 234 5678",
    address: "Block C, Akoka, Lagos",
  },
  {
    id: 2,
    name: "Campus Bites",
    logo: "logos/campus-bites",
    cover: "covers/campus-bites",
    rating: 4.7,
    reviewCount: 168,
    prepMinutes: 15,
    etaMinutes: 28,
    deliveryFee: 350,
    isOpen: true,
    opensLabel: null,
    modes: DP,
    categories: ["Snacks", "Fast food", "Drinks"],
    phone: "0802 345 6789",
    address: "Student Centre, Riverside University",
  },
  {
    id: 3,
    name: "Suya Spot",
    logo: "logos/suya-spot",
    cover: "covers/suya-spot",
    rating: 4.5,
    reviewCount: 96,
    prepMinutes: 18,
    etaMinutes: 32,
    deliveryFee: 400,
    isOpen: true,
    opensLabel: null,
    modes: DP,
    categories: ["Snacks", "Fast food"],
    phone: "0803 456 7890",
    address: "Gate 2, Riverside University",
  },
  {
    id: 4,
    name: "Riverside Grill",
    // No logo uploaded: the initials monogram shows.
    logo: null,
    cover: "covers/riverside-grill",
    rating: 4.3,
    reviewCount: 41,
    prepMinutes: 25,
    etaMinutes: 40,
    deliveryFee: 500,
    isOpen: true,
    opensLabel: null,
    modes: ALL,
    categories: ["Rice and stews", "Fast food"],
    phone: "0804 567 8901",
    address: "Riverside Plaza, Akoka",
  },
  {
    id: 5,
    name: "Amala Express",
    logo: "logos/amala-express",
    cover: "covers/amala-express",
    rating: 4.6,
    reviewCount: 130,
    prepMinutes: 22,
    etaMinutes: 36,
    deliveryFee: 400,
    isOpen: true,
    opensLabel: null,
    modes: ALL,
    categories: ["Rice and stews"],
    phone: "0805 678 9012",
    address: "Hostel Road, Akoka",
  },
  {
    id: 6,
    name: "Sweet Crumbs",
    logo: "logos/sweet-crumbs",
    cover: "covers/sweet-crumbs",
    rating: 4.8,
    reviewCount: 88,
    prepMinutes: 12,
    etaMinutes: 25,
    deliveryFee: 300,
    isOpen: true,
    opensLabel: null,
    modes: DP,
    categories: ["Bakery", "Snacks"],
    phone: "0806 789 0123",
    address: "Library Road, Riverside University",
  },
  {
    id: 7,
    name: "Green Bowl",
    logo: "logos/green-bowl",
    cover: "covers/green-bowl",
    rating: 4.4,
    reviewCount: 57,
    prepMinutes: 15,
    etaMinutes: 30,
    deliveryFee: 450,
    isOpen: true,
    opensLabel: null,
    modes: DP,
    categories: ["Healthy", "Drinks"],
    phone: "0807 890 1234",
    address: "Sports Complex, Riverside University",
  },
  {
    id: 8,
    name: "Night Owl Shawarma",
    logo: "logos/night-owl",
    cover: "covers/night-owl",
    rating: 4.2,
    reviewCount: 73,
    prepMinutes: 15,
    etaMinutes: 30,
    deliveryFee: 400,
    isOpen: false,
    opensLabel: "Opens 18:00",
    modes: DP,
    categories: ["Fast food", "Snacks"],
    phone: "0808 901 2345",
    address: "Gate 1, Riverside University",
  },
];

let nextDishId = 100;

function dish(
  vendorId: number,
  section: string,
  name: string,
  price: number,
  image: DemoDish["image"],
  extra: Partial<DemoDish> = {},
): DemoDish {
  return {
    id: nextDishId++,
    vendorId,
    name,
    description: "",
    image,
    section,
    prepMinutes: VENDORS.find((v) => v.id === vendorId)?.prepMinutes ?? 20,
    status: "available",
    availableWindow: null,
    modes: VENDORS.find((v) => v.id === vendorId)?.modes ?? ["delivery"],
    sizes: [],
    addOns: [],
    price,
    unit: null,
    popular: false,
    ...extra,
  };
}

const chicken = { id: "chicken", label: "Extra chicken", price: 800 };
const plantain = { id: "plantain", label: "Fried plantain", price: 300 };

// Dish ids 101+ are stable (the cart and orders point at them).
export const DISHES: DemoDish[] = [
  // --- Mama T Kitchen -----------------------------------------------------
  dish(1, "Meals", "Jollof rice and chicken", 2500, "dishes/jollof-rice", {
    description: "Smoky party jollof with grilled chicken.",
    popular: true,
    sizes: [
      { id: "regular", label: "Regular", price: 2500 },
      { id: "large", label: "Large", price: 3200 },
    ],
    addOns: [chicken, plantain],
  }),
  dish(1, "Meals", "Pounded yam and egusi", 3200, "dishes/pounded-yam-egusi", {
    description: "Soft pounded yam with egusi soup and assorted meat.",
    status: "scheduled",
    availableWindow: "12:00 to 15:00",
    prepMinutes: 25,
  }),
  dish(
    1,
    "Meals",
    "Fried rice and plantain",
    2800,
    "dishes/fried-rice-plantain",
    {
      description: "Fried rice with vegetables and ripe plantain.",
      status: "sold_out",
    },
  ),
  dish(1, "Meals", "Party jollof and beef", 2800, "dishes/jollof-rice", {
    description: "Party jollof rice with peppered beef.",
    status: "sold_out",
  }),
  dish(
    1,
    "Meals",
    "Smoky party jollof rice with grilled chicken, fried plantain and coleslaw family combo",
    1800,
    "dishes/jollof-rice",
    {
      description:
        "Our family combo: jollof, grilled chicken, plantain and coleslaw.",
      sizes: [
        { id: "regular", label: "Regular", price: 1800 },
        { id: "large", label: "Large", price: 2300 },
      ],
      addOns: [
        { id: "chicken", label: "Extra chicken", price: 400 },
        { id: "plantain", label: "Fried plantain", price: 200 },
        { id: "coleslaw", label: "Coleslaw", price: 200 },
        { id: "pepper", label: "Extra pepper sauce", price: 200 },
      ],
    },
  ),
  dish(1, "Sides", "Fried plantain", 600, null, {
    description: "Ripe plantain, fried golden.",
  }),
  dish(1, "Sides", "Coleslaw", 500, null),
  dish(1, "Drinks", "Zobo drink", 500, "dishes/zobo", {
    description: "Chilled hibiscus drink with ginger.",
    unit: "500 ml",
    popular: true,
    prepMinutes: 5,
  }),
  dish(1, "Drinks", "Chapman", 1200, "dishes/chapman", { prepMinutes: 5 }),
  // --- Campus Bites -------------------------------------------------------
  dish(2, "Burgers", "Classic beef burger", 2800, "dishes/burger", {
    description: "Beef patty, cheese, lettuce and house sauce.",
    popular: true,
    addOns: [
      { id: "cheese", label: "Extra cheese", price: 300 },
      { id: "egg", label: "Fried egg", price: 250 },
    ],
  }),
  dish(2, "Burgers", "Chicken shawarma", 2500, "dishes/shawarma", {
    description: "Grilled chicken, cabbage, sausage and garlic sauce.",
  }),
  dish(2, "Snacks", "Meat pie", 700, "dishes/meat-pie", { prepMinutes: 8 }),
  dish(2, "Snacks", "Puff puff (10 pieces)", 500, "dishes/puff-puff", {
    prepMinutes: 8,
  }),
  dish(2, "Drinks", "Strawberry smoothie", 1500, "dishes/smoothie", {
    prepMinutes: 6,
  }),
  dish(2, "Drinks", "Chapman", 1200, "dishes/chapman", { prepMinutes: 5 }),
  // --- Suya Spot ----------------------------------------------------------
  dish(3, "Suya", "Beef suya", 1500, "dishes/suya", {
    description: "Spiced grilled beef with onions and tomatoes.",
    popular: true,
    sizes: [
      { id: "small", label: "Small", price: 1500 },
      { id: "medium", label: "Medium", price: 2500 },
    ],
  }),
  dish(3, "Suya", "Chicken suya", 1800, "dishes/suya"),
  dish(3, "Grill", "Grilled chicken and chips", 3200, "dishes/grilled-chicken"),
  dish(3, "Drinks", "Zobo drink", 500, "dishes/zobo", { prepMinutes: 5 }),
  // --- Riverside Grill ----------------------------------------------------
  dish(4, "Grill", "Grilled chicken platter", 3500, "dishes/grilled-chicken", {
    sizes: [
      { id: "half", label: "Half chicken", price: 3500 },
      { id: "whole", label: "Whole chicken", price: 6500 },
    ],
  }),
  dish(4, "Meals", "Smoky party jollof and beef", 2800, "dishes/jollof-rice"),
  dish(
    4,
    "Meals",
    "Fried rice and chicken",
    3000,
    "dishes/fried-rice-plantain",
  ),
  // --- Amala Express ------------------------------------------------------
  dish(5, "Swallow", "Amala and ewedu", 2200, "dishes/amala-ewedu", {
    description: "Amala with ewedu, gbegiri and stew.",
    popular: true,
    addOns: [{ id: "meat", label: "Assorted meat", price: 700 }],
  }),
  dish(5, "Swallow", "Pounded yam and egusi", 3000, "dishes/pounded-yam-egusi"),
  dish(5, "Drinks", "Zobo drink", 500, "dishes/zobo", { prepMinutes: 5 }),
  // --- Sweet Crumbs -------------------------------------------------------
  dish(6, "Cakes", "Chocolate cake slice", 1800, "dishes/cake-slice", {
    description: "Layered chocolate cake with cream.",
    popular: true,
    prepMinutes: 5,
  }),
  dish(6, "Bakes", "Doughnuts (box of 3)", 1500, "dishes/doughnuts", {
    prepMinutes: 5,
  }),
  dish(6, "Bakes", "Meat pie", 700, "dishes/meat-pie", { prepMinutes: 5 }),
  dish(6, "Bakes", "Puff puff (10 pieces)", 500, "dishes/puff-puff", {
    prepMinutes: 8,
  }),
  // --- Green Bowl ---------------------------------------------------------
  dish(7, "Bowls", "Garden salad bowl", 2600, "dishes/salad-bowl", {
    description: "Greens, tomatoes, sweetcorn and grilled chicken strips.",
    sizes: [
      { id: "regular", label: "Regular", price: 2600 },
      { id: "large", label: "Large", price: 3400 },
    ],
  }),
  dish(7, "Drinks", "Strawberry smoothie", 1600, "dishes/smoothie", {
    prepMinutes: 6,
  }),
  // --- Night Owl Shawarma (closed) ---------------------------------------
  dish(8, "Wraps", "Beef shawarma", 2400, "dishes/shawarma"),
  dish(8, "Wraps", "Double sausage shawarma", 3000, "dishes/shawarma"),
];

export const dishById = (id: number) => DISHES.find((d) => d.id === id);
export const vendorById = (id: number) => VENDORS.find((v) => v.id === id);
export const dishByName = (vendorId: number, name: string) =>
  DISHES.find((d) => d.vendorId === vendorId && d.name === name);
