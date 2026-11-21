import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DividerLabel } from "~/components/ui/divider-label";
import { Notice } from "~/components/ui/notice";
import { Text } from "~/components/ui/text";
import { isBiometricAvailable } from "~/features/auth/biometrics";
import { AuthField } from "~/features/auth/components/auth-field";
import { DemoAccounts } from "~/features/auth/components/demo-accounts";
import { AuthHeading } from "~/features/auth/components/auth-heading";
import { AuthPage } from "~/features/auth/components/auth-page";
import { BrandMark } from "~/features/auth/components/brand-mark";
import { PillTabs } from "~/features/auth/components/pill-tabs";
import {
  FingerprintButton,
  SocialRound,
} from "~/features/auth/components/social-buttons";
import { classifyLoginError, loginErrorCopy } from "~/features/auth/errors";
import { openWebRegistration } from "~/features/auth/registration";
import {
  vendorLoginSchema,
  type VendorLoginFormValues,
} from "~/features/auth/schemas";
import type { IdentifierMethod } from "~/features/auth/types";
import { useVendorLogin } from "~/features/auth/vendor-hooks";
import { isSocialLoginEnabled } from "~/lib/config/features";
import { hasToken, isBiometricEnabled } from "~/lib/secure-storage";

const METHOD_OPTIONS: { label: string; value: IdentifierMethod }[] = [
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
];

// Login board: brand tile, "Welcome back", Email | Phone, password, Remember
// me + Forgot password, Log in + fingerprint, round Google / Apple, and a
// "Create a shop" link (opens the web registration).
export function VendorLoginScreen() {
  const { unlock } = useLocalSearchParams<{ unlock?: string }>();
  const { mutate: login, isPending, error } = useVendorLogin();
  const [remember, setRemember] = useState(true);
  const [canUnlock, setCanUnlock] = useState(false);
  const autoOpened = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<VendorLoginFormValues>({
    resolver: zodResolver(vendorLoginSchema),
    defaultValues: { method: "email", identifier: "", password: "" },
  });
  const method = useWatch({ control, name: "method" });

  // The fingerprint button needs all three: the user turned it on, the device
  // can do it, and a session token is still stored to unlock.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        isBiometricEnabled(),
        hasToken(),
        isBiometricAvailable(),
      ]).then(([enabled, stored, hardware]) => {
        if (active) setCanUnlock(enabled && stored && hardware);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  // Cold start with a stored session and fingerprint on: open the sheet.
  useEffect(() => {
    if (unlock === "1" && canUnlock && !autoOpened.current) {
      autoOpened.current = true;
      router.push("/(auth)/fingerprint-login");
    }
  }, [unlock, canUnlock]);

  // Suspended / under review navigate to their own screens instead.
  const failure = error ? classifyLoginError(error) : null;
  const showError = failure === "invalid-credentials" || failure === "other";

  const changeMethod = (next: IdentifierMethod) => {
    setValue("method", next);
    setValue("identifier", "");
    clearErrors("identifier");
  };

  return (
    <AuthPage back onBack={() => router.replace("/(auth)/welcome")}>
      <View className="mt-[18px] gap-1.5">
        <BrandMark size={52} glow />
        <View className="mt-3">
          <AuthHeading
            title="Welcome back"
            subtitle="Log in to manage your shop."
          />
        </View>
      </View>

      <View className="mt-5 gap-3.5">
        <DemoAccounts
          onPick={({ email, password }) => {
            setValue("method", "email");
            setValue("identifier", email, { shouldValidate: true });
            setValue("password", password, { shouldValidate: true });
          }}
        />
        <PillTabs
          options={METHOD_OPTIONS}
          value={method}
          onChange={changeMethod}
        />

        <AuthField
          key={method}
          control={control}
          name="identifier"
          type={method === "phone" ? "phone" : "email"}
          label={method === "phone" ? "Phone number" : "Email"}
          icon={method === "phone" ? "call-outline" : "mail-outline"}
          placeholder={
            method === "phone" ? "Enter your phone number" : "Enter your email"
          }
        />
        <AuthField
          control={control}
          name="password"
          type="password"
          label="Password"
          icon="lock-closed-outline"
          placeholder="Enter your password"
        />

        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setRemember((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
            className="min-h-11 flex-row items-center gap-2.5"
          >
            <Checkbox checked={remember} onCheckedChange={setRemember} />
            <Text className="font-sans-semibold text-[15px]">Remember me</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(auth)/forgot-password")}
            accessibilityRole="link"
            className="min-h-11 justify-center"
          >
            <Text className="font-sans-bold text-[15px] text-brand-text underline">
              Forgot password?
            </Text>
          </Pressable>
        </View>

        {showError ? (
          <Notice tone="error" title="Couldn't log you in">
            {loginErrorCopy(error)}
          </Notice>
        ) : null}

        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            loading={isPending || isSubmitting}
            onPress={handleSubmit((values) =>
              login({
                email: values.identifier.trim(),
                password: values.password,
                method: values.method,
                remember,
              }),
            )}
          >
            Log in
          </Button>
          {canUnlock ? (
            <FingerprintButton
              onPress={() => router.push("/(auth)/fingerprint-login")}
            />
          ) : null}
        </View>
      </View>

      {isSocialLoginEnabled ? (
        <>
          <View className="mt-4">
            <DividerLabel />
          </View>
          <View className="mt-3.5 flex-row justify-center gap-4">
            <SocialRound provider="google" />
            <SocialRound provider="apple" />
          </View>
        </>
      ) : null}

      <View className="mt-auto flex-row flex-wrap items-center justify-center pt-6">
        <Text tone="muted" className="font-sans-medium text-[15px]">
          New to Stuqet?{" "}
        </Text>
        <Pressable
          onPress={openWebRegistration}
          accessibilityRole="link"
          className="min-h-11 justify-center"
        >
          <Text className="font-sans-bold text-[15px] text-brand-text underline">
            Create a shop
          </Text>
        </Pressable>
      </View>
    </AuthPage>
  );
}
