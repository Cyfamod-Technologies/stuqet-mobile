import { router } from "expo-router";
import { Button } from "~/components/ui/button";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";

// "Password updated". The reset already signed the person in, so the action
// opens the app.
export function ResetSuccessScreen() {
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
      body="Your password has been changed and you are signed in."
      footer={
        <Button onPress={() => router.replace("/(tabs)/home")}>Continue</Button>
      }
    />
  );
}
