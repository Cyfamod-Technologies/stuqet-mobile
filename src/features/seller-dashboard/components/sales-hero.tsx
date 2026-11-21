import { View } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils/helpers";
import { formatNaira } from "../format";
import { useSalesStat } from "../hooks";

const CHART_HEIGHT = 60;

interface SalesHeroProps {
  /** Formatted all-time paid sales from shop/info. */
  allTimeSales: string;
}

// Dark summary card: delivered-order sales for the last 7 days with a bar per
// day (today in orange). The API has no month totals, so "this month vs last
// month" and the Up/Down pill from the design are not shown.
export function SalesHero({ allTimeSales }: SalesHeroProps) {
  const stat = useSalesStat();
  const days = stat.data ?? [];
  const total = days.reduce((sum, day) => sum + day.total, 0);
  const max = Math.max(...days.map((d) => d.total), 0);

  return (
    <View className="gap-3 rounded-3xl bg-foreground px-[18px] pb-3.5 pt-[18px]">
      <View className="gap-0.5">
        <Text className="font-sans-semibold text-sm text-background opacity-70">
          Sales, last 7 days
        </Text>
        {stat.isPending ? (
          <Skeleton className="mt-1 h-10 w-44 bg-muted-foreground" />
        ) : (
          <Text
            className="font-sans-extrabold text-4xl leading-[42px] text-background"
            accessibilityLabel={`Sales in the last 7 days: ${formatNaira(total)}`}
          >
            {stat.isError ? "—" : formatNaira(total)}
          </Text>
        )}
      </View>
      <Text className="font-sans-medium text-[13px] leading-4 text-background opacity-70">
        All-time sales {allTimeSales}
      </Text>
      {days.length > 0 ? (
        <View
          accessible
          accessibilityLabel={`Daily sales bar chart for the last ${days.length} days`}
          className="h-[84px] flex-row items-end gap-2"
        >
          {days.map((day) => (
            <View
              key={day.date}
              className="flex-1 items-center justify-end gap-1.5"
            >
              <View
                className={cn(
                  "w-full rounded-lg",
                  day.isToday ? "bg-primary" : "bg-background opacity-30",
                )}
                style={{
                  height:
                    max > 0 ? Math.max(6, (day.total / max) * CHART_HEIGHT) : 6,
                }}
              />
              <Text className="font-sans-semibold text-[11px] leading-3 text-background opacity-70">
                {day.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
