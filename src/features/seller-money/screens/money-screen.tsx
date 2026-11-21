import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Notice } from "~/components/ui/notice";
import { ScreenHeader } from "~/components/ui/screen-header";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { BalanceCard } from "../components/balance-card";
import { HistoryList } from "../components/history-list";
import {
  CommissionRow,
  PaymentRow,
  WithdrawalRow,
} from "../components/history-rows";
import {
  useCommissions,
  useMoneySettings,
  usePayments,
  useWithdrawals,
} from "../hooks";

type MoneyTab = "payments" | "withdrawals" | "commission";

const TABS = [
  { label: "Payments", value: "payments" },
  { label: "Withdrawals", value: "withdrawals" },
  { label: "Commission", value: "commission" },
];

export function MoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<MoneyTab>("payments");

  const shop = useShopInfo();
  const settings = useMoneySettings();
  const payments = usePayments({ enabled: tab === "payments" });
  const withdrawals = useWithdrawals({ enabled: tab === "withdrawals" });
  const commissions = useCommissions({ enabled: tab === "commission" });

  const rate = settings.data?.fixedCommissionRate;

  const header = (
    <View className="gap-4">
      <ScreenHeader title="Money" />
      <BalanceCard
        balance={shop.data?.admin_to_pay}
        loading={shop.isPending}
        error={shop.isError}
        onRetry={() => shop.refetch()}
        onWithdraw={() => router.push("/(tabs)/money/withdraw")}
      />
      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={(value) => setTab(value as MoneyTab)}
      />
      {tab === "commission" && rate !== null && rate !== undefined ? (
        <Notice>{`You are under fixed commission. Rate ${rate}%.`}</Notice>
      ) : null}
    </View>
  );

  const listProps = {
    header,
    onRefresh: () => {
      shop.refetch();
      settings.refetch();
    },
    contentTop: insets.top + 12,
    contentBottom: insets.bottom + 24,
  };

  if (tab === "withdrawals") {
    return (
      <HistoryList
        {...listProps}
        query={withdrawals}
        keyExtractor={(item) => String(item.id)}
        renderRow={(item) => <WithdrawalRow item={item} />}
        empty={{
          icon: "arrow-up-circle-outline",
          title: "No withdrawals yet",
          message: "Requests you send will show here with their status.",
        }}
      />
    );
  }

  if (tab === "commission") {
    return (
      <HistoryList
        {...listProps}
        query={commissions}
        keyExtractor={(item) => String(item.id)}
        renderRow={(item) => <CommissionRow item={item} />}
        empty={{
          icon: "pie-chart-outline",
          title: "No commission yet",
          message: "Commission on each order will show here.",
        }}
      />
    );
  }

  return (
    <HistoryList
      {...listProps}
      query={payments}
      keyExtractor={(item) => String(item.id)}
      renderRow={(item) => <PaymentRow item={item} />}
      empty={{
        icon: "wallet-outline",
        title: "No payments yet",
        message: "Payments from the platform will show here.",
      }}
    />
  );
}
