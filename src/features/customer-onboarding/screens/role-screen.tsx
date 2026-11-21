import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "~/components/screen";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { useRoleStore } from "~/lib/stores/role-store";
import { cn } from "~/lib/utils/helpers";

interface RoleCardProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
  dark?: boolean;
  onPress: () => void;
}

function RoleCard({ icon, title, body, dark, onPress }: RoleCardProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={SHADOWS.field}
      className={cn(
        "flex-row items-center gap-4 rounded-[24px] border p-5 active:opacity-90",
        dark ? "border-foreground bg-foreground" : "border-border bg-card",
      )}
    >
      <View
        className={cn(
          "h-14 w-14 items-center justify-center rounded-[18px]",
          dark ? "bg-secondary" : "bg-tint",
        )}
      >
        <Ionicons name={icon} size={26} color={colors["brand-text"]} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className={cn(
            "font-sans-extrabold text-xl",
            dark && "text-background",
          )}
        >
          {title}
        </Text>
        <Text
          className={cn(
            "font-sans-medium text-[13px] leading-[18px]",
            dark ? "text-subtle" : "text-muted-foreground",
          )}
        >
          {body}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={dark ? colors.subtle : colors.subtle}
      />
    </Pressable>
  );
}

// Role picker (board 4): one app for two roles. "Order food" continues to the
// customer set-up; "Deliver orders" starts rider onboarding. Either can be
// switched later from the profile.
export function RoleScreen() {
  const setRole = useRoleStore((s) => s.setRole);

  return (
    <Screen contentContainerStyle={{ gap: 14 }}>
      <View className="mt-10 gap-1.5">
        <Text
          accessibilityRole="header"
          className="font-sans-extrabold text-[32px] leading-[38px]"
        >
          How will you use Stuqet?
        </Text>
        <Text tone="muted" className="font-sans-medium text-base leading-6">
          Choose one to get started.
        </Text>
      </View>

      <View className="mt-4 gap-3.5">
        <RoleCard
          icon="restaurant"
          title="Order food"
          body="Get meals and drinks from vendors at your school."
          onPress={() => {
            setRole("customer");
            router.push("/setup/school");
          }}
        />
        <RoleCard
          icon="bicycle"
          title="Deliver orders"
          body="Earn by delivering food around your campus."
          dark
          onPress={() => {
            router.push("/rider-setup/profile");
          }}
        />
      </View>

      <Text variant="meta" className="text-[13px]">
        You can pick the other one later from your profile.
      </Text>
    </Screen>
  );
}
