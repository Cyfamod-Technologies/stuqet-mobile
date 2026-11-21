import { View } from "react-native";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils/helpers";

export interface SummaryRow {
  label: string;
  value: string | number;
}

// Label / value rows in a white card (service summary).
export function SummaryCard({ rows }: { rows: SummaryRow[] }) {
  return (
    <Card className="overflow-hidden p-0">
      {rows.map((row, index) => (
        <View
          key={row.label}
          className={cn(
            "min-h-11 flex-row items-center justify-between gap-3 px-4",
            index < rows.length - 1 && "border-b border-border",
          )}
        >
          <Text className="font-sans-medium text-[15px] text-muted-foreground">
            {row.label}
          </Text>
          <Text
            className="flex-1 text-right font-sans-bold text-[15px]"
            numberOfLines={1}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </Card>
  );
}
