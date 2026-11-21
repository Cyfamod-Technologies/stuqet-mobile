import { Controller, type Control } from "react-hook-form";
import { Input } from "~/components/ui/input";
import type { FoodFormValues } from "../schemas";
import { formatTimeInput } from "../utils";

interface TimeFieldProps {
  control: Control<FoodFormValues>;
  name: "time_from" | "time_to";
  label: string;
}

// 24-hour "HH:mm" text field that inserts the colon as you type.
export function TimeField({ control, name, label }: TimeFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          label={label}
          value={field.value}
          onChangeText={(text) => field.onChange(formatTimeInput(text))}
          onBlur={field.onBlur}
          placeholder="00:00"
          keyboardType="number-pad"
          maxLength={5}
          error={fieldState.error?.message}
          containerClassName="flex-1"
        />
      )}
    />
  );
}
