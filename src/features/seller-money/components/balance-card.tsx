import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useCountUp } from "~/components/ui/motion";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { formatLike, parseMoney, tidyMoney } from "../utils";

interface BalanceCardProps {
  /** Formatted `admin_to_pay`, undefined while loading. */
  balance?: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onWithdraw: () => void;
}

// Dark card: `foreground` is near-black in light mode, so text on it uses
// `background`. The theme flips both, keeping the card high-contrast.
export function BalanceCard({
  balance,
  loading,
  error,
  onRetry,
  onWithdraw,
}: BalanceCardProps) {
  const colors = useThemeColors();
  const target = balance ? parseMoney(balance) : 0;
  const shown = useCountUp(Number.isFinite(target) ? target : 0);
  // Count up, then show the API's own string once it lands.
  const display =
    balance && Math.abs(shown - target) >= 0.5
      ? formatLike(balance, Math.round(shown))
      : tidyMoney(balance ?? "");

  return (
    <View className="gap-3.5 rounded-3xl bg-foreground p-[18px]">
      <View className="gap-0.5">
        <Text variant="label" className="text-background opacity-70">
          Available balance
        </Text>
        {loading ? (
          <Skeleton className="bg-background/20 mt-1 h-10 w-48" />
        ) : error || balance === undefined ? (
          <Text
            variant="label"
            className="py-2 text-base text-background"
            onPress={onRetry}
            accessibilityRole="button"
          >
            Couldn&apos;t load your balance. Tap to retry.
          </Text>
        ) : (
          <Text
            variant="display"
            className="text-[36px] leading-[42px] text-background"
            accessibilityLabel={`Available balance ${tidyMoney(balance)}`}
          >
            {display}
          </Text>
        )}
      </View>
      <Button
        onPress={onWithdraw}
        disabled={loading || error || balance === undefined}
        icon={
          <Ionicons name="add" size={22} color={colors["primary-foreground"]} />
        }
        className="min-h-[52px]"
        textClassName="text-lg"
      >
        Withdraw money
      </Button>
    </View>
  );
}
