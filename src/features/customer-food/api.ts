import { axiosPrivate } from "~/lib/config/axios";
import type {
  Dish,
  FoodCategory,
  HomeData,
  SearchParams,
  SearchResults,
  VendorMenu,
} from "./types";

// TODO(backend): none of these food catalogue endpoints exist yet. The public
// API (routes/api.php) only serves the product storefront (`products/*`,
// `shops/*`, `categories/*`). Proposed contract, all authenticated, food only
// (server side filter on `products.listing_type = 'food'`):
//   GET  /food/home                         -> HomeData
//   GET  /food/categories                   -> { data: FoodCategory[] }
//   GET  /food/vendors/{id}/menu            -> VendorMenu (sections of dishes)
//   GET  /food/dishes/{id}                  -> Dish (sizes, add-ons, status)
//   GET  /food/search?q&mode&maxPrice&category -> SearchResults
//   GET  /food/search/trending              -> { data: string[] }
//   POST /food/favourites/vendors/{id}/toggle, /food/favourites/dishes/{id}/toggle

const FoodService = {
  home: async (): Promise<HomeData> =>
    (await axiosPrivate.get<HomeData>("/food/home")).data,

  categories: async (): Promise<FoodCategory[]> =>
    (await axiosPrivate.get<{ data: FoodCategory[] }>("/food/categories")).data
      .data,

  menu: async (vendorId: number): Promise<VendorMenu> =>
    (await axiosPrivate.get<VendorMenu>(`/food/vendors/${vendorId}/menu`)).data,

  dish: async (id: number): Promise<Dish> =>
    (await axiosPrivate.get<Dish>(`/food/dishes/${id}`)).data,

  search: async (params: SearchParams): Promise<SearchResults> =>
    (
      await axiosPrivate.get<SearchResults>("/food/search", {
        params: {
          q: params.q,
          mode: params.mode ?? undefined,
          maxPrice: params.maxPrice ?? undefined,
          category: params.category ?? undefined,
        },
      })
    ).data,

  trending: async (): Promise<string[]> =>
    (await axiosPrivate.get<{ data: string[] }>("/food/search/trending")).data
      .data,

  toggleVendorFavourite: async (id: number): Promise<boolean> =>
    (
      await axiosPrivate.post<{ isFavourite: boolean }>(
        `/food/favourites/vendors/${id}/toggle`,
      )
    ).data.isFavourite,

  toggleDishFavourite: async (id: number): Promise<boolean> =>
    (
      await axiosPrivate.post<{ isFavourite: boolean }>(
        `/food/favourites/dishes/${id}/toggle`,
      )
    ).data.isFavourite,
};

export default FoodService;
