import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "~/components/screen";
import { ActionBar } from "~/components/ui/action-bar";
import { Button } from "~/components/ui/button";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import {
  LAST_UPDATED_PLACEHOLDER,
  LEGAL_TEXT_PLACEHOLDER,
  PRIVACY,
  TERMS,
  type LegalDocument,
} from "../content";

// Grey bars that stand in for the paragraphs until the real text arrives.
const PLACEHOLDER_LINES = ["w-full", "w-[92%]", "w-[96%]", "w-[58%]"] as const;

function LegalScreen({ document }: { document: LegalDocument }) {
  const router = useRouter();
  const colors = useThemeColors();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromRegistration = from === "registration";

  return (
    <View className="flex-1">
      <Screen className="bg-transparent" contentContainerStyle={{ gap: 18 }}>
        <ScreenHeader title={document.title} back />

        <View className="flex-row items-start gap-2.5 rounded-2xl border border-tint-border bg-tint px-3.5 py-3">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors["brand-text"]}
          />
          <Text className="min-w-0 flex-1 font-sans-semibold text-sm leading-5">
            Placeholder screen. Stuqet supplies the final wording; the section
            headings are placeholders too.
          </Text>
        </View>

        <Text variant="caption" className="font-sans-semibold text-[13px]">
          {`Last updated: ${LAST_UPDATED_PLACEHOLDER}`}
        </Text>

        {document.sections.map((heading, index) => (
          <View key={heading} className="gap-2">
            <Text
              variant="heading"
              className="font-sans-extrabold"
              accessibilityRole="header"
            >
              {`${index + 1}. ${heading}`}
            </Text>
            <Text className="font-sans-bold text-[15px] leading-[22px] text-muted-foreground">
              {LEGAL_TEXT_PLACEHOLDER}
            </Text>
            <View
              className="gap-[7px]"
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              {PLACEHOLDER_LINES.map((width) => (
                <View
                  key={width}
                  className={`h-2 rounded-full bg-border ${width}`}
                />
              ))}
            </View>
          </View>
        ))}
      </Screen>

      <ActionBar>
        <Button onPress={() => router.back()}>
          {fromRegistration ? "Back to registration" : "Done"}
        </Button>
      </ActionBar>
    </View>
  );
}

export function TermsScreen() {
  return <LegalScreen document={TERMS} />;
}

export function PrivacyScreen() {
  return <LegalScreen document={PRIVACY} />;
}
