import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface ListHeaderProps {
  title: string;
  subtitle?: string;
}

// Root-tab title block of the catalogue and services boards: 30/36 extra-bold
// title (-0.5 tracking) over a 15/20 medium muted line.
export function ListHeader({ title, subtitle }: ListHeaderProps) {
  return (
    <View accessibilityRole="header">
      <Text
        variant="display"
        className="text-[30px] leading-9"
        style={{ letterSpacing: -0.5 }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          tone="muted"
          className="mt-0.5 font-sans-medium text-[15px] leading-5"
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
