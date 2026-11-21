import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DemoFill } from "~/components/demo-fill";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { AuthField } from "~/features/auth/components/auth-field";
import { AuthHeading } from "~/features/auth/components/auth-heading";
import { AuthPage } from "~/features/auth/components/auth-page";
import { PillTabs } from "~/features/auth/components/pill-tabs";
import { StatusHero } from "~/features/auth/components/status-hero";
import { useCustomerForgotPassword } from "~/features/auth/customer-hooks";
import {
  vendorForgotPasswordSchema,
  type VendorForgotPasswordFormValues,
} from "~/features/auth/schemas";
import type { IdentifierMethod } from "~/features/auth/types";

const METHOD_OPTIONS: { label: string; value: IdentifierMethod }[] = [
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
];

// Forgot password board: lock hero, copy, Email | Phone, "Send password reset
// code" and "Remembered it? Log in".
export function ForgotPasswordScreen() {
  const { mutate: sendCode, isPending } = useCustomerForgotPassword();

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<VendorForgotPasswordFormValues>({
    resolver: zodResolver(vendorForgotPasswordSchema),
    defaultValues: { method: "email", identifier: "" },
  });
  const method = useWatch({ control, name: "method" });

  const changeMethod = (next: IdentifierMethod) => {
    setValue("method", next);
    setValue("identifier", "");
    clearErrors("identifier");
  };

  return (
    <AuthPage back>
      <View className="mt-6">
        <StatusHero icon="lock-closed" size={104} core={68} iconSize={30} />
      </View>

      <View className="mt-5">
        <AuthHeading
          size="md"
          title="Forgot password?"
          subtitle="Enter your email address or phone number to recover your password."
        />
      </View>

      <View className="mt-[26px] gap-4">
        <DemoFill
          label="Fill with demo email"
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true"
              ? () => {
                  setValue("method", "email");
                  setValue("identifier", "ada@student.edu", {
                    shouldValidate: true,
                  });
                }
              : undefined
          }
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
          mutedLabel
        />
        <Button
          loading={isPending || isSubmitting}
          onPress={handleSubmit((values) =>
            sendCode({
              identifier: values.identifier.trim(),
              method: values.method,
            }),
          )}
        >
          Send password reset code
        </Button>
      </View>

      <View className="mt-auto flex-row flex-wrap items-center justify-center pt-6">
        <Text tone="muted" className="font-sans-medium text-sm">
          Remembered it?{" "}
        </Text>
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          accessibilityRole="link"
          className="min-h-11 justify-center"
        >
          <Text className="font-sans-bold text-sm text-brand-text underline">
            Log in
          </Text>
        </Pressable>
      </View>
    </AuthPage>
  );
}
