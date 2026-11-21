import { View } from "react-native";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthScreen } from "~/components/auth/auth-screen";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { HeroBadge } from "~/components/ui/hero-badge";
import { Text } from "~/components/ui/text";
import { useForgotPassword } from "~/features/auth/hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "~/features/auth/schemas";

export function ForgotPasswordScreen() {
  const { mutate: sendReset, isPending } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <AuthScreen back>
      <View className="items-center gap-4 pt-2">
        <HeroBadge icon="lock-closed" />
        <View className="items-center gap-1">
          <Text variant="display" className="text-center">
            Forgot password?
          </Text>
          <Text tone="muted" className="text-center">
            Enter your email and we&apos;ll send you a code to reset it.
          </Text>
        </View>
      </View>

      <FormField
        control={control}
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
      />

      <Button
        onPress={handleSubmit((values) =>
          sendReset({ identifier: values.email, method: "email" }),
        )}
        loading={isPending || isSubmitting}
      >
        Send reset code
      </Button>

      <View className="flex-row items-center justify-center gap-1">
        <Text variant="label" tone="muted">
          Remembered it?
        </Text>
        <Link href="/(auth)/login">
          <Text variant="link">Sign in</Text>
        </Link>
      </View>
    </AuthScreen>
  );
}
