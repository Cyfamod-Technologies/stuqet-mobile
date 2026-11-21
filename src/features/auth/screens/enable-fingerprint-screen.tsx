import { useState } from "react";
import { router } from "expo-router";
import { Button } from "~/components/ui/button";
import { enableBiometricUnlock } from "~/features/auth/biometrics";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";
import { setBiometricPrompted } from "~/lib/secure-storage";
import { notifyInfo } from "~/lib/utils/toast";

// Offered once, right after the first successful login on a device that has a
// fingerprint / face sensor. Turning it on stores a flag in secure storage;
// the session token itself stays where it was.
export function EnableFingerprintScreen() {
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    await setBiometricPrompted(true);
    router.replace("/(tabs)");
  };

  const enable = async () => {
    setBusy(true);
    try {
      const outcome = await enableBiometricUnlock();
      if (outcome.ok) {
        router.replace("/(tabs)");
        return;
      }
      if (outcome.reason === "failed") {
        notifyInfo({
          message: "Fingerprint not recognised",
          description: "Try again, or tap Not now and turn it on later.",
        });
      } else if (outcome.reason === "unavailable") {
        notifyInfo({
          message: "Fingerprint isn't available on this device",
          description: "Add a fingerprint in your phone's settings first.",
        });
        await finish();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <StatusLayout
      hero={
        <StatusHero
          icon="finger-print"
          size={168}
          core={88}
          iconSize={50}
          halo={124}
          squircle
        />
      }
      title="Log in faster with your fingerprint"
      body="Unlock Stuqet Vendor with your fingerprint instead of typing your password. You can turn this off any time in settings."
      footer={
        <>
          <Button onPress={enable} loading={busy}>
            Enable fingerprint
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            textClassName="text-[17px] text-brand-text underline"
            onPress={finish}
          >
            Not now
          </Button>
        </>
      }
    />
  );
}
