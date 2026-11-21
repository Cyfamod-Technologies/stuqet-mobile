import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DemoFill } from "~/components/demo-fill";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { getApiMessage } from "~/features/auth/errors";
import { useThemeColors } from "~/lib/colors";
import { useBanks, useResolveAccount } from "../hooks";

export function usePayoutForm(initial?: {
  bankCode: string;
  accountNumber: string;
}) {
  const [bankCode, setBankCode] = useState(initial?.bankCode ?? "");
  const [accountNumber, setAccountNumber] = useState(
    initial?.accountNumber ?? "",
  );
  const resolution = useResolveAccount(bankCode, accountNumber);
  const accountName = resolution.data?.accountName ?? "";
  return {
    bankCode,
    setBankCode,
    accountNumber,
    setAccountNumber,
    resolution,
    accountName,
    ready: Boolean(accountName),
  };
}

export type PayoutForm = ReturnType<typeof usePayoutForm>;

// Bank name, 10-digit account number and the account name. The name is never
// typed: it is looked up with the bank (checking, not found, confirmed) and
// shown locked. Used by rider onboarding step 4 and Payout details.
export function PayoutFields({ form }: { form: PayoutForm }) {
  const colors = useThemeColors();
  const banks = useBanks();
  const [sample, setSample] = useState(0);
  const { resolution, accountNumber } = form;
  const complete = /^\d{10}$/.test(accountNumber);
  const notFound = complete && resolution.isError;
  const checking = complete && resolution.isFetching;

  const fill = () => {
    const { customerSamples } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("~/demo/customer") as typeof import("~/demo/customer");
    const item = customerSamples.payout[sample % customerSamples.payout.length];
    setSample((n) => n + 1);
    form.setBankCode(item.bankCode);
    form.setAccountNumber(item.accountNumber);
  };

  return (
    <View className="gap-3.5">
      <DemoFill
        onFill={process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? fill : undefined}
      />
      <Select
        label="Bank name"
        placeholder="Choose your bank"
        value={form.bankCode}
        options={(banks.data ?? []).map((b) => ({
          label: b.name,
          value: b.code,
        }))}
        onValueChange={form.setBankCode}
      />
      <Input
        label="Account number"
        value={form.accountNumber}
        onChangeText={(t) =>
          form.setAccountNumber(t.replace(/\D/g, "").slice(0, 10))
        }
        keyboardType="number-pad"
        maxLength={10}
        placeholder="10-digit number"
        error={
          notFound
            ? (getApiMessage(resolution.error) ??
              "We could not find this account. Check the bank and the account number.")
            : undefined
        }
        hint={checking ? "Checking this account with your bank" : "10 digits"}
      />
      <View className="gap-1.5">
        <Input
          label="Account name"
          value={form.accountName}
          editable={false}
          verified={Boolean(form.accountName)}
          placeholder={
            checking
              ? "Checking account…"
              : "Appears after your account is found"
          }
          startAdornment={
            form.accountName ? (
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.hint}
              />
            ) : undefined
          }
        />
        {form.accountName ? (
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={colors["success-text"]}
            />
            <Text
              variant="caption"
              tone="success"
              className="font-sans-bold text-[13px]"
            >
              Name confirmed with your bank
            </Text>
          </View>
        ) : (
          <Text variant="meta" className="text-[13px]">
            {checking
              ? "Checking with your bank…"
              : "The name is filled in for you and cannot be edited."}
          </Text>
        )}
      </View>
    </View>
  );
}
