import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DemoFill } from "~/components/demo-fill";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DividerLabel } from "~/components/ui/divider-label";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { AuthHeading } from "~/features/auth/components/auth-heading";
import { AuthPage } from "~/features/auth/components/auth-page";
import { SocialRound } from "~/features/auth/components/social-buttons";
import { getApiMessage } from "~/features/auth/errors";
import { isSocialLoginEnabled } from "~/lib/config/features";
import { useThemeColors } from "~/lib/colors";
import { notifyError } from "~/lib/utils/toast";
import { useConfirmContactCode, useSendContactCode, useSignup } from "../hooks";
import {
  CODE_LENGTH,
  SIGNUP_PASSWORD_MIN,
  signupSchema,
  type SignupFormValues,
} from "../schemas";

type Stage = "contact" | "code" | "verified";

const COUNTRY_CODES = ["+234", "+233", "+254", "+27"].map((value) => ({
  label: value,
  value,
}));

// Create account (boards 1 to 3, email and phone): the contact is verified with
// a code BEFORE the account is created, so the form moves through three
// stages: contact (with a Verify button), code (the code field replaces the
// contact field and checks itself on the 6th digit) and verified.
export function CreateAccountScreen() {
  const colors = useThemeColors();
  const [stage, setStage] = useState<Stage>("contact");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [country, setCountry] = useState("+234");
  const [sampleIndex, setSampleIndex] = useState(0);

  const sendCode = useSendContactCode();
  const confirmCode = useConfirmContactCode();
  const signup = useSignup();

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      method: "email",
      email: "",
      phone: "",
      password: "",
      agree: true,
    },
  });
  const method = useWatch({ control, name: "method" });
  const agree = useWatch({ control, name: "agree" });
  const isPhone = method === "phone";

  const contactValue = () => {
    const values = getValues();
    return isPhone
      ? `${country}${values.phone.replace(/^0/, "")}`
      : values.email.trim();
  };
  const shownContact = () =>
    isPhone
      ? `${country} ${getValues("phone").replace(/^0/, "")}`
      : getValues("email");

  const switchMethod = () => {
    setValue("method", isPhone ? "email" : "phone");
    setStage("contact");
    setCode("");
    setCodeError(null);
  };

  const requestCode = async () => {
    const valid = await trigger(isPhone ? "phone" : "email");
    if (!valid) return;
    sendCode.mutate(
      { method, contact: contactValue() },
      {
        onSuccess: () => {
          setStage("code");
          setCode("");
          setCodeError(null);
        },
      },
    );
  };

  const onCodeChange = (text: string) => {
    const next = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(next);
    setCodeError(null);
    // "It checks itself when you enter the 6th digit."
    if (next.length === CODE_LENGTH) {
      confirmCode.mutate(
        { method, contact: contactValue(), code: next },
        {
          onSuccess: () => setStage("verified"),
          onError: (error) =>
            setCodeError(
              getApiMessage(error) ??
                "That code is not right. Check it or ask for a new one.",
            ),
        },
      );
    }
  };

  const fillSample = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { customerSamples } =
      require("~/demo/customer") as typeof import("~/demo/customer");
    const sample =
      customerSamples.signup[sampleIndex % customerSamples.signup.length];
    setSampleIndex((i) => i + 1);
    setValue("name", sample.name, { shouldValidate: true });
    setValue("email", sample.contact, { shouldValidate: true });
    setValue("phone", sample.phone, { shouldValidate: true });
    setValue("password", sample.password, { shouldValidate: true });
  };

  const submit = handleSubmit((values) => {
    if (stage !== "verified") {
      notifyError({
        message: `Verify your ${isPhone ? "phone number" : "email"} first`,
      });
      return;
    }
    signup.mutate({
      name: values.name,
      method: values.method,
      contact: contactValue(),
      password: values.password,
    });
  });

  const person = (
    <Ionicons name="person-outline" size={20} color={colors.hint} />
  );

  return (
    <AuthPage back onBack={() => router.replace("/(auth)/welcome")}>
      <View className="mt-4">
        <AuthHeading
          size="md"
          title="Create an account"
          subtitle="Join Stuqet to order from your campus."
        />
      </View>

      <View className="mt-5 gap-3.5">
        <DemoFill
          onFill={
            process.env.EXPO_PUBLIC_DEMO_MODE === "true"
              ? fillSample
              : undefined
          }
        />

        <FormField
          control={control}
          name="name"
          label="Full name"
          placeholder="Full name"
          autoComplete="name"
          startAdornment={person}
        />

        {stage === "contact" ? (
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-semibold text-sm leading-[18px]">
                {isPhone ? "Phone number" : "Email"}
              </Text>
              <Pressable
                onPress={switchMethod}
                accessibilityRole="button"
                className="min-h-8 justify-center"
              >
                <Text className="font-sans-bold text-xs text-brand-text underline">
                  {isPhone ? "*Use email instead" : "*Use phone number instead"}
                </Text>
              </Pressable>
            </View>
            {isPhone ? (
              <View className="flex-row gap-2.5">
                <Select
                  value={country}
                  onValueChange={setCountry}
                  options={COUNTRY_CODES}
                  className="w-[104px]"
                />
                <View className="flex-1">
                  <FormField
                    control={control}
                    name="phone"
                    type="phone"
                    placeholder="801 234 5678"
                    endAdornment={
                      <VerifyPill
                        onPress={requestCode}
                        loading={sendCode.isPending}
                      />
                    }
                  />
                </View>
              </View>
            ) : (
              <FormField
                control={control}
                name="email"
                type="email"
                placeholder="Email address"
                startAdornment={
                  <Ionicons name="mail-outline" size={20} color={colors.hint} />
                }
                endAdornment={
                  <VerifyPill
                    onPress={requestCode}
                    loading={sendCode.isPending}
                  />
                }
              />
            )}
            <Text variant="meta" className="text-[13px]">
              {isPhone
                ? "We will text you a 6-digit code. Verify your number before you create the account."
                : "Verify your email before you create the account."}
            </Text>
          </View>
        ) : (
          <View className="gap-1.5">
            {stage === "code" ? (
              <DemoFill
                label="Fill the code"
                onFill={
                  process.env.EXPO_PUBLIC_DEMO_MODE === "true"
                    ? () => {
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        const demo =
                          require("~/demo/customer") as typeof import("~/demo/customer");
                        onCodeChange(demo.DEMO_CODE);
                      }
                    : undefined
                }
              />
            ) : null}
            <Input
              label="Verification code"
              value={code}
              onChangeText={onCodeChange}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              placeholder="6-digit code"
              editable={stage === "code"}
              verified={stage === "verified"}
              error={codeError ?? undefined}
              startAdornment={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.hint}
                />
              }
            />
            {stage === "verified" ? (
              <Text
                variant="caption"
                tone="success"
                className="font-sans-bold text-[13px]"
              >
                {isPhone ? "Phone verified" : "Email verified"}
              </Text>
            ) : (
              <Text variant="meta" className="text-[13px]">
                We {isPhone ? "texted" : "sent"} a 6-digit code to{" "}
                <Text className="font-sans-bold text-[13px] text-foreground">
                  {shownContact()}
                </Text>
                . It checks itself when you enter the 6th digit.{" "}
                <Text
                  onPress={requestCode}
                  className="font-sans-bold text-[13px] text-brand-text underline"
                >
                  Resend code
                </Text>
              </Text>
            )}
          </View>
        )}

        <FormField
          control={control}
          name="password"
          type="password"
          label="Password"
          placeholder="Password"
          autoComplete="new-password"
          hint={`At least ${SIGNUP_PASSWORD_MIN} characters`}
          startAdornment={
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.hint}
            />
          }
        />

        <View className="flex-row items-start gap-2.5">
          <View className="pt-0.5">
            <Checkbox
              checked={agree}
              onCheckedChange={(value) => setValue("agree", value)}
            />
          </View>
          <Text className="min-w-0 flex-1 font-sans-medium text-[13px] leading-[18px]">
            By signing up you agree to our{" "}
            <Text
              onPress={() =>
                router.push({
                  pathname: "/(auth)/terms",
                  params: { from: "registration" },
                })
              }
              className="font-sans-bold text-[13px] text-brand-text underline"
            >
              terms and conditions
            </Text>
          </Text>
        </View>

        <Button
          disabled={stage !== "verified" || !agree}
          loading={signup.isPending || isSubmitting}
          onPress={submit}
        >
          Create account
        </Button>
      </View>

      {isSocialLoginEnabled ? (
        <>
          <View className="mt-5">
            <DividerLabel label="Or join with" />
          </View>
          <View className="mt-3.5 flex-row justify-center gap-4">
            <SocialRound provider="google" />
            <SocialRound provider="apple" />
          </View>
        </>
      ) : null}

      <View className="mt-auto flex-row flex-wrap items-center justify-center pt-6">
        <Text tone="muted" className="font-sans-medium text-[15px]">
          Already have an account?{" "}
        </Text>
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          accessibilityRole="link"
          className="min-h-11 justify-center"
        >
          <Text className="font-sans-bold text-[15px] text-brand-text underline">
            Log in
          </Text>
        </Pressable>
      </View>
    </AuthPage>
  );
}

function VerifyPill({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Verify"
      className="h-9 items-center justify-center rounded-full bg-primary px-4 active:opacity-90"
    >
      <Text className="font-sans-bold text-[15px] text-primary-foreground">
        {loading ? "Sending..." : "Verify"}
      </Text>
    </Pressable>
  );
}
