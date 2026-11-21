import { useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "~/components/screen";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Text } from "~/components/ui/text";
import { useThemeColors } from "~/lib/colors";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { useConversationPreviews, useConversations } from "../hooks";
import { ConversationRow, ConversationRowSkeleton } from "./conversation-row";

// Customer chats. The API has no push or websocket for chat: the list refetches
// on a timer and on pull-to-refresh.
export function MessagesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const query = useConversations();
  const conversations = useMemo(() => query.data ?? [], [query.data]);
  const previews = useConversationPreviews(conversations);
  const [pulling, setPulling] = useState(false);

  const unreadCount = previews.filter((p) => p.unread).length;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/more");
  };

  const refresh = async () => {
    setPulling(true);
    try {
      await query.refetch();
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seller.messages.all,
      });
    } finally {
      setPulling(false);
    }
  };

  let body;
  if (query.isPending) {
    body = (
      <Card className="overflow-hidden p-0">
        {[0, 1, 2, 3].map((i) => (
          <ConversationRowSkeleton key={i} last={i === 3} />
        ))}
      </Card>
    );
  } else if (query.isError) {
    body = (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load messages"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => query.refetch()}
      />
    );
  } else if (conversations.length === 0) {
    body = (
      <EmptyState
        icon="chatbubbles-outline"
        title="No messages yet"
        message="When a customer messages you about a product, the chat shows up here."
      />
    );
  } else {
    body = (
      <>
        <Card className="overflow-hidden p-0">
          {previews.map((preview, index) => (
            <ConversationRow
              key={preview.conversation.id}
              preview={preview}
              last={index === previews.length - 1}
              onPress={(id) =>
                router.push({
                  pathname: "/messages/[id]",
                  params: { id: String(id) },
                })
              }
            />
          ))}
        </Card>
        <Text className="font-sans-medium text-[13px] leading-[18px] text-muted-foreground">
          New messages show when you open this screen. Pull down to refresh;
          there are no push alerts for messages.
        </Text>
      </>
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          onRefresh={refresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader back title="Messages" onBack={goBack} />
      {query.data && conversations.length > 0 ? (
        <Text
          tone="muted"
          className="text-center font-sans-bold text-sm"
          accessibilityLiveRegion="polite"
        >
          {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
        </Text>
      ) : null}
      <View className="gap-4">{body}</View>
    </Screen>
  );
}
