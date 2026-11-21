import { View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthScreen } from "~/components/auth/auth-screen";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { Notice } from "~/components/ui/notice";
import { OtpInput } from "~/components/ui/otp-input";
import { Text } from "~/components/ui/text";
import { useResetPassword } from "~/features/auth/hooks";
import {
  OTP_LENGTH,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "~/features/auth/schemas";

export function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "", rePassword: "" },
  });

  return (
    <AuthScreen back>
      <View className="gap-1 pt-2">
        <Text variant="display">Reset password</Text>
        <Text tone="muted">
          Enter the {OTP_LENGTH}-digit code we emailed you and choose a new
          password.
        </Text>
      </View>

      {email ? (
        <Notice tone="info" title="Code sent">
          Check {email}. It may take a minute to arrive.
        </Notice>
      ) : null}

      <View className="gap-1.5">
        <Text variant="label">Reset code</Text>
        <Controller
          control={control}
          name="otp"
          render={({ field: { value, onChange } }) => (
            <OtpInput
              value={value}
              onChange={onChange}
              length={OTP_LENGTH}
              error={Boolean(errors.otp)}
            />
          )}
        />
        {errors.otp ? (
          <Text variant="caption" tone="error" className="font-sans-medium">
            {errors.otp.message}
          </Text>
        ) : null}
      </View>

      <FormField
        control={control}
        name="password"
        type="password"
        label="New password"
        placeholder="Create a new password"
        autoComplete="new-password"
        hint="8+ characters with upper and lower case, a number and a symbol."
      />
      <FormField
        control={control}
        name="rePassword"
        type="password"
        label="Confirm password"
        placeholder="Repeat the new password"
        autoComplete="new-password"
      />

      <Button
        onPress={handleSubmit((values) =>
          resetPassword({ code: values.otp, password: values.password }),
        )}
        loading={isPending || isSubmitting}
      >
        Reset password
      </Button>

      <View className="flex-row items-center justify-center gap-1">
        <Text variant="label" tone="muted">
          Didn&apos;t get a code?
        </Text>
        <Link href="/(auth)/forgot-password">
          <Text variant="link">Resend</Text>
        </Link>
      </View>
    </AuthScreen>
  );
}
