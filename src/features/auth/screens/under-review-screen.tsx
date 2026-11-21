import { useCallback, useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Button } from "~/components/ui/button";
import { Notice } from "~/components/ui/notice";
import { Text } from "~/components/ui/text";
import AuthService from "~/features/auth/api";
import { StatusHero } from "~/features/auth/components/status-hero";
import { StatusLayout } from "~/features/auth/components/status-layout";
import { classifyLoginError } from "~/features/auth/errors";
import { pendingLogin } from "~/features/auth/pending-login";
import { startVendorSession } from "~/features/auth/vendor-hooks";
import { SHADOWS, useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";

type StepState = "done" | "current" | "todo";

const STEPS: { label: string; state: StepState }[] = [
  { label: "Details received", state: "done" },
  { label: "Review by the Stuqet team", state: "current" },
  { label: "Approved, start selling", state: "todo" },
];

function StepDot({ state }: { state: StepState }) {
  const colors = useThemeColors();

  if (state === "done") {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-full bg-success">
        <Ionicons
          name="checkmark"
          size={15}
          color={colors["primary-foreground"]}
        />
      </View>
    );
  }
  return (
    <View
      className={cn(
        "h-6 w-6 rounded-full",
        state === "current"
          ? "border-2 border-primary bg-tint"
          : "bg-secondary",
      )}
    />
  );
}

// Shown when POST /auth/login answers 401 "Your seller account is under
// review...". "Check again" retries the login with the credentials just typed,
// which are kept in memory only (see pending-login.ts).
export function UnderReviewScreen() {
  const [checking, setChecking] = useState(false);
  const [stillPending, setStillPending] = useState(false);

  // Drop the in-memory credentials as soon as the screen loses focus.
  useFocusEffect(
    useCallback(
      () => () => {
        pendingLogin.clear();
      },
      [],
    ),
  );

  const checkAgain = async () => {
    const credentials = pendingLogin.get();
    if (!credentials) {
      router.replace("/(auth)/login");
      return;
    }
    setChecking(true);
    setStillPending(false);
    try {
      const token = await AuthService.login(credentials);
      await startVendorSession(token.access, credentials.remember ?? true);
    } catch (error) {
      switch (classifyLoginError(error)) {
        case "under-review":
          setStillPending(true);
          break;
        case "suspended":
          router.replace("/(auth)/suspended");
          break;
        default:
          router.replace("/(auth)/login");
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <StatusLayout
      compactTitle
      hero={
        <StatusHero icon="time-outline" size={132} core={88} iconSize={42} />
      }
      title="Your shop is under review"
      body="Thanks for registering. We're checking your details and will notify you as soon as your shop is approved."
      extra={
        <View className="mt-[18px] w-full gap-3">
          <View
            style={SHADOWS.field}
            className="w-full gap-3.5 rounded-[20px] border border-border bg-card px-5 py-[18px]"
          >
            {STEPS.map((step) => (
              <View key={step.label} className="flex-row items-center gap-3">
                <StepDot state={step.state} />
                <Text
                  className={cn(
                    "min-w-0 flex-1 text-base",
                    step.state === "done" && "font-sans-semibold",
                    step.state === "current" && "font-sans-bold",
                    step.state === "todo" &&
                      "font-sans-semibold text-muted-foreground",
                  )}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
          {stillPending ? (
            <Notice tone="info" title="Still under review">
              We&apos;ll notify you as soon as your shop is approved.
            </Notice>
          ) : null}
        </View>
      }
      footer={
        <>
          <Button onPress={checkAgain} loading={checking}>
            Check again
          </Button>
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
