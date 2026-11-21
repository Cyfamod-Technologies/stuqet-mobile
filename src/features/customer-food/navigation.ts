import { router, useSegments, type Href } from "expo-router";

type FoodTab = "home" | "search" | "orders" | "profile";

const TABS: readonly string[] = ["home", "search", "orders", "profile"];

/**
 * Navigation inside the customer tabs. Restaurant, dish, cart, checkout,
 * address and order screens exist once per tab stack (thin route files), so a
 * push stays in the tab the person is in and Back returns to where they were.
 */
export function useFoodNav() {
  const segments: string[] = useSegments();
  const current = segments[1] ?? "home";
  const tab: FoodTab = TABS.includes(current) ? (current as FoodTab) : "home";
  const to = (path: string) => `/(tabs)/${tab}/${path}` as Href;

  return {
    tab,
    openRestaurant: (id: number) => router.push(to(`restaurant/${id}`)),
    openDish: (id: number) => router.push(to(`dish/${id}`)),
    openCart: () => router.push(to("cart")),
    openCheckout: (vendorId: number) =>
      router.push({
        pathname: to("checkout") as never,
        params: { vendorId: String(vendorId) },
      }),
    openAddresses: () => router.push(to("addresses")),
    openAddressForm: (id?: number) =>
      router.push({
        pathname: to("address-form") as never,
        params: id ? { id: String(id) } : {},
      }),
    openNotifications: () => router.push(to("notifications")),
    openTrack: (id: number) => router.push(to(`track/${id}`)),
    replaceWithTrack: (id: number) => router.replace(to(`track/${id}`)),
    replaceWithPlaced: (id: number) =>
      router.replace({
        pathname: to("placed") as never,
        params: { orderId: String(id) },
      }),
    openChat: (id: number) => router.push(to(`chat/${id}`)),
    openSchool: () =>
      router.push({ pathname: to("school") as never, params: { change: "1" } }),
  };
}

export const goHome = () => router.replace("/(tabs)/home");
export const goSearch = () => router.push("/(tabs)/search");
