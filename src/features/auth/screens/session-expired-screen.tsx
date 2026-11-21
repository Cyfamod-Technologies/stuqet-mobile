import { router } from "expo-router";
import { Button } from "~/components/ui/button";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";

// Shown when an authenticated request is answered with 401 (the session token
// is no longer valid). See src/features/auth/session-expiry.ts.
export function SessionExpiredScreen() {
  return (
    <StatusLayout
      hero={
        <StatusHero
          icon="lock-closed-outline"
          size={148}
          core={100}
          iconSize={46}
        />
      }
      title="Session expired"
      body="For your security we logged you out after a while. Log in again to carry on managing your shop."
      footer={
        <Button onPress={() => router.replace("/(auth)/login")}>Log in</Button>
      }
    />
  );
}
