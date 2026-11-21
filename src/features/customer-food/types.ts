// Customer-app food catalogue DTOs. The backend has no food endpoints for the
// customer app yet (its public API is the product storefront), so these are the
// proposed contract; see the TODO(backend) notes in api.ts.

export type FulfilmentMode = "delivery" | "pickup" | "dine_in";

export type DishStatus = "available" | "sold_out" | "scheduled";

export interface FoodCategory {
  id: number;
  name: string;
}

export interface VendorSummary {
  id: number;
  name: string;
  /** Shop logo URL; the ShopLogo tile falls back to initials when null. */
  logo: string | null;
  cover: string | null;
  rating: number;
  reviewCount: number;
  /** Minutes from order to the door. */
  etaMinutes: number;
  /** Minutes the kitchen needs. */
  prepMinutes: number;
  deliveryFee: number;
  isOpen: boolean;
  /** "Opens 11:00" when closed. */
  opensLabel: string | null;
  school: string;
  modes: FulfilmentMode[];
  categories: string[];
  isFavourite: boolean;
}

export interface DishSize {
  id: string;
  label: string;
  price: number;
}

export interface DishAddOn {
  id: string;
  label: string;
  price: number;
}

export interface DishSummary {
  id: number;
  vendorId: number;
  vendorName: string;
  vendorLogo: string | null;
  name: string;
  description: string;
  /** Base price (the cheapest size). */
  price: number;
  image: string | null;
  section: string;
  prepMinutes: number;
  status: DishStatus;
  /** "12:00 to 15:00" for scheduled dishes. */
  availableWindow: string | null;
  isFavourite: boolean;
}

export interface Dish extends DishSummary {
  modes: FulfilmentMode[];
  sizes: DishSize[];
  addOns: DishAddOn[];
}

export interface MenuSection {
  id: string;
  name: string;
  dishes: DishSummary[];
}

export interface VendorMenu {
  vendor: VendorSummary;
  sections: MenuSection[];
}

export interface HomeData {
  school: string;
  categories: FoodCategory[];
  popular: DishSummary[];
  vendors: VendorSummary[];
  favourites: VendorSummary[];
  cartCount: number;
  unreadNotifications: number;
}

export interface SearchParams {
  q: string;
  mode?: FulfilmentMode | null;
  maxPrice?: number | null;
  category?: number | null;
}

export interface SearchResults {
  dishes: DishSummary[];
  vendors: VendorSummary[];
}
