import type { ComponentProps, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Screen } from "~/components/screen";
import { ActionBar } from "~/components/ui/action-bar";
import { DemoFill } from "~/components/demo-fill";
import { ScreenHeader } from "~/components/ui/screen-header";

interface FormScreenProps {
  title: string;
  children: ReactNode;
  /** Primary action(s), pinned above the keyboard in a white bar. */
  footer?: ReactNode;
  refreshControl?: ComponentProps<typeof Screen>["refreshControl"];
  /** Demo mode: fills the form with sample data. */
  demoFill?: () => void;
}

// Pushed screen scaffold used by the vendor forms: back header, scrolling
// body, pinned action bar, keyboard avoidance.
export function FormScreen({
  title,
  children,
  footer,
  refreshControl,
  demoFill,
}: FormScreenProps) {
  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Screen className="bg-transparent" refreshControl={refreshControl}>
          <ScreenHeader title={title} back />
          <DemoFill onFill={demoFill} />
          {children}
        </Screen>
        {footer ? <ActionBar>{footer}</ActionBar> : null}
      </KeyboardAvoidingView>
    </View>
  );
}
