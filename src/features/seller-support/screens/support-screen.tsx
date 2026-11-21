import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionBar } from "~/components/ui/action-bar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Text } from "~/components/ui/text";
import { HistoryList } from "~/features/seller-money/components/history-list";
import { useThemeColors } from "~/lib/colors";
import { useTickets } from "../hooks";
import type { TicketSummary } from "../types";
import {
  STATUS_BADGE,
  STATUS_LABEL,
  formatTicketDate,
  toStatus,
} from "../utils";
import { SupportGate } from "../components/support-gate";

function TicketRow({ ticket }: { ticket: TicketSummary }) {
  const router = useRouter();
  const colors = useThemeColors();
  const status = toStatus(ticket.status);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(tabs)/more/support/[id]",
          params: { id: String(ticket.id) },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`${ticket.subject}, ${STATUS_LABEL[status]}`}
      className="min-h-[72px] flex-row items-center gap-3 px-4 py-3 active:bg-muted"
    >
      <View className="min-w-0 flex-1 gap-[3px]">
        <Text
          variant="heading"
          className="text-base leading-5"
          numberOfLines={2}
        >
          {ticket.subject}
        </Text>
        <Text variant="caption" className="font-sans-medium text-[13px]">
          {`#${ticket.code} · ${formatTicketDate(ticket.created_at)}`}
        </Text>
      </View>
      <Badge label={STATUS_LABEL[status]} variant={STATUS_BADGE[status]} />
      <Ionicons name="chevron-forward" size={20} color={colors.hint} />
    </Pressable>
  );
}

// "Support tickets": the seller's tickets, newest first, with a pinned
// "Create a ticket" button. Needs the TODO(backend) endpoints (see api.ts).
function SupportList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tickets = useTickets();

  return (
    <View className="flex-1">
      <HistoryList
        query={tickets}
        header={
          <View className="gap-4">
            <ScreenHeader title="Support tickets" back />
            <Text variant="title" className="text-[19px] leading-6">
              Your tickets
            </Text>
          </View>
        }
        keyExtractor={(item) => String(item.id)}
        renderRow={(item) => <TicketRow ticket={item} />}
        empty={{
          icon: "headset-outline",
          title: "No tickets yet",
          message: "Need a hand? Create a ticket and we will reply here.",
        }}
        contentTop={insets.top + 12}
        contentBottom={24}
      />
      <ActionBar>
        <Button onPress={() => router.push("/(tabs)/more/support/new")}>
          Create a ticket
        </Button>
      </ActionBar>
    </View>
  );
}

export function SupportScreen() {
  return (
    <SupportGate>
      <SupportList />
    </SupportGate>
  );
}
