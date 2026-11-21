import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DemoFill } from "~/components/demo-fill";
import { Button } from "~/components/ui/button";
import { OtpInput } from "~/components/ui/otp-input";
import { Text } from "~/components/ui/text";
import { AuthField } from "~/features/auth/components/auth-field";
import { AuthHeading } from "~/features/auth/components/auth-heading";
import { AuthPage } from "~/features/auth/components/auth-page";
import { StatusHero } from "~/features/auth/components/status-hero";
import {
  RESET_CODE_LENGTH,
  VENDOR_PASSWORD_MIN_LENGTH,
} from "~/features/auth/constants";
import {
  useCustomerResendCode,
  useCustomerResetPassword,
} from "~/features/auth/customer-hooks";
import {
  vendorResetPasswordSchema,
  type VendorResetPasswordFormValues,
} from "~/features/auth/schemas";
import type { IdentifierMethod } from "~/features/auth/types";

// Reset password board: the account (read only), the 6-digit code and a new
// password. After resetting the person is signed in automatically.
export function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    identifier?: string;
    method?: string;
  }>();
  const identifier = params.identifier ?? "";
  const method: IdentifierMethod =
    params.method === "phone" ? "phone" : "email";

  const { mutate: reset, isPending } = useCustomerResetPassword(
    identifier,
    method,
  );
  const { mutate: resend, isPending: resending } = useCustomerResendCode();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<VendorResetPasswordFormValues>({
    resolver: zodResolver(vendorResetPasswordSchema),
    defaultValues: { code: "", password: "" },
  });

  return (
    <AuthPage
      back
      onBack={() =>
        router.canGoBack()
          ? router.back()
          : router.replace("/(auth)/forgot-password")
      }
    >
      <View className="mt-6">
        <StatusHero icon="lock-closed" size={104} core={68} iconSize={30} />
      </View>

      <View className="mt-5">
        <AuthHeading
          title="Reset password"
          subtitle="Enter the code we sent you and choose a new password."
        />
      </View>

      <View className="mt-6 gap-5">
        <DemoFill
          label="Fill with demo code"
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true"
              ? () => {
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  const { customerSamples } =
                    require("~/demo/customer") as typeof import("~/demo/customer");
                  setValue("code", customerSamples.resetCode, {
                    shouldValidate: true,
                  });
                  setValue("password", customerSamples.newPassword, {
                    shouldValidate: true,
                  });
                }
              : undefined
          }
        />
        <View className="gap-1.5">
          <Text className="font-sans-semibold text-sm leading-[18px]">
            {method === "phone" ? "Phone" : "Email"}
          </Text>
          <View className="min-h-field justify-center rounded-field bg-muted px-4">
            <Text className="font-sans-medium text-base text-muted-foreground">
              {identifier || "—"}
            </Text>
          </View>
        </View>

        <View className="gap-2.5">
          <Text className="font-sans-semibold text-sm leading-[18px]">
            Code
          </Text>
          <Controller
            control={control}
            name="code"
            render={({ field: { value, onChange } }) => (
              <OtpInput
                value={value}
                onChange={onChange}
                length={RESET_CODE_LENGTH}
                error={Boolean(errors.code)}
              />
            )}
          />
          {errors.code ? (
            <Text variant="caption" tone="error" className="font-sans-medium">
              {errors.code.message}
            </Text>
          ) : null}
          <View className="flex-row flex-wrap items-center">
            <Text tone="muted" className="font-sans-medium text-[15px]">
              Didn&apos;t get a code?{" "}
            </Text>
            <Pressable
              disabled={resending || !identifier}
              onPress={() => resend({ identifier, method })}
              accessibilityRole="button"
              className="min-h-11 justify-center"
            >
              <Text className="font-sans-bold text-[15px] text-brand-text underline">
                {resending ? "Sending..." : "Resend code"}
              </Text>
            </Pressable>
          </View>
        </View>

        <AuthField
          control={control}
          name="password"
          type="password"
          label="New password"
          icon="lock-closed-outline"
          placeholder="New password"
          autoComplete="new-password"
          hint={`At least ${VENDOR_PASSWORD_MIN_LENGTH} characters`}
        />

        <Button
          loading={isPending || isSubmitting}
          onPress={handleSubmit((values) => reset(values))}
        >
          Reset password
        </Button>
        <Text
          variant="caption"
          className="text-center font-sans-medium text-[13px]"
        >
          After resetting, you&apos;re signed in automatically.
        </Text>
      </View>
    </AuthPage>
  );
}
