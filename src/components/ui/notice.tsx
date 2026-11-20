import type { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

type NoticeTone = "info" | "success" | "warning" | "error";

const TONES: Record<
  NoticeTone,
  {
    box: string;
    text: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    color: "brand-text" | "success-text" | "warning" | "destructive-text";
  }
> = {
  info: {
    box: "border-tint-border bg-tint",
    text: "text-brand-text",
    icon: "information-circle",
    color: "brand-text",
  },
  success: {
    box: "border-success/30 bg-success-tint",
    text: "text-success-text",
    icon: "checkmark-circle",
    color: "success-text",
  },
  warning: {
    box: "border-warning/30 bg-warning-tint",
    text: "text-foreground",
    icon: "warning",
    color: "warning",
  },
  error: {
    box: "border-destructive/30 bg-destructive-tint",
    text: "text-destructive-text",
    icon: "alert-circle",
    color: "destructive-text",
  },
};

interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

// Inline banner for form-level feedback (wrong password, account under review,
// "we sent you a code", session expired…).
export function Notice({
  tone = "info",
  title,
  children,
  className,
}: NoticeProps) {
  const colors = useThemeColors();
  const t = TONES[tone];

  return (
    <View
      accessibilityRole="alert"
      className={cn(
        "flex-row gap-3 rounded-field border p-3.5",
        t.box,
        className,
      )}
    >
      <Ionicons name={t.icon} size={20} color={colors[t.color]} />
      <View className="flex-1 gap-0.5">
        {title ? (
          <Text variant="label" className={t.text}>
            {title}
          </Text>
        ) : null}
        {children ? (
          <Text variant="caption" className={cn("text-sm leading-5", t.text)}>
            {children}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
