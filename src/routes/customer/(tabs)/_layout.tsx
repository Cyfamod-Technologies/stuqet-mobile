import { View } from "react-native";
import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";
import { useRoleStore, type AppRole } from "~/lib/stores/role-store";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: "home" | "search" | "orders" | "deliveries" | "earnings" | "profile";
  title: string;
  icon: IoniconName;
  iconFocused: IoniconName;
  /** Roles that get this tab; the rest hide it (`href: null`). */
  roles: AppRole[];
}

// One app, two roles: customers get Home / Search / Orders / Profile and riders
// Home / Deliveries / Earnings / Profile (boards). Every route stays registered
// so deep links keep working; the tabs that do not apply are only hidden.
const TABS: TabConfig[] = [
  {
    name: "home",
    title: "Home",
    icon: "home-outline",
    iconFocused: "home",
    roles: ["customer", "rider"],
  },
  {
    name: "search",
    title: "Search",
    icon: "search-outline",
    iconFocused: "search",
    roles: ["customer"],
  },
  {
    name: "orders",
    title: "Orders",
    icon: "receipt-outline",
    iconFocused: "receipt",
    roles: ["customer"],
  },
  {
    name: "deliveries",
    title: "Deliveries",
    icon: "bicycle-outline",
    iconFocused: "bicycle",
    roles: ["rider"],
  },
  {
    name: "earnings",
    title: "Earnings",
    icon: "card-outline",
    iconFocused: "card",
    roles: ["rider"],
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    iconFocused: "person",
    roles: ["customer", "rider"],
  },
];

// Tab bar from the boards: 84px (white, hairline top border), a 56x30 pill
// behind the icon that tints when active, 12px labels. Safe-area padding grows
// the bar on phones with a home indicator.
const BAR_CONTENT_HEIGHT = 70;
const BAR_MIN_BOTTOM = 14;

export default function TabLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const role = useRoleStore((s) => s.role);
  const hydrate = useRoleStore((s) => s.hydrate);
  const segments: string[] = useSegments();
  // Pushed screens (restaurant, cart, delivery detail...) sit full height on the
  // boards, without the tab bar; only each tab's root screen shows it.
  const hideBar = segments.length > 2;
  const bottom = Math.max(insets.bottom, BAR_MIN_BOTTOM);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

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
      {TABS.map(({ name, title, icon, iconFocused, roles }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: title,
            ...(roles.includes(role) ? {} : { href: null }),
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
              // Always navigate to the root screen of the tab, clearing any
              // deep stack.
              navigation.navigate(name, { screen: "index" });
            },
          })}
        />
      ))}
    </Tabs>
  );
}
