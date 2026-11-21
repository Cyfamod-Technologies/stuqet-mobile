import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Toggle } from "~/components/ui/toggle";
import { cn } from "~/lib/utils/helpers";

interface SwitchRowProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
}

// Row with a title, a hint and an orange switch. Lives in a
// <Card className="overflow-hidden p-0">.
export function SwitchRow({
  title,
  subtitle,
  value,
  onValueChange,
  last,
}: SwitchRowProps) {
  return (
    <View
      className={cn(
        "min-h-16 flex-row items-center gap-3 px-4 py-2.5",
        !last && "border-b border-border",
      )}
    >
      <View className="flex-1">
        <Text variant="heading" className="text-base">
          {title}
        </Text>
        <Text variant="caption" className="text-[13px] leading-[18px]">
          {subtitle}
        </Text>
      </View>
      <Toggle value={value} onValueChange={onValueChange} label={title} />
    </View>
  );
}
