import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOWS } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import type { ChatMessage } from "../types";
import { clockTime } from "../utils";

interface MessageBubbleProps {
  message: ChatMessage;
  customerName: string;
}

// Customer bubbles sit left on white; the seller's sit right on the brand tint.
export function MessageBubble({ message, customerName }: MessageBubbleProps) {
  const { mine } = message;
  const time = message.pending ? "Sending…" : clockTime(message.createdAt);

  return (
    <View
      className={cn(
        "max-w-[80%] gap-1",
        mine ? "items-end self-end" : "self-start",
      )}
    >
      <View
        style={mine ? undefined : SHADOWS.field}
        className={cn(
          "border px-4 py-3",
          mine
            ? "rounded-[20px] rounded-br-[6px] border-tint-border bg-tint"
            : "rounded-[20px] rounded-bl-[6px] border-border bg-card",
          message.pending && "opacity-70",
        )}
      >
        <Text className="font-sans-medium text-base leading-[22px]">
          {message.text}
        </Text>
      </View>
      <Text variant="caption" className="font-sans-semibold">
        {mine ? "You" : customerName}
        {time ? ` · ${time}` : ""}
      </Text>
    </View>
  );
}
