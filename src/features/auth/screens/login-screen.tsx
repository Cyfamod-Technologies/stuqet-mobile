import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DividerLabel } from "~/components/ui/divider-label";
import { Notice } from "~/components/ui/notice";
import { Text } from "~/components/ui/text";
import {
  isBiometricAvailable,
  unlockStoredSession,
} from "~/features/auth/biometrics";
import { AuthField } from "~/features/auth/components/auth-field";
import { AuthHeading } from "~/features/auth/components/auth-heading";
import { AuthPage } from "~/features/auth/components/auth-page";
import { BrandMark } from "~/features/auth/components/brand-mark";
import { DemoAccounts } from "~/features/auth/components/demo-accounts";
import { PillTabs } from "~/features/auth/components/pill-tabs";
import {
  FingerprintButton,
  SocialRound,
} from "~/features/auth/components/social-buttons";
import {
  startCustomerSession,
  useCustomerLogin,
} from "~/features/auth/customer-hooks";
import { loginErrorCopy } from "~/features/auth/errors";
import {
  vendorLoginSchema,
  type VendorLoginFormValues,
} from "~/features/auth/schemas";
import type { IdentifierMethod } from "~/features/auth/types";
import { isSocialLoginEnabled } from "~/lib/config/features";
import { getToken, hasToken, isBiometricEnabled } from "~/lib/secure-storage";
import { notifyInfo } from "~/lib/utils/toast";

const METHOD_OPTIONS: { label: string; value: IdentifierMethod }[] = [
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
];

// Customer / rider login board: brand tile, "Welcome back", Email | Phone,
// password, Remember me + Forgot password, Log in + fingerprint, round Google
// and Apple, and "Register now". Riders sign in here too; the account type
// decides which side of the app opens.
export function LoginScreen() {
  const { mutate: login, isPending, error } = useCustomerLogin();
  const [remember, setRemember] = useState(true);
  const [canUnlock, setCanUnlock] = useState(false);

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

  const unlock = async () => {
    const outcome = await unlockStoredSession();
    if (outcome.ok) {
      await startCustomerSession((await getToken()) ?? "");
    } else if (outcome.reason === "no-session") {
      notifyInfo({ message: "Log in with your password first" });
    }
  };

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
            subtitle="Log in to your account."
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
            method === "phone"
              ? "Enter your phone number"
              : "johndoe@example.com"
          }
        />
        <AuthField
          control={control}
          name="password"
          type="password"
          label="Password"
          icon="lock-closed-outline"
          placeholder="Password"
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

        {error ? (
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
          {canUnlock ? <FingerprintButton onPress={unlock} /> : null}
        </View>
      </View>

      {isSocialLoginEnabled ? (
        <>
          <View className="mt-4">
            <DividerLabel label="Or login with" />
          </View>
          <View className="mt-3.5 flex-row justify-center gap-4">
            <SocialRound provider="google" />
            <SocialRound provider="apple" />
          </View>
        </>
      ) : null}

      <View className="mt-auto flex-row flex-wrap items-center justify-center pt-6">
        <Text tone="muted" className="font-sans-medium text-[15px]">
          Don&apos;t have an account?{" "}
        </Text>
        <Pressable
          onPress={() => router.replace("/(auth)/create-account")}
          accessibilityRole="link"
          className="min-h-11 justify-center"
        >
          <Text className="font-sans-bold text-[15px] text-brand-text underline">
            Register now
          </Text>
        </Pressable>
      </View>
    </AuthPage>
  );
}
