import type { ComponentProps } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Text starts after a 16px inset + 20px icon + 10px gap (the field box already
// pads 16px, so the input adds the rest).
const ICON_INPUT_PADDING = 30;

interface IconInputProps extends Omit<ComponentProps<typeof Input>, "label"> {
  label: string;
  /** Left icon, drawn inside the field like the design. */
  icon: IconName;
}

/** The shared Input with a leading icon (phone, address, bank, lock…). */
export function IconInput({
  label,
  icon,
  containerClassName,
  style,
  ...props
}: IconInputProps) {
  const colors = useThemeColors();

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      <Text variant="label">{label}</Text>
      <View>
        <Input
          {...props}
          style={[{ paddingLeft: ICON_INPUT_PADDING }, style]}
        />
        <View pointerEvents="none" className="absolute left-4 top-4">
          <Ionicons name={icon} size={20} color={colors.hint} />
        </View>
      </View>
    </View>
  );
}

interface IconFormFieldProps<T extends FieldValues> extends Omit<
  IconInputProps,
  "value" | "onChangeText" | "error"
> {
  control: Control<T>;
  name: Path<T>;
}

/** `IconInput` bound to a React Hook Form field. */
export function IconFormField<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: IconFormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <IconInput
          {...inputProps}
          value={typeof value === "string" ? value : ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}
