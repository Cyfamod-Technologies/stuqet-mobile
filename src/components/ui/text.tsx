import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils/helpers";

// Urbanist has one family per weight on React Native, so weights are picked via
// `font-sans-*` classes. Use this component (instead of react-native's Text) so
// every string gets the app font and a sensible default colour.
const textVariants = cva("font-sans text-foreground", {
  variants: {
    variant: {
      display: "font-sans-extrabold text-[32px] leading-[38px]",
      title: "font-sans-bold text-2xl leading-8",
      heading: "font-sans-bold text-lg leading-6",
      body: "text-base leading-6",
      label: "font-sans-semibold text-sm",
      caption: "text-xs leading-4 text-muted-foreground",
      link: "font-sans-bold text-sm text-brand-text",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      brand: "text-brand-text",
      error: "text-destructive-text",
      success: "text-success-text",
    },
  },
  defaultVariants: { variant: "body", tone: "default" },
});

export type TextVariantProps = VariantProps<typeof textVariants>;

interface TextProps extends RNTextProps, TextVariantProps {
  className?: string;
}

export function Text({ variant, tone, className, ...props }: TextProps) {
  return (
    <RNText
      className={cn(textVariants({ variant, tone }), className)}
      {...props}
    />
  );
}

export { textVariants };
