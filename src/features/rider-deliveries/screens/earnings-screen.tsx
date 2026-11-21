import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { ScreenHeader } from "~/components/ui/screen-header";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils/helpers";
import { formatNaira } from "~/lib/utils/format";
import { useEarningRows, useEarningSummary } from "../hooks";

// Earnings board: Today and Yesterday, then two lists, Earnings (what each
// delivery paid you) and Cash collected (cash handed over by customers).
export function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<"earnings" | "collections">("earnings");
  const summary = useEarningSummary();
  const rows = useEarningRows(kind);

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      <ScreenHeader title="Earnings" />
      <View className="flex-row gap-3">
        {[
          { label: "Today", value: summary.data?.today_earning },
          { label: "Yesterday", value: summary.data?.yesterday_earning },
        ].map((card) => (
          <Card key={card.label} className="flex-1 gap-1 p-3.5">
            <Text variant="meta" className="text-xs">
              {card.label}
            </Text>
            {summary.isLoading ? (
              <Skeleton className="h-7 rounded-md" />
            ) : (
              <Text className="font-sans-extrabold text-2xl">
                {card.value ?? "—"}
              </Text>
            )}
          </Card>
        ))}
      </View>

      <SegmentedControl
        options={[
          { label: "Earnings", value: "earnings" },
          { label: "Cash collected", value: "collections" },
        ]}
        value={kind}
        onChange={(value) => setKind(value as "earnings" | "collections")}
      />

      {rows.isLoading ? (
        <Skeleton className="h-48 rounded-card" />
      ) : rows.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load this list"
          actionLabel="Try again"
          onAction={() => void rows.refetch()}
        />
      ) : rows.data && rows.data.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title={
            kind === "earnings" ? "No earnings yet" : "No cash collected yet"
          }
          message="Complete a delivery and it shows up here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          {rows.data?.map((row, index) => (
            <View
              key={row.id}
              className={cn(
                "min-h-16 flex-row items-center justify-between gap-3 px-4 py-3",
                index < (rows.data?.length ?? 0) - 1 &&
                  "border-b border-divider",
              )}
            >
              <View className="min-w-0 flex-1">
                <Text className="font-sans-bold text-[15px]">{`#${row.order_code}`}</Text>
                <Text variant="meta">
                  {kind === "collections"
                    ? `Cash on delivery · ${row.date}`
                    : row.date}
                </Text>
              </View>
              <Text className="font-sans-extrabold text-base">
                {formatNaira(
                  kind === "earnings"
                    ? row.earning_amount
                    : row.collection_amount,
                )}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}
