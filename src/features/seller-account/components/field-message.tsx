import type { ComponentProps } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

interface FieldMessageProps {
  tone: "success" | "muted";
  icon?: ComponentProps<typeof Ionicons>["name"];
  children: string;
}

// 13px helper line under a field (design: "Name confirmed with your bank").
export function FieldMessage({ tone, icon, children }: FieldMessageProps) {
  const colors = useThemeColors();
  const success = tone === "success";

  return (
    <View className="flex-row items-center gap-1.5">
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={success ? colors["success-text"] : colors["muted-foreground"]}
        />
      ) : null}
      <Text
        className={cn(
          "min-w-0 flex-1 text-[13px] leading-[18px]",
          success
            ? "font-sans-bold text-success-text"
            : "font-sans-medium text-muted-foreground",
        )}
      >
        {children}
      </Text>
    </View>
  );
}
