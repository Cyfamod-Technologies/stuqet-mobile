import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { ListRow } from "~/components/ui/list-row";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { FormField } from "~/components/forms/form-field";
import { FormScreen } from "~/features/seller-account/components/form-screen";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useMoneySettings, useRequestWithdrawal } from "../hooks";
import { createWithdrawSchema, type WithdrawFormValues } from "../schemas";
import {
  currencySymbol,
  formatLike,
  parseMoney,
  parseTypedAmount,
  tidyMoney,
} from "../utils";

function payoutSummary(
  bankName: string | null,
  accountNumber: string | null,
): string {
  if (!bankName && !accountNumber) return "Not set up yet. Tap to add.";
  const last4 = accountNumber ? `••••${accountNumber.slice(-4)}` : "";
  return [bankName, last4].filter(Boolean).join(" · ");
}

export function WithdrawScreen() {
  const router = useRouter();
  const shop = useShopInfo();
  const settings = useMoneySettings();
  const withdraw = useRequestWithdrawal();

  const balanceText = shop.data?.admin_to_pay;
  const balance = parseMoney(balanceText);
  const min = settings.data?.minimumWithdraw ?? null;

  const schema = useMemo(
    () =>
      createWithdrawSchema({
        min,
        max: Number.isNaN(balance) ? null : balance,
        format: (value) => formatLike(balanceText, value),
      }),
    [min, balance, balanceText],
  );

  const { control, handleSubmit } = useForm<WithdrawFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", message: "" },
  });

  const onSubmit = handleSubmit(({ amount, message }) => {
    const value = parseTypedAmount(amount);
    withdraw.mutate(
      { amount: value, message: message || undefined },
      {
        onSuccess: () =>
          router.replace({
            pathname: "/(tabs)/money/withdraw-done",
            params: { amount: formatLike(balanceText, value) },
          }),
      },
    );
  });

  if (shop.isError) {
    return (
      <FormScreen title="Withdraw money">
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your balance"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => shop.refetch()}
        />
      </FormScreen>
    );
  }

  const symbol = currencySymbol(balanceText);
  const hint =
    min !== null
      ? `Enter an amount between ${formatLike(balanceText, min)} and your available balance.`
      : "Enter an amount up to your available balance.";

  return (
    <FormScreen
      title="Withdraw money"
      footer={
        <Button
          onPress={onSubmit}
          loading={withdraw.isPending}
          disabled={shop.isPending}
        >
          Send request
        </Button>
      }
    >
      <Card className="gap-0.5 p-4">
        <Text variant="label" tone="muted">
          Available balance
        </Text>
        {shop.isPending || !balanceText ? (
          <Skeleton className="mt-1 h-9 w-40" />
        ) : (
          <Text variant="display" className="text-[32px]">
            {tidyMoney(balanceText)}
          </Text>
        )}
      </Card>

      <FormField
        control={control}
        name="amount"
        type="number"
        keyboardType="decimal-pad"
        label={symbol ? `Amount (${symbol})` : "Amount"}
        placeholder="Enter amount"
        hint={hint}
      />

      <FormField
        control={control}
        name="message"
        label="Message (optional)"
        placeholder="Add a note for the team"
        multiline
        textAlignVertical="top"
        className="min-h-[72px]"
        maxLength={500}
      />

      <Card className="overflow-hidden p-0">
        <ListRow
          icon="business-outline"
          title="Payout account"
          subtitle={
            shop.data
              ? payoutSummary(shop.data.bank_name, shop.data.bank_acc_no)
              : undefined
          }
          onPress={() => router.push("/(tabs)/more/payout")}
          last
        />
      </Card>
    </FormScreen>
  );
}
