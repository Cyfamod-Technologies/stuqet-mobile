import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils/helpers";
import { AuthPage } from "./auth-page";

interface StatusLayoutProps {
  hero: ReactNode;
  title: string;
  /** Body copy; pass a node to embolden a part (e.g. the email address). */
  body: ReactNode;
  /** Extra content under the body (the under-review checklist). */
  extra?: ReactNode;
  /** Buttons pinned to the bottom. */
  footer: ReactNode;
  back?: boolean;
  onBack?: () => void;
  /** Under review uses a slightly smaller 32px title. */
  compactTitle?: boolean;
}

// Centered "status" screen used by check-inbox, password updated, fingerprint
// offer, session expired, suspended and under review: hero, 34px title, 17px
// muted body, buttons pinned at the bottom.
export function StatusLayout({
  hero,
  title,
  body,
  extra,
  footer,
  back,
  onBack,
  compactTitle,
}: StatusLayoutProps) {
  return (
    <AuthPage back={back} onBack={onBack} footer={footer}>
      <View className="flex-1 items-center justify-center gap-3 py-6">
        <View className="mb-3">{hero}</View>
        <Text
          accessibilityRole="header"
          className={cn(
            "text-center font-sans-extrabold",
            compactTitle
              ? "text-[32px] leading-[38px]"
              : "text-[34px] leading-10",
          )}
          style={{ letterSpacing: -0.5 }}
        >
          {title}
        </Text>
        <Text
          tone="muted"
          className="max-w-[310px] text-center font-sans-medium text-[17px] leading-6"
        >
          {body}
        </Text>
        {extra}
      </View>
    </AuthPage>
  );
}
