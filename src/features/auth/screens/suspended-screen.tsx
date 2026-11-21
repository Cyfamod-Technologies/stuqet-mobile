import { router } from "expo-router";
import * as Linking from "expo-linking";
import { Button } from "~/components/ui/button";
import { SUPPORT_EMAIL } from "~/features/auth/constants";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";
import { notifyInfo } from "~/lib/utils/toast";

// Shown when POST /auth/login answers 401 "User is banned".
export function SuspendedScreen() {
  const contactSupport = async () => {
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    } catch {
      notifyInfo({
        message: "No email app found",
        description: "Contact Stuqet support from your email account.",
      });
    }
  };

  return (
    <StatusLayout
      hero={
        <StatusHero
          icon="ban"
          size={148}
          core={100}
          iconSize={46}
          tone="danger"
        />
      }
      title="Account suspended"
      body="Your seller account has been suspended, so you can't log in right now. Contact Stuqet support to find out why and how to get it restored."
      footer={
        <>
          <Button onPress={contactSupport}>Contact support</Button>
          <Button
            variant="outline"
            textClassName="text-[17px]"
            onPress={() => router.replace("/(auth)/login")}
          >
            Back to log in
          </Button>
        </>
      }
    />
  );
}
