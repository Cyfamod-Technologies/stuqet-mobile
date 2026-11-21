import { router } from "expo-router";
import { Button } from "~/components/ui/button";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";

// You're all set (board): the account is ready, "Start ordering" opens Home.
export function AllSetScreen() {
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
      title="You're all set"
      body="Your account is ready. Start exploring food from your school."
      footer={
        <Button onPress={() => router.replace("/(tabs)/home")}>
          Start ordering
        </Button>
      }
    />
  );
}
