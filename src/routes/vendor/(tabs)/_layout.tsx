import { View } from "react-native";
import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";
import { useShopType } from "~/features/seller-shop/hooks";
import type { ShopType } from "~/features/seller-shop/types";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: "index" | "orders" | "catalogue" | "services" | "money" | "more";
  title: string;
  icon: IoniconName;
  iconFocused: IoniconName;
  /** Shop types that get this tab; the rest hide it (`href: null`). */
  shops: ShopType[];
}

// Product and food shops get five tabs, service shops three (HomeService
// board). Every route stays registered so deep links keep working; the tabs
// that do not apply are only hidden from the bar.
const TABS: TabConfig[] = [
  {
    name: "index",
    title: "Home",
    icon: "home-outline",
    iconFocused: "home",
    shops: ["product", "food", "service"],
  },
  {
    name: "orders",
    title: "Orders",
    icon: "receipt-outline",
    iconFocused: "receipt",
    shops: ["product", "food"],
  },
  {
    name: "catalogue",
    title: "Catalogue",
    icon: "cube-outline",
    iconFocused: "cube",
    shops: ["product", "food"],
  },
  {
    name: "services",
    title: "Services",
    icon: "construct-outline",
    iconFocused: "construct",
    shops: ["service"],
  },
  {
    name: "money",
    title: "Money",
    icon: "wallet-outline",
    iconFocused: "wallet",
    shops: ["product", "food"],
  },
  {
    name: "more",
    title: "More",
    icon: "ellipsis-horizontal",
    iconFocused: "ellipsis-horizontal",
    shops: ["product", "food", "service"],
  },
];

/** Pushed screens that sit full-height on the boards (no tab bar): create
 * forms, order details, withdraw, the More sub-screens and support. Keyed by
 * tab, then by the second path segment. */
const FORM_SCREENS: Record<string, readonly string[]> = {
  catalogue: ["add-product", "add-food", "saved"],
  services: ["add", "saved"],
  orders: ["[id]"],
  money: ["withdraw", "withdraw-done"],
  more: [
    "payout",
    "settings",
    "shop-banners",
    "shop-settings",
    "support",
    "verification",
  ],
};

// Tab bar from the boards: 84px (white, hairline top border), a 56x30 pill
// behind the icon that tints when active, 12px labels (bold, extra-bold when
// active). Safe-area padding grows the bar on phones with a home indicator.
const BAR_CONTENT_HEIGHT = 70;
const BAR_MIN_BOTTOM = 14;

export default function TabLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const shopType = useShopType();
  const segments: string[] = useSegments();
  const hideBar = FORM_SCREENS[segments[1] ?? ""]?.includes(segments[2] ?? "");
  const bottom = Math.max(insets.bottom, BAR_MIN_BOTTOM);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
        tabBarStyle: {
          display: hideBar ? "none" : "flex",
          height: BAR_CONTENT_HEIGHT + bottom,
          paddingTop: 6,
          paddingHorizontal: 8,
          paddingBottom: bottom,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 16,
          elevation: 8,
        },
        tabBarItemStyle: { minHeight: 56 },
        tabBarHideOnKeyboard: true,
      }}
    >
      {TABS.map(({ name, title, icon, iconFocused, shops }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: title,
            ...(shops.includes(shopType) ? {} : { href: null }),
            tabBarIcon: ({ focused }) => (
              <View
                className={cn(
                  "h-[30px] w-14 items-center justify-center rounded-full",
                  focused && "bg-tint",
                )}
              >
                <Ionicons
                  name={focused ? iconFocused : icon}
                  size={22}
                  color={
                    focused ? colors["brand-text"] : colors["muted-foreground"]
                  }
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                numberOfLines={1}
                className={cn(
                  "mt-[3px] text-xs leading-[14px]",
                  focused
                    ? "font-sans-extrabold text-brand-text"
                    : "font-sans-semibold text-muted-foreground",
                )}
              >
                {title}
              </Text>
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              // Always navigate to the root screen of the tab, clearing
              // any deep stack.
              if (name === "index") {
                navigation.navigate("index");
              } else {
                navigation.navigate(name, { screen: "index" });
              }
            },
          })}
        />
      ))}
    </Tabs>
  );
}
