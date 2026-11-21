import type { ComponentProps } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

interface StatusPanelProps {
  tone?: "brand" | "success";
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  children: string;
}

// Verification status card from the design: tinted box, 26px icon, bold title
// and a muted explanation.
export function StatusPanel({
  tone = "brand",
  icon,
  title,
  children,
}: StatusPanelProps) {
  const colors = useThemeColors();
  const success = tone === "success";

  return (
    <View
      accessibilityRole="summary"
      className={cn(
        "flex-row items-start gap-3 rounded-[20px] border px-4 py-3.5",
        success
          ? "border-success-border bg-success-tint"
          : "border-tint-border bg-tint",
      )}
    >
      <Ionicons
        name={icon}
        size={26}
        color={success ? colors["success-text"] : colors["brand-text"]}
      />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="heading" className="font-sans-extrabold text-base">
          {title}
        </Text>
        <Text className="font-sans-medium text-sm leading-[19px] text-muted-foreground">
          {children}
        </Text>
      </View>
    </View>
  );
}
