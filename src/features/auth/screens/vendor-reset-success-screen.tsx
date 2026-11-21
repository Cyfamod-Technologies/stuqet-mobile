import { router } from "expo-router";
import { Button } from "~/components/ui/button";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";

// "Password updated" board. The primary action is "Log in" (the customer
// screen says "Back to sign in").
export function VendorResetSuccessScreen() {
  return (
    <StatusLayout
      hero={
        <StatusHero
          icon="checkmark"
          size={164}
          core={84}
          iconSize={44}
          halo={120}
        />
      }
      title="Password updated"
      body="Your password has been changed. Log in with your new password to get back to your shop."
      footer={
        <Button onPress={() => router.replace("/(auth)/login")}>Log in</Button>
      }
    />
  );
}
