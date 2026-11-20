import { View } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils/helpers";

export interface StatItem {
  label: string;
  value: string | number | undefined;
  /** Highlight the value in the brand colour (things that need action). */
  accent?: "brand" | "success";
  loading?: boolean;
}

// White strip of 2-3 headline numbers (food and service Home).
export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <View className="flex-row rounded-[20px] border border-border bg-card">
      {items.map((item, index) => (
        <View
          key={item.label}
          accessible
          accessibilityLabel={`${item.label}: ${item.value ?? "loading"}`}
          className={cn(
            "flex-1 gap-0.5 px-3.5 py-3",
            index > 0 && "border-l border-border",
          )}
        >
          {item.loading ? (
            <Skeleton className="h-[26px] w-10" />
          ) : (
            <Text
              className={cn(
                "font-sans-extrabold text-[22px] leading-[26px]",
                item.accent === "brand" && "text-brand-text",
                item.accent === "success" && "text-success-text",
              )}
            >
              {item.value}
            </Text>
          )}
          <Text variant="caption" className="font-sans-semibold text-xs">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
