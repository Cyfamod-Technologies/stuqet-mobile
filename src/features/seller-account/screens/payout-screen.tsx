import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { FormField } from "~/components/forms/form-field";
import type { ShopInfo } from "~/features/seller-shop/types";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { notifySuccess } from "~/lib/utils/toast";
import { FormScreen } from "../components/form-screen";
import { SwitchRow } from "../components/switch-row";
import { useUpdatePayout } from "../hooks";
import { payoutSchema, type PayoutValues } from "../schemas";

function PayoutForm({ shop }: { shop: ShopInfo }) {
  const router = useRouter();
  const update = useUpdatePayout();

  const { control, handleSubmit } = useForm<PayoutValues>({
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

  return (
    <FormScreen
      title="Payout details"
      footer={
        <Button onPress={onSubmit} loading={update.isPending}>
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

      <FormField
        control={control}
        name="bank_name"
        label="Bank name"
        placeholder="Bank name"
        autoCapitalize="words"
      />
      <FormField
        control={control}
        name="bank_acc_name"
        label="Account name"
        placeholder="Account name"
        autoCapitalize="words"
      />
      <FormField
        control={control}
        name="bank_acc_no"
        type="number"
        label="Account number"
        placeholder="10-digit number"
        maxLength={10}
      />
      <FormField
        control={control}
        name="bank_routing_no"
        type="number"
        label="Routing number (optional)"
        placeholder="Routing number"
      />
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
