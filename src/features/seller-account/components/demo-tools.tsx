import { useState } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "~/components/ui/card";
import { ListRow } from "~/components/ui/list-row";
import { Text } from "~/components/ui/text";
import { isDemoMode } from "~/demo/flag";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning,
} from "~/lib/utils/toast";
import { SwitchRow } from "./switch-row";

// One sample per toast variant, a long one, and a burst of four (the stack
// keeps the newest three); each press shows the next.
const SINGLE_TOASTS = [
  () => notifySuccess({ message: "Payout details saved" }),
  () =>
    notifyError({
      message: "No connection",
      description: "Check your internet and try again.",
    }),
  () => notifyInfo({ message: "Google sign-in is coming soon" }),
  () =>
    notifyWarning({
      message: "Your shop is closed",
      description: "Customers can't order until you open it again.",
    }),
  () =>
    notifyError({
      message:
        "We couldn't update this order because the customer has already cancelled it from their phone",
      description:
        "Refresh the list to see the latest status. If it keeps happening, contact support and quote the order number shown on the order page.",
    }),
];
const SAMPLE_TOASTS = [
  ...SINGLE_TOASTS,
  () => SINGLE_TOASTS.slice(0, 4).forEach((show) => show()),
];

// Demo mode only (More screen): throws the sample data away, forces the
// "Session expired" screen, simulates a dropped connection so the error and
// retry states can be seen, and previews the in-app notifications. Renders
// nothing in normal builds.
export function DemoTools() {
  const queryClient = useQueryClient();
  const [offline, setOffline] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  if (!isDemoMode) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const demo = require("~/demo") as typeof import("~/demo");

  const reset = () =>
    Alert.alert(
      "Reset demo data?",
      "Orders, listings, messages and every change you made go back to the sample data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            demo.resetDemoData();
            void queryClient.invalidateQueries();
            notifySuccess({ message: "Demo data reset" });
          },
        },
      ],
    );

  const expire = () => {
    demo.expireDemoSession();
    // Any private request now answers 401; refetching shows the screen.
    void queryClient.invalidateQueries();
  };

  const showSample = () => {
    SAMPLE_TOASTS[sampleIndex % SAMPLE_TOASTS.length]();
    setSampleIndex((i) => i + 1);
  };

  return (
    <>
      <Text className="font-sans-bold text-[13px] text-brand-text">
        Demo tools
      </Text>
      <Card className="overflow-hidden border-dashed border-primary p-0">
        <ListRow
          icon="refresh-outline"
          title="Reset demo data"
          subtitle="Back to the sample orders, listings and chats"
          onPress={reset}
        />
        <ListRow
          icon="time-outline"
          title="Expire my session"
          subtitle="Shows the Session expired screen"
          onPress={expire}
        />
        <ListRow
          icon="notifications-outline"
          title="Preview notifications"
          subtitle="Each tap shows the next kind of toast"
          onPress={showSample}
        />
        <SwitchRow
          title="Simulate no connection"
          subtitle="Every request fails until you switch it off"
          value={offline}
          onValueChange={(value) => {
            setOffline(value);
            demo.setDemoOffline(value);
            if (value) {
              notifyWarning({
                message: "Connection is off",
                description: "Every request fails until you switch it back on.",
              });
            } else {
              notifyInfo({ message: "Connection is back" });
            }
          }}
          last
        />
      </Card>
    </>
  );
}
