import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "~/components/screen";
import { BackButton } from "~/components/ui/back-button";

interface AuthPageProps {
  children: ReactNode;
  /** Show the round back button. `true` pops the stack, falling back to login. */
  back?: boolean;
  /** Custom back handler (overrides the default). */
  onBack?: () => void;
  /** Pinned below the scrolling content: the primary action area. */
  footer?: ReactNode;
}

const goBackOrLogin = () => {
  if (router.canGoBack()) router.back();
  else router.replace("/(auth)/login");
};

// Vendor auth scaffold: 24px side padding (the boards use 24, the shared
// AuthScreen uses 20), keyboard avoidance, optional back button and a pinned
// footer. The peach blobs come from the root layout's Backdrop.
export function AuthPage({ children, back, onBack, footer }: AuthPageProps) {
  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Screen
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            gap: 0,
          }}
        >
          {back || onBack ? (
            <BackButton onPress={onBack ?? goBackOrLogin} />
          ) : null}
          {children}
        </Screen>
        {footer ? <View className="gap-3 px-6 pb-6">{footer}</View> : null}
      </KeyboardAvoidingView>
    </View>
  );
}
