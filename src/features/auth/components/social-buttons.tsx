import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import { notifyInfo } from "~/lib/utils/toast";

type Provider = "google" | "apple";
type IconName = ComponentProps<typeof Ionicons>["name"];

const PROVIDERS: Record<Provider, { label: string; icon: IconName }> = {
  google: { label: "Continue with Google", icon: "logo-google" },
  apple: { label: "Continue with Apple", icon: "logo-apple" },
};

// TODO(backend): wire Google / Apple sign-in once the API exposes OAuth for
// sellers (AuthController::socialLogin creates/links a plain user, not a shop).
export const onSocialPress = (provider: Provider) =>
  notifyInfo({
    message: `${PROVIDERS[provider].label.replace("Continue with ", "")} sign-in is coming soon`,
  });

interface SocialProps {
  provider: Provider;
  onPress?: () => void;
}

// Full-width white pill, 52px: the Welcome board.
export function SocialPill({ provider, onPress }: SocialProps) {
  const colors = useThemeColors();
  const config = PROVIDERS[provider];

  return (
    <Pressable
      onPress={onPress ?? (() => onSocialPress(provider))}
      accessibilityRole="button"
      accessibilityLabel={config.label}
      style={SHADOWS.field}
      className="h-[52px] flex-row items-center justify-center gap-2.5 rounded-full border border-border bg-field active:opacity-90"
    >
      <View>
        <Ionicons name={config.icon} size={22} color={colors.foreground} />
      </View>
      <Text className="font-sans-bold text-[17px]">{config.label}</Text>
    </Pressable>
  );
}

// 56px icon-only round button: the Login board.
export function SocialRound({ provider, onPress }: SocialProps) {
  const colors = useThemeColors();
  const config = PROVIDERS[provider];

  return (
    <Pressable
      onPress={onPress ?? (() => onSocialPress(provider))}
      accessibilityRole="button"
      accessibilityLabel={config.label}
      style={SHADOWS.field}
      className="h-14 w-14 items-center justify-center rounded-full border border-border bg-field active:opacity-90"
    >
      <Ionicons name={config.icon} size={24} color={colors.foreground} />
    </Pressable>
  );
}

interface FingerprintButtonProps {
  onPress: () => void;
  /** 56px next to "Log in" (default) or the 72px hero inside the sheet. */
  large?: boolean;
  disabled?: boolean;
}

// Tinted round fingerprint button: next to "Log in" and inside the unlock sheet.
export function FingerprintButton({
  onPress,
  large,
  disabled,
}: FingerprintButtonProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        large ? "Scan fingerprint" : "Log in with fingerprint"
      }
      className={cn(
        "items-center justify-center rounded-full border border-tint-border active:opacity-80",
        large ? "h-[72px] w-[72px] bg-tint-border" : "h-14 w-14 bg-tint",
        disabled && "opacity-50",
      )}
    >
      <Ionicons
        name="finger-print"
        size={large ? 36 : 26}
        color={colors["brand-text"]}
      />
    </Pressable>
  );
}
