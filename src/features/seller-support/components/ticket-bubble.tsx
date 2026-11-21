import { Image, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOWS } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import type { TicketMessage } from "../types";
import { formatMessageTime } from "../utils";

// Seller messages sit right on the brand tint, Stuqet support sits left on
// white (Ticket board). Photos show under the text.
export function TicketBubble({ message }: { message: TicketMessage }) {
  const mine = !message.from_support;
  const sender = mine ? null : (message.sender_name ?? "Stuqet support");
  const time = formatMessageTime(message.created_at);

  return (
    <View
      className={cn(
        "max-w-[290px] gap-1",
        mine ? "items-end self-end" : "self-start",
      )}
    >
      <View
        style={mine ? undefined : SHADOWS.field}
        className={cn(
          "gap-2 border px-4 py-3",
          mine
            ? "rounded-[20px] rounded-br-[6px] border-tint-border bg-tint-deep"
            : "rounded-[20px] rounded-bl-[6px] border-border bg-card",
        )}
      >
        {message.body ? (
          <Text className="font-sans-medium text-base leading-[22px]">
            {message.body}
          </Text>
        ) : null}
        {message.attachments.map((uri) => (
          <Image
            key={uri}
            source={{ uri }}
            resizeMode="cover"
            accessibilityLabel="Attached photo"
            className="h-40 w-full rounded-2xl bg-muted"
          />
        ))}
      </View>
      <Text variant="caption" className="font-sans-semibold">
        {sender ? `${sender} · ${time}` : time}
      </Text>
    </View>
  );
}
