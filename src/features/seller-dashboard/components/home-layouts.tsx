import { useRouter } from "expo-router";
import { SectionHeader } from "~/components/ui/section-header";
import { useOrderCount } from "~/features/seller-orders/hooks";
import type { ShopInfo } from "~/features/seller-shop/types";
import { HOME_LINKS } from "../constants";
import { AttentionList } from "./attention-list";
import { CounterTiles } from "./counter-tiles";
import { HomeHeader } from "./home-header";
import { QuickActions } from "./quick-actions";
import { SalesHero } from "./sales-hero";
import { StatStrip } from "./stat-strip";
import { SummaryCard } from "./summary-card";

interface LayoutProps {
  shop: ShopInfo;
}

// Home for shops that sell products: sales summary, order counters and what
// needs attention (Home board). The earlier "Recent orders" and "Top sellers"
// cards are not in the design, so they are gone.
export function ProductHome({ shop }: LayoutProps) {
  return (
    <>
      <HomeHeader shop={shop} />
      <SalesHero allTimeSales={shop.sales} />
      <CounterTiles delivered={shop.orders} />
      <AttentionList shop={shop} />
    </>
  );
}

// Home for food shops (HomeFood board). The menu-availability counts (always
// available / scheduled / sold out) and "Live menu" have no endpoint yet, so
// the card is left out and "Delivered" stands in for "Live menu".
export function FoodHome({ shop }: LayoutProps) {
  const router = useRouter();
  const pending = useOrderCount("pending");

  return (
    <>
      <HomeHeader shop={shop} />
      <StatStrip
        items={[
          { label: "Food items", value: shop.products },
          {
            label: "Pending orders",
            value: pending.data?.count ?? "—",
            loading: pending.isPending,
            accent: "brand",
          },
          { label: "Delivered", value: shop.orders },
        ]}
      />
      <SectionHeader title="Quick actions" />
      <QuickActions
        actions={[
          {
            label: "Add new food",
            icon: "add",
            onPress: () => router.navigate(HOME_LINKS.catalogue),
          },
          {
            label: "Manage menu",
            icon: "restaurant-outline",
            onPress: () => router.navigate(HOME_LINKS.catalogue),
          },
          {
            label: "Track orders",
            icon: "receipt-outline",
            onPress: () => router.navigate(HOME_LINKS.orders),
          },
          {
            label: "Shop settings",
            icon: "storefront-outline",
            onPress: () => router.push(HOME_LINKS.shopSettings),
          },
        ]}
      />
    </>
  );
}

// Home for service shops (no orders or money tabs). The "School" row of the
// design has no field in the API, so it is omitted.
export function ServiceHome({ shop }: LayoutProps) {
  const router = useRouter();

  return (
    <>
      <HomeHeader shop={shop} />
      <StatStrip
        items={[
          { label: "Services", value: shop.products },
          {
            label: "Rating",
            value: shop.rating > 0 ? shop.rating.toFixed(1) : "New",
          },
          {
            label: "Profile",
            value: shop.verified ? "Verified" : "Unverified",
            accent: shop.verified ? "success" : undefined,
          },
        ]}
      />
      <SectionHeader title="Service summary" />
      <SummaryCard
        rows={[
          { label: "Active services", value: shop.products },
          { label: "Shop name", value: shop.name },
          ...(shop.phone
            ? [{ label: "Contact number", value: shop.phone }]
            : []),
        ]}
      />
      <SectionHeader title="Quick actions" />
      <QuickActions
        actions={[
          {
            label: "Add new service",
            icon: "add",
            onPress: () => router.navigate(HOME_LINKS.catalogue),
          },
          {
            label: "Manage services",
            icon: "construct-outline",
            onPress: () => router.navigate(HOME_LINKS.catalogue),
          },
          {
            label: "Shop settings",
            icon: "storefront-outline",
            onPress: () => router.push(HOME_LINKS.shopSettings),
          },
          {
            label: "Payout details",
            icon: "business-outline",
            onPress: () => router.push(HOME_LINKS.payout),
          },
        ]}
      />
    </>
  );
}
