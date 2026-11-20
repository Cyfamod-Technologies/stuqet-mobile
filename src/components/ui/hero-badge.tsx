import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

type HeroTone = "brand" | "success" | "error";

const TONES: Record<
  HeroTone,
  { ring: string; core: string; color: "primary" | "success" | "destructive" }
> = {
  brand: { ring: "bg-tint", core: "bg-tint-border", color: "primary" },
  success: { ring: "bg-success-tint", core: "bg-success/20", color: "success" },
  error: {
    ring: "bg-destructive-tint",
    core: "bg-destructive/20",
    color: "destructive",
  },
};

interface HeroBadgeProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone?: HeroTone;
  className?: string;
}

// Concentric tinted circles around an icon: the status illustration on
// "check your inbox", "under review", "password reset", "suspended" screens.
export function HeroBadge({ icon, tone = "brand", className }: HeroBadgeProps) {
  const colors = useThemeColors();
  const t = TONES[tone];

  return (
    <View
      className={cn(
        "h-32 w-32 items-center justify-center rounded-full",
        t.ring,
        className,
      )}
    >
      <View
        className={cn(
          "h-24 w-24 items-center justify-center rounded-full",
          t.core,
        )}
      >
        <Ionicons name={icon} size={44} color={colors[t.color]} />
      </View>
    </View>
  );
}
