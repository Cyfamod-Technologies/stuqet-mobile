import { View } from "react-native";
import { router } from "expo-router";
import { AuthScreen } from "~/components/auth/auth-screen";
import { Button } from "~/components/ui/button";
import { HeroBadge } from "~/components/ui/hero-badge";
import { Text } from "~/components/ui/text";

export function ResetSuccessScreen() {
  return (
    <AuthScreen
      footer={
        <Button onPress={() => router.replace("/(auth)/login")}>
          Back to sign in
        </Button>
      }
    >
      <View className="flex-1 items-center justify-center gap-5 pt-24">
        <HeroBadge icon="checkmark" tone="success" />
        <View className="items-center gap-1">
          <Text variant="display" className="text-center">
            Password updated
          </Text>
          <Text tone="muted" className="text-center">
            Your password has been changed. Sign in with your new password.
          </Text>
        </View>
      </View>
    </AuthScreen>
  );
}
