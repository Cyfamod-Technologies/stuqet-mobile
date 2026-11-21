import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import type { ShopInfo } from "~/features/seller-shop/types";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { notifySuccess } from "~/lib/utils/toast";
import { bankCodeFor, NIGERIAN_BANKS } from "../banks";
import { ACCOUNT_NUMBER_LENGTH, isAccountResolveEnabled } from "../constants";
import { FieldMessage } from "../components/field-message";
import { FormScreen } from "../components/form-screen";
import { IconFormField, IconInput } from "../components/icon-field";
import { PickerField } from "../components/picker-field";
import { SwitchRow } from "../components/switch-row";
import { useResolveBankAccount, useUpdatePayout } from "../hooks";
import { payoutSchema, type PayoutValues } from "../schemas";

const NOT_FOUND_MESSAGE =
  "We could not find this account. Check the bank and the account number.";
const UNAVAILABLE_MESSAGE =
  "We could not check this account right now. Try again.";

function bankOptions(current: string) {
  const options = NIGERIAN_BANKS.map((bank) => ({
    label: bank.name,
    value: bank.name,
  }));
  // A bank typed by hand before the list existed stays selectable.
  if (current && !options.some((option) => option.value === current)) {
    options.unshift({ label: current, value: current });
  }
  return options;
}

function PayoutForm({ shop }: { shop: ShopInfo }) {
  const router = useRouter();
  const colors = useThemeColors();
  const update = useUpdatePayout();

  const { control, handleSubmit, setValue } = useForm<PayoutValues>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      cash_on_delivery_status: Number(shop.cash_on_delivery_status) === 1,
      bank_payment_status: Number(shop.bank_payment_status) === 1,
      bank_name: shop.bank_name ?? "",
      bank_acc_name: shop.bank_acc_name ?? "",
      bank_acc_no: shop.bank_acc_no ?? "",
      bank_routing_no: shop.bank_routing_no ?? "",
    },
  });

  const [bankName, accountNumber, bankOn] = useWatch({
    control,
    name: ["bank_name", "bank_acc_no", "bank_payment_status"],
  });

  // Account name confirmation (TODO(backend) endpoint, behind a flag).
  const resolveActive = isAccountResolveEnabled && bankOn;
  const resolved = useResolveBankAccount(
    resolveActive ? bankCodeFor(bankName) : null,
    accountNumber,
  );

  useEffect(() => {
    if (!resolveActive) return;
    setValue("bank_acc_name", resolved.accountName, {
      shouldValidate: resolved.accountName !== "",
    });
  }, [resolveActive, resolved.accountName, setValue]);

  const checking = resolveActive && resolved.status === "checking";
  const notFound = resolveActive && resolved.status === "not_found";
  const unavailable = resolveActive && resolved.status === "unavailable";
  const confirmed = resolveActive && resolved.status === "confirmed";
  const blocked = checking || notFound || unavailable;

  // shop-update nulls any payment field that is missing, so all six are sent.
  const onSubmit = handleSubmit((values) => {
    update.mutate(
      {
        cash_on_delivery_status: values.cash_on_delivery_status ? 1 : 0,
        bank_payment_status: values.bank_payment_status ? 1 : 0,
        bank_name: values.bank_name,
        bank_acc_name: values.bank_acc_name,
        bank_acc_no: values.bank_acc_no,
        bank_routing_no: values.bank_routing_no,
      },
      {
        onSuccess: (message) => {
          notifySuccess({ message });
          router.back();
        },
      },
    );
  });

  const accountNumberMessage = notFound
    ? NOT_FOUND_MESSAGE
    : unavailable
      ? UNAVAILABLE_MESSAGE
      : undefined;

  const spinner = checking ? (
    <ActivityIndicator
      size="small"
      color={colors.primary}
      accessibilityLabel="Checking"
    />
  ) : undefined;

  return (
    <FormScreen
      title="Payout details"
      footer={
        <Button
          onPress={onSubmit}
          loading={update.isPending}
          disabled={blocked}
        >
          Save details
        </Button>
      }
    >
      <Card className="overflow-hidden p-0">
        <Controller
          control={control}
          name="cash_on_delivery_status"
          render={({ field }) => (
            <SwitchRow
              title="Cash payment"
              subtitle="Let buyers pay on delivery"
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="bank_payment_status"
          render={({ field }) => (
            <SwitchRow
              title="Bank payment"
              subtitle="Receive payouts by bank transfer"
              value={field.value}
              onValueChange={field.onChange}
              last
            />
          )}
        />
      </Card>

      <Controller
        control={control}
        name="bank_name"
        render={({ field, fieldState }) => (
          <PickerField
            label="Bank name"
            icon="business-outline"
            sheetTitle="Choose your bank"
            placeholder="Choose your bank"
            value={field.value}
            onValueChange={field.onChange}
            options={bankOptions(shop.bank_name ?? "")}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="bank_acc_no"
        render={({ field, fieldState }) => (
          <Input
            label="Account number"
            placeholder="10-digit number"
            keyboardType="number-pad"
            maxLength={ACCOUNT_NUMBER_LENGTH}
            value={field.value}
            onChangeText={(text) => field.onChange(text.replace(/\D/g, ""))}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? accountNumberMessage}
            hint={
              checking
                ? "Checking this account with your bank"
                : `${ACCOUNT_NUMBER_LENGTH} digits`
            }
            endAdornment={spinner}
          />
        )}
      />
      {unavailable ? (
        <Pressable
          onPress={resolved.retry}
          accessibilityRole="button"
          hitSlop={8}
          className="-mt-2 min-h-11 justify-center"
        >
          <Text variant="link">Try again</Text>
        </Pressable>
      ) : null}

      {isAccountResolveEnabled ? (
        <Controller
          control={control}
          name="bank_acc_name"
          render={({ field, fieldState }) => (
            <View className="gap-1.5">
              <IconInput
                label="Account name"
                icon="lock-closed-outline"
                editable={false}
                value={field.value}
                placeholder={
                  checking
                    ? "Checking account…"
                    : "Appears after your account is found"
                }
                className="font-sans-semibold"
                verified={confirmed}
                endAdornment={spinner}
                error={fieldState.error?.message}
              />
              {confirmed ? (
                <FieldMessage tone="success" icon="shield-checkmark-outline">
                  Name confirmed with your bank
                </FieldMessage>
              ) : (
                <FieldMessage tone="muted">
                  {checking
                    ? "Checking with your bank…"
                    : "The name is filled in for you and cannot be edited."}
                </FieldMessage>
              )}
            </View>
          )}
        />
      ) : (
        <IconFormField
          control={control}
          name="bank_acc_name"
          icon="person-outline"
          label="Account name"
          placeholder="Account name"
          autoCapitalize="words"
        />
      )}
    </FormScreen>
  );
}

export function PayoutScreen() {
  const colors = useThemeColors();
  const shop = useShopInfo();

  if (shop.isPending) {
    return (
      <FormScreen title="Payout details">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-[52px] rounded-2xl" />
        <Skeleton className="h-[52px] rounded-2xl" />
        <Skeleton className="h-[52px] rounded-2xl" />
      </FormScreen>
    );
  }

  if (shop.isError) {
    return (
      <FormScreen
        title="Payout details"
        refreshControl={
          <RefreshControl
            refreshing={shop.isRefetching}
            onRefresh={() => {
              void shop.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your payout details"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => shop.refetch()}
        />
      </FormScreen>
    );
  }

  return <PayoutForm shop={shop.data} />;
}
