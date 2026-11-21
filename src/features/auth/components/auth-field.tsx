import type { ComponentProps } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "~/components/forms/form-field";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface AuthFieldProps<T extends FieldValues> extends Omit<
  ComponentProps<typeof FormField<T>>,
  "control" | "name" | "label" | "containerClassName"
> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  /** Leading icon drawn inside the field (mail, lock...). */
  icon: IconName;
  /** Smaller muted label (the forgot-password board uses 13px muted). */
  mutedLabel?: boolean;
}

// FormField with the boards' label above and a 20px leading icon inside the
// field. The shared Input has no start adornment, so the icon is overlaid and
// the text is padded past it.
export function AuthField<T extends FieldValues>({
  label,
  icon,
  mutedLabel,
  className,
  ...fieldProps
}: AuthFieldProps<T>) {
  const colors = useThemeColors();

  return (
    <View className="gap-1.5">
      <Text
        className={cn(
          "font-sans-semibold",
          mutedLabel
            ? "text-[13px] leading-[18px] text-muted-foreground"
            : "text-sm leading-[18px]",
        )}
      >
        {label}
      </Text>
      <View>
        <FormField
          {...fieldProps}
          // 16px field padding + 20px icon + 10px gap = 46px (board value).
          className={cn("pl-[30px]", className)}
        />
        <View
          pointerEvents="none"
          className="absolute left-4 top-4"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Ionicons name={icon} size={20} color={colors.hint} />
        </View>
      </View>
    </View>
  );
}
