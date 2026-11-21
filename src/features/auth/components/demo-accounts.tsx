import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";
import { isDemoMode } from "~/demo/flag";
import { isCustomerApp } from "~/lib/config/features";
import { cn } from "~/lib/utils/helpers";

interface DemoChip {
  key: string;
  label: string;
  hint: string;
  email: string;
  password: string;
}

// The vendor app lists seller accounts, the customer app customers and riders.
function demoAccounts(): DemoChip[] {
  if (isCustomerApp) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DEMO_ACCOUNTS } =
      require("~/demo/customer") as typeof import("~/demo/customer");
    return DEMO_ACCOUNTS.map((a) => ({ ...a, key: a.persona }));
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DEMO_ACCOUNTS } = require("~/demo") as typeof import("~/demo");
  return DEMO_ACCOUNTS.map((a) => ({ ...a, key: a.kind }));
}

interface DemoAccountsProps {
  /** Fills the login form with the account's email and password. */
  onPick: (account: { email: string; password: string }) => void;
}

// Demo mode only: one chip per sample seller account, so every sign-in outcome
// (shop types, under review, suspended) is a tap away. Renders nothing in
// normal builds.
export function DemoAccounts({ onPick }: DemoAccountsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  if (!isDemoMode) return null;

  const accounts = demoAccounts();
  const active = accounts.find((account) => account.key === selected);

  return (
    <View className="gap-2 rounded-2xl border border-dashed border-primary bg-tint p-3">
      <Text className="font-sans-bold text-[13px] text-brand-text">
        Demo mode: tap an account
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {accounts.map((account) => (
          <Pressable
            key={account.key}
            accessibilityRole="button"
            onPress={() => {
              setSelected(account.key);
              onPick({ email: account.email, password: account.password });
            }}
            className={cn(
              "min-h-9 justify-center rounded-full border px-3.5",
              selected === account.key
                ? "border-primary bg-primary"
                : "border-border bg-card",
            )}
          >
            <Text
              className={cn(
                "font-sans-semibold text-[13px]",
                selected === account.key && "text-primary-foreground",
              )}
            >
              {account.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text variant="caption" tone="muted">
        {active
          ? active.hint
          : "Every account uses the same password, filled in for you."}
      </Text>
    </View>
  );
}
