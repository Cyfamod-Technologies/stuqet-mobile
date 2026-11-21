import { useState } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "~/components/ui/card";
import { ListRow } from "~/components/ui/list-row";
import { Text } from "~/components/ui/text";
import { Toggle } from "~/components/ui/toggle";
import { isDemoMode } from "~/demo/flag";
import { useRoleStore } from "~/lib/stores/role-store";
import { notifyInfo, notifySuccess, notifyWarning } from "~/lib/utils/toast";
import { getToken } from "~/lib/secure-storage";

// Demo mode only (Profile): throws the sample data away, forces the "session
// expired" state, simulates a dropped connection so the error and retry states
// show, and (for riders) hands out a new delivery. Renders nothing otherwise.
export function DemoTools() {
  const queryClient = useQueryClient();
  const role = useRoleStore((s) => s.role);
  const [offline, setOffline] = useState(false);
  if (!isDemoMode) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const demo = require("~/demo/customer") as typeof import("~/demo/customer");

  const reset = () =>
    Alert.alert(
      "Reset demo data?",
      "Orders, cart, addresses, deliveries and every change you made go back to the sample data.",
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

  const assign = async () => {
    const persona = demo.personaFromToken(await getToken());
    if (persona && demo.assignDemoDelivery(persona)) {
      void queryClient.invalidateQueries({ queryKey: ["rider"] });
      notifySuccess({
        message: "New delivery assigned",
        description: "Check Home or Deliveries.",
      });
    } else {
      notifyInfo({
        message: "Only an approved rider can be assigned deliveries",
      });
    }
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
          subtitle="Back to the sample orders, cart and chats"
          onPress={reset}
        />
        <ListRow
          icon="time-outline"
          title="Expire my session"
          subtitle="Every request answers 401"
          onPress={() => {
            demo.expireDemoSession();
            void queryClient.invalidateQueries();
          }}
        />
        {role === "rider" ? (
          <ListRow
            icon="bicycle-outline"
            title="Assign me a delivery"
            subtitle="A new delivery appears in Home and Deliveries"
            onPress={assign}
          />
        ) : null}
        <ListRow
          icon="cloud-offline-outline"
          title="Simulate no connection"
          subtitle="Every request fails until you switch it off"
          right={
            <Toggle
              label="Simulate no connection"
              value={offline}
              onValueChange={(value) => {
                setOffline(value);
                demo.setDemoOffline(value);
                if (value) notifyWarning({ message: "Connection is off" });
                else notifyInfo({ message: "Connection is back" });
              }}
            />
          }
          last
        />
      </Card>
    </>
  );
}
