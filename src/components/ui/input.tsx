import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Platform,
  TextInput,
  View,
  Text,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "~/lib/utils/helpers";
import { SHADOWS, useThemeColors } from "~/lib/colors";

// Design-system field: white surface, 1px border, 14px radius, 52px tall, soft
// shadow. Focus swaps the border to the brand orange; error to destructive.
const FIELD_BOX = "rounded-field border border-border bg-field";

/** Box styles shared with non-Input rows (e.g. SwitchRow). */
export const inputVariants = cva(
  "px-4 py-3 font-sans-medium text-base text-foreground",
  {
    variants: {
      variant: {
        default: FIELD_BOX,
        ghost: "rounded-field border border-transparent bg-muted",
        underline:
          "rounded-none border-0 border-b border-border bg-transparent px-0 py-3",
        // Deprecated alias — the default field already is the auth field.
        auth: FIELD_BOX,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const inputContainerVariants = cva("flex-row border px-4", {
  variants: {
    variant: {
      default: "rounded-field border-border bg-field",
      ghost: "rounded-field border-transparent bg-muted",
      underline:
        "rounded-none border-0 border-b border-border bg-transparent px-0",
      auth: "rounded-field border-border bg-field",
    },
    multiline: {
      true: "items-start py-3",
      false: "min-h-field items-center",
    },
  },
  defaultVariants: {
    variant: "default",
    multiline: false,
  },
});

const inputTextVariants = cva(
  "flex-1 py-0 font-sans-medium text-base text-foreground",
  {
    variants: {
      variant: {
        default: "",
        ghost: "",
        underline: "px-0",
        auth: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type InputVariantProps = VariantProps<typeof inputVariants>;

interface InputProps extends TextInputProps, InputVariantProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  /** Optional element rendered inside the input on the right (e.g. a show/hide password button). */
  endAdornment?: React.ReactNode;
  /** Shows a green check — use once a value has been confirmed (e.g. verified email). */
  verified?: boolean;
}

const INPUT_FONT_SIZE = 16;
const INPUT_LINE_HEIGHT = 20;

export function Input({
  label,
  hint,
  error,
  variant,
  className,
  containerClassName,
  placeholderTextColor,
  endAdornment,
  verified,
  multiline,
  editable,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const locked = editable === false;
  const isUnderline = variant === "underline";

  const stateClass = error
    ? isUnderline
      ? "border-b-destructive"
      : "border-destructive"
    : focused
      ? isUnderline
        ? "border-b-primary"
        : "border-primary"
      : null;

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && (
        <Text className="font-sans-semibold text-sm text-foreground">
          {label}
        </Text>
      )}
      <View
        style={isUnderline || locked ? undefined : SHADOWS.field}
        className={cn(
          inputContainerVariants({ variant, multiline: Boolean(multiline) }),
          stateClass,
          locked && "bg-muted",
          (endAdornment || verified) && "gap-2",
        )}
      >
        <TextInput
          multiline={multiline}
          editable={editable}
          className={cn(
            inputTextVariants({ variant }),
            locked && "text-muted-foreground",
            className,
          )}
          style={[
            {
              fontSize: INPUT_FONT_SIZE,
              ...(Platform.OS === "ios"
                ? { lineHeight: INPUT_LINE_HEIGHT }
                : {}),
              ...(Platform.OS === "android"
                ? { textAlignVertical: multiline ? "top" : "center" }
                : {}),
            },
            style,
          ]}
          placeholderTextColor={placeholderTextColor ?? colors.hint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {verified ? (
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        ) : null}
        {endAdornment}
      </View>
      {error ? (
        <Text className="font-sans-medium text-xs text-destructive-text">
          {error}
        </Text>
      ) : hint ? (
        <Text className="font-sans text-xs text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
}
