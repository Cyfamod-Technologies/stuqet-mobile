import { useState } from "react";
import { View } from "react-native";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthScreen } from "~/components/auth/auth-screen";
import { Logo } from "~/components/logo";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DividerLabel } from "~/components/ui/divider-label";
import { SocialButton } from "~/components/ui/social-button";
import { Text } from "~/components/ui/text";
import { useLogin } from "~/features/auth/hooks";
import { loginSchema, type LoginFormValues } from "~/features/auth/schemas";
import { isSocialLoginEnabled, isVendorApp } from "~/lib/config/features";
import { notifyInfo } from "~/lib/utils/toast";

const SUBTITLE = isVendorApp
  ? "Sign in to manage your shop"
  : "Sign in to keep shopping";

// TODO: wire Google / Apple sign-in once the backend exposes OAuth endpoints.
const onSocialPress = (provider: "Google" | "Apple") =>
  notifyInfo({ message: `${provider} sign-in is coming soon` });

export function LoginScreen() {
  const { mutate: login, isPending } = useLogin();
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <AuthScreen>
      <View className="items-center gap-3 pb-2 pt-6">
        <Logo size="lg" />
        <View className="items-center gap-1">
          <Text variant="display" className="text-center">
            Welcome back
          </Text>
          <Text tone="muted" className="text-center">
            {SUBTITLE}
          </Text>
        </View>
      </View>

      <View className="gap-4">
        <FormField
          control={control}
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
        />
        <FormField
          control={control}
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
        />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <Checkbox
              checked={keepLoggedIn}
              onCheckedChange={setKeepLoggedIn}
            />
            <Text variant="label" tone="muted">
              Keep me signed in
            </Text>
          </View>
          <Link href="/(auth)/forgot-password">
            <Text variant="link">Forgot password?</Text>
          </Link>
        </View>
      </View>

      <View className="gap-4 pt-2">
        <Button
          onPress={handleSubmit((values) => login(values))}
          loading={isPending || isSubmitting}
        >
          Sign in
        </Button>

        {isSocialLoginEnabled ? (
          <>
            <DividerLabel />
            <View className="gap-3">
              <SocialButton
                provider="google"
                onPress={() => onSocialPress("Google")}
              />
              <SocialButton
                provider="apple"
                onPress={() => onSocialPress("Apple")}
              />
            </View>
          </>
        ) : null}
      </View>
    </AuthScreen>
  );
}
