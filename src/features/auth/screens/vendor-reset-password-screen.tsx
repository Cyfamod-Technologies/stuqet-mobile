import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  vendorResetPasswordSchema,
  type VendorResetPasswordFormValues,
} from "~/features/auth/schemas";
import type { IdentifierMethod } from "~/features/auth/types";
import {
  useVendorResendResetCode,
  useVendorResetPassword,
} from "~/features/auth/vendor-hooks";

// Reset password board: 6-digit code + a single new-password field. The
// backend identifies the account by the code alone, so there is no email field
// and no confirm field.
export function VendorResetPasswordScreen() {
  const params = useLocalSearchParams<{
    identifier?: string;
    method?: string;
  }>();
  const identifier = params.identifier ?? "";
  const method: IdentifierMethod =
    params.method === "phone" ? "phone" : "email";

  const { mutate: reset, isPending } = useVendorResetPassword();
  const { mutate: resend, isPending: resending } = useVendorResendResetCode();

  const {
    control,
    handleSubmit,
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
          subtitle={
            <>
              Enter the {RESET_CODE_LENGTH}-digit code sent to{" "}
              {identifier ? (
                <Text className="font-sans-bold text-[17px] text-foreground">
                  {identifier}
                </Text>
              ) : (
                "you"
              )}
              , then choose a new password.
            </>
          }
        />
      </View>

      <View className="mt-6 gap-5">
        <View className="gap-2.5">
          <Text className="font-sans-semibold text-sm leading-[18px]">
            Verification code
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
          placeholder="Choose a new password"
          autoComplete="new-password"
          hint={`At least ${VENDOR_PASSWORD_MIN_LENGTH} characters`}
        />

        <Button
          loading={isPending || isSubmitting}
          onPress={handleSubmit((values) => reset(values))}
        >
          Reset password
        </Button>
      </View>
    </AuthPage>
  );
}
