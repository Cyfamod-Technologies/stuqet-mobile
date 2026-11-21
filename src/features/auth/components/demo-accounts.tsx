import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";
import { isDemoMode } from "~/demo/flag";
import { cn } from "~/lib/utils/helpers";

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

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DEMO_ACCOUNTS } = require("~/demo") as typeof import("~/demo");
  const active = DEMO_ACCOUNTS.find((account) => account.kind === selected);

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
        {DEMO_ACCOUNTS.map((account) => (
          <Pressable
            key={account.kind}
            accessibilityRole="button"
            onPress={() => {
              setSelected(account.kind);
              onPick({ email: account.email, password: account.password });
            }}
            className={cn(
              "min-h-9 justify-center rounded-full border px-3.5",
              selected === account.kind
                ? "border-primary bg-primary"
                : "border-border bg-card",
            )}
          >
            <Text
              className={cn(
                "font-sans-semibold text-[13px]",
                selected === account.kind && "text-primary-foreground",
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
