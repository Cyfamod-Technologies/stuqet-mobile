import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Screen } from "~/components/screen";
import { BackButton } from "~/components/ui/back-button";

interface AuthScreenProps {
  children: ReactNode;
  /** Show the round back button above the content. */
  back?: boolean;
  /** Pinned below the scrolling content (primary action area). */
  footer?: ReactNode;
}

// Shared scaffold for every auth screen: off-white background, two soft peach
// blobs in the corners, keyboard avoidance and (optionally) a back button.
export function AuthScreen({ children, back, footer }: AuthScreenProps) {
  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Screen className="bg-transparent" contentContainerStyle={{ gap: 20 }}>
          {back ? <BackButton /> : null}
          {children}
        </Screen>
        {footer ? <View className="gap-3 px-5 pb-6">{footer}</View> : null}
      </KeyboardAvoidingView>
    </View>
  );
}
