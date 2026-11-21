import { Pressable, View } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils/helpers";
import type { ConversationPreview } from "../hooks";
import { shortTimeAgo } from "../utils";
import { CustomerAvatar } from "./customer-avatar";

interface ConversationRowProps {
  preview: ConversationPreview;
  last: boolean;
  onPress: (conversationId: number) => void;
}

export function ConversationRow({
  preview,
  last,
  onPress,
}: ConversationRowProps) {
  const { conversation, last: lastMessage, unread } = preview;
  const time = shortTimeAgo(lastMessage?.createdAt ?? null);
  const snippet = lastMessage
    ? `${lastMessage.mine ? "You: " : ""}${lastMessage.text}`
    : null;

  return (
    <Pressable
      onPress={() => onPress(conversation.id)}
      accessibilityRole="button"
      accessibilityLabel={`${unread ? "Unread. " : ""}${conversation.name}. ${snippet ?? ""} ${time}`}
      className={cn(
        "min-h-[80px] flex-row items-center gap-3 px-4 py-3 active:bg-muted",
        !last && "border-b border-border",
      )}
    >
      <CustomerAvatar name={conversation.name} uri={conversation.image} />
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className={cn(
              "min-w-0 flex-1 text-base leading-[22px]",
              unread ? "font-sans-extrabold" : "font-sans-bold",
            )}
            numberOfLines={1}
          >
            {conversation.name}
          </Text>
          {time ? (
            <Text variant="caption" className="font-sans-semibold">
              {time}
            </Text>
          ) : null}
        </View>
        {snippet ? (
          <Text
            className={cn(
              "text-sm leading-[19px]",
              unread
                ? "font-sans-semibold text-foreground"
                : "font-sans-medium text-muted-foreground",
            )}
            numberOfLines={1}
          >
            {snippet}
          </Text>
        ) : (
          <Skeleton className="h-3.5 w-40" />
        )}
        {conversation.title ? (
          <Text
            className="font-sans-bold text-xs leading-4 text-brand-text"
            numberOfLines={1}
          >
            {conversation.title}
          </Text>
        ) : null}
      </View>
      {unread ? (
        <View
          accessibilityRole="image"
          accessibilityLabel="Unread"
          className="h-2.5 w-2.5 rounded-full bg-primary"
        />
      ) : (
        <View className="w-2.5" />
      )}
    </Pressable>
  );
}

export function ConversationRowSkeleton({ last }: { last: boolean }) {
  return (
    <View
      className={cn(
        "min-h-[80px] flex-row items-center gap-3 px-4 py-3",
        !last && "border-b border-border",
      )}
    >
      <Skeleton className="h-11 w-11 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3.5 w-48" />
      </View>
    </View>
  );
}
