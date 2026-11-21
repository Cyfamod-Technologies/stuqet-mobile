import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DemoFill } from "~/components/demo-fill";
import { EmptyState } from "~/components/ui/empty-state";
import { ScreenHeader } from "~/components/ui/screen-header";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { isDemoMode } from "~/demo/flag";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { cn } from "~/lib/utils/helpers";
import {
  useConversations,
  useMarkThreadRead,
  useSendMessage,
  useThread,
} from "../hooks";
import type { ChatMessage } from "../types";
import { dayLabel } from "../utils";
import { MessageBubble } from "./message-bubble";

const MAX_LENGTH = 1000;

/** Splits chronological messages into day groups for the separators. */
function groupByDay(messages: ChatMessage[]) {
  const groups: { key: string; label: string; items: ChatMessage[] }[] = [];
  for (const message of messages) {
    const when = message.createdAt ?? new Date();
    const key = when.toDateString();
    const group = groups[groups.length - 1];
    if (group && group.key === key) group.items.push(message);
    else groups.push({ key, label: dayLabel(when), items: [message] });
  }
  return groups;
}

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Number(id);
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<{
    scrollToEnd: (o?: { animated?: boolean }) => void;
  } | null>(null);
  const [draft, setDraft] = useState("");

  const conversations = useConversations();
  const thread = useThread(conversationId, true);
  const shop = useShopInfo();
  const send = useSendMessage();
  useMarkThreadRead(conversationId, thread.data);

  const conversation = conversations.data?.find((c) => c.id === conversationId);
  const customerName = conversation?.name ?? "Customer";
  const messages = thread.data;
  const groups = useMemo(() => groupByDay(messages ?? []), [messages]);
  const newestId = messages?.[messages.length - 1]?.id;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [newestId]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/messages");
  };

  const text = draft.trim();
  const canSend = text.length > 0 && !send.isPending;

  const submit = () => {
    if (!canSend) return;
    const message = text;
    setDraft("");
    send.mutate(
      {
        conversationId,
        message,
        sellerId: shop.data?.user_id ?? null,
      },
      // Give the text back so a failed send is not lost.
      { onError: () => setDraft((current) => current || message) },
    );
  };

  let body;
  if (thread.isPending) {
    body = (
      <View className="gap-3.5">
        <Skeleton className="h-12 w-56 self-start rounded-[20px]" />
        <Skeleton className="h-12 w-48 self-end rounded-[20px]" />
        <Skeleton className="h-12 w-64 self-start rounded-[20px]" />
      </View>
    );
  } else if (thread.isError) {
    body = (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load this chat"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => thread.refetch()}
      />
    );
  } else if (groups.length === 0) {
    body = (
      <EmptyState
        icon="chatbubble-ellipses-outline"
        title="No messages yet"
        message="Say hello to start the conversation."
      />
    );
  } else {
    body = (
      <View className="gap-3.5">
        {groups.map((group) => (
          <View key={group.key} className="gap-3.5">
            <Text
              variant="caption"
              className="text-center font-sans-bold"
              tone="muted"
            >
              {group.label}
            </Text>
            {group.items.map((message) => (
              <MessageBubble
                key={message.pending ? "pending" : message.id}
                message={message}
                customerName={customerName}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className="gap-3.5 px-5 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <ScreenHeader back title={customerName} onBack={goBack} />
        {conversation?.title ? (
          <View className="flex-row items-center gap-3 rounded-[20px] border border-border bg-card px-3.5 py-2.5">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] border border-tint-border bg-tint">
              <Ionicons
                name="pricetag-outline"
                size={18}
                color={colors["brand-text"]}
              />
            </View>
            <View className="min-w-0 flex-1 gap-px">
              <Text
                variant="caption"
                className="font-sans-bold uppercase tracking-wider"
              >
                About
              </Text>
              <Text
                className="font-sans-extrabold text-base leading-[22px]"
                numberOfLines={1}
              >
                {conversation.title}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <ScrollView
        ref={(node) => {
          scrollRef.current = node;
        }}
        className="flex-1"
        contentContainerClassName="px-5 pb-4 pt-1"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        {body}
      </ScrollView>

      {isDemoMode ? (
        <View className="px-4 pb-2">
          <DemoFill
            label="Fill sample reply"
            onFill={
              process.env.EXPO_PUBLIC_DEMO_MODE === "true"
                ? () => {
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    const samples =
                      require("~/demo/samples") as typeof import("~/demo/samples");
                    setDraft(samples.replySample());
                  }
                : undefined
            }
          />
        </View>
      ) : null}

      <View
        className="flex-row items-center gap-2.5 border-t border-border bg-card px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type your reply"
          placeholderTextColor={colors.hint}
          accessibilityLabel="Reply"
          maxLength={MAX_LENGTH}
          multiline
          returnKeyType="default"
          className="max-h-28 min-h-12 min-w-0 flex-1 rounded-3xl border border-border bg-field px-[18px] py-3 font-sans-medium text-base text-foreground"
        />
        <Pressable
          onPress={submit}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send reply"
          accessibilityState={{ disabled: !canSend }}
          className={cn(
            "h-12 w-12 items-center justify-center rounded-full bg-primary active:opacity-90",
            !canSend && "opacity-40",
          )}
        >
          <Ionicons
            name="send"
            size={20}
            color={colors["primary-foreground"]}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
