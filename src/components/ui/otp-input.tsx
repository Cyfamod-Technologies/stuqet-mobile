import { useRef, useState, type ComponentRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { SHADOWS } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { Text } from "~/components/ui/text";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  /** Called once the last digit is entered. */
  onComplete?: (value: string) => void;
}

// One hidden TextInput drives N display boxes, so paste, autofill
// (`one-time-code`) and the number pad all work as a single field.
export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  onComplete,
}: OtpInputProps) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, "").slice(0, length);
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View className="flex-row justify-between gap-2">
        {Array.from({ length }, (_, i) => {
          const active = focused && i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              style={SHADOWS.field}
              className={cn(
                "h-14 flex-1 items-center justify-center rounded-field border bg-field",
                error
                  ? "border-destructive"
                  : active
                    ? "border-primary"
                    : "border-border",
              )}
            >
              <Text variant="title">{value[i] ?? ""}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={length}
        caretHidden
        accessibilityLabel="Verification code"
        className="absolute h-full w-full opacity-0"
      />
    </Pressable>
  );
}
