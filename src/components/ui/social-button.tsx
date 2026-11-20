import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { Text } from "~/components/ui/text";

type Provider = "google" | "apple";

const PROVIDERS: Record<
  Provider,
  { label: string; icon: "logo-google" | "logo-apple" }
> = {
  google: { label: "Continue with Google", icon: "logo-google" },
  apple: { label: "Continue with Apple", icon: "logo-apple" },
};

interface SocialButtonProps {
  provider: Provider;
  onPress?: () => void;
  disabled?: boolean;
  /** Overrides the default "Continue with …" label (e.g. "Sign up with Google"). */
  label?: string;
}

// White pill with a hairline border — the OAuth buttons sit under the primary
// button and must never compete with it.
export function SocialButton({
  provider,
  onPress,
  disabled,
  label,
}: SocialButtonProps) {
  const colors = useThemeColors();
  const config = PROVIDERS[provider];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label ?? config.label}
      style={SHADOWS.field}
      className={`min-h-button flex-row items-center justify-center gap-3 rounded-pill border border-border bg-field active:opacity-90 ${disabled ? "opacity-50" : ""}`}
    >
      <View>
        <Ionicons name={config.icon} size={22} color={colors.foreground} />
      </View>
      <Text variant="heading" className="text-base">
        {label ?? config.label}
      </Text>
    </Pressable>
  );
}
