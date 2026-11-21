import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Screen } from "~/components/screen";
import { ActionBar } from "~/components/ui/action-bar";
import { DemoFill } from "~/components/demo-fill";
import { ScreenHeader } from "~/components/ui/screen-header";

interface FormScreenProps {
  title: string;
  onBack?: () => void;
  children: ReactNode;
  /** Primary action(s), pinned under the scrolling form. */
  footer: ReactNode;
  /** Demo mode: fills the form with sample data. */
  demoFill?: () => void;
}

// Scaffold of the pushed create forms: back + centred title, scrolling fields,
// keyboard avoidance and a pinned action bar.
export function FormScreen({
  title,
  onBack,
  children,
  footer,
  demoFill,
}: FormScreenProps) {
  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Screen
          className="bg-transparent"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <ScreenHeader title={title} back onBack={onBack} />
          <DemoFill onFill={demoFill} />
          {children}
        </Screen>
        <ActionBar>{footer}</ActionBar>
      </KeyboardAvoidingView>
    </View>
  );
}
