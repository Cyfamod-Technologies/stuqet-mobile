import { useEffect, useRef } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";
import { useCustomerLogout } from "~/features/auth/customer-hooks";
import { useApplicationStatus } from "~/features/rider-account/hooks";
import { useRoleStore } from "~/lib/stores/role-store";
import { notifySuccess } from "~/lib/utils/toast";
import { useRiderApplication } from "../store";

// Application under review: an hourglass, "Pending approval" and two choices,
// order food while waiting, or log out. The status is checked when the screen
// opens, again every few seconds, and the rider is taken to Home once approved.
export function RiderReviewScreen() {
  const status = useApplicationStatus();
  const setRole = useRoleStore((s) => s.setRole);
  const logout = useCustomerLogout();
  const reset = useRiderApplication((s) => s.reset);
  const approved = status.data === "approved";
  const handled = useRef(false);

  // The application is saved now; the form answers are no longer needed.
  useEffect(() => reset, [reset]);

  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(() => void status.refetch(), 8000);
      return () => clearInterval(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (approved && !handled.current) {
      handled.current = true;
      setRole("rider");
      notifySuccess({
        message: "Application approved",
        description: "You can take deliveries now.",
      });
      router.replace("/(tabs)/home");
    }
  }, [approved, setRole]);

  return (
    <StatusLayout
      hero={
        <StatusHero
          icon="hourglass-outline"
          size={148}
          core={84}
          iconSize={36}
          halo={116}
        />
      }
      title="Application under review"
      body="We are checking your details. You will get a notification when you can start taking deliveries."
      extra={
        <View className="mt-1">
          <Badge label="Pending approval" variant="warning" />
        </View>
      }
      footer={
        <>
          <Button
            onPress={() => {
              setRole("customer");
              router.replace("/(tabs)/home");
            }}
          >
            Order food while you wait
          </Button>
          <Button
            variant="outline"
            loading={logout.isPending}
            onPress={() => logout.mutate()}
          >
            Log out
          </Button>
        </>
      }
    />
  );
}
